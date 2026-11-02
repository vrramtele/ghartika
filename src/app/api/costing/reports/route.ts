import { NextResponse } from "next/server";
import {
  getOrders,
  getProductCosts,
  getOrderCostSnapshots,
  getCostHistory,
  getProducts,
} from "@/lib/db";
import { createLineItemCostSnapshot } from "@/lib/costing-engine";
import type { OrderLineCostSnapshot } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "products"; // products, orders, history
    const format = searchParams.get("format"); // "csv" or json

    const [orders, productCosts, existingSnapshots, allProducts, history] = await Promise.all([
      getOrders(),
      getProductCosts(),
      getOrderCostSnapshots(),
      getProducts(),
      getCostHistory(),
    ]);

    const costMap = new Map(productCosts.map((c) => [c.productId, c]));
    const snapshotMap = new Map<string, OrderLineCostSnapshot[]>();
    existingSnapshots.forEach((s) => {
      const list = snapshotMap.get(s.orderId) || [];
      list.push(s);
      snapshotMap.set(s.orderId, list);
    });

    if (type === "orders") {
      const orderReports = orders.map((order) => {
        let snapshots = snapshotMap.get(order.id);
        if (!snapshots || snapshots.length === 0) {
          snapshots = (order.items || []).map((item) =>
            createLineItemCostSnapshot(order.id, order.date, item, costMap.get(item.id))
          );
        }

        const totalCOGS = snapshots.reduce((sum, s) => sum + s.totalCOGS, 0);
        const grossProfit = Math.round((order.total - totalCOGS) * 100) / 100;
        const marginPercent =
          order.total > 0 ? Math.round(((grossProfit / order.total) * 100) * 10) / 10 : 0;
        const hasMissingCost = snapshots.some((s) => s.costStatus === "cost_missing");

        return {
          orderId: order.id,
          date: order.date,
          customerName: order.customer.name,
          city: order.customer.city,
          itemsCount: order.items.reduce((s, i) => s + i.quantity, 0),
          totalRevenue: order.total,
          totalCOGS,
          grossProfit,
          marginPercent,
          status: order.status,
          paymentMethod: order.paymentMethod || "COD",
          hasMissingCost,
        };
      });

      if (format === "csv") {
        const headers = ["Order ID", "Date", "Customer", "City", "Items", "Revenue (INR)", "COGS (INR)", "Gross Profit (INR)", "Margin %", "Status", "Payment"];
        const rows = orderReports.map((r) => [
          r.orderId,
          r.date.slice(0, 10),
          `"${r.customerName.replace(/"/g, '""')}"`,
          `"${r.city}"`,
          r.itemsCount,
          r.totalRevenue,
          r.totalCOGS,
          r.grossProfit,
          `${r.marginPercent}%`,
          r.status,
          r.paymentMethod,
        ]);
        const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="ghartika-order-profits-${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        });
      }

      return NextResponse.json(orderReports);
    }

    if (type === "history") {
      if (format === "csv") {
        const headers = ["Date", "Product", "Variant", "Method", "Previous Cost", "New Cost", "Selling Price", "Reason", "Changed By"];
        const rows = history.map((h) => [
          h.timestamp.slice(0, 10),
          `"${h.productName.replace(/"/g, '""')}"`,
          h.variantSize,
          h.costingMethod,
          h.previousUnitCost,
          h.newUnitCost,
          h.sellingPrice,
          `"${(h.changeReason || "").replace(/"/g, '""')}"`,
          h.changedBy,
        ]);
        const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="ghartika-cost-history-${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        });
      }
      return NextResponse.json(history);
    }

    // Default: products profitability
    const productStats = allProducts.map((p) => {
      const costConfig = costMap.get(p.id);
      const unitCost = costConfig ? costConfig.totalUnitCost : 0;
      const costingMethod = costConfig ? costConfig.costingMethod : (p.isCombo ? "combo" : "ready_product");

      // Aggregate sold units
      let unitsSold = 0;
      let revenue = 0;
      orders.forEach((o) => {
        if (o.status !== "Cancelled" && o.status !== "Returned") {
          o.items.forEach((item) => {
            if (item.id === p.id) {
              unitsSold += item.quantity;
              revenue += item.price * item.quantity;
            }
          });
        }
      });

      const totalCOGS = Math.round(unitsSold * unitCost * 100) / 100;
      const unitProfit = Math.round((p.price - unitCost) * 100) / 100;
      const grossProfit = Math.round((revenue - totalCOGS) * 100) / 100;
      const marginPercent =
        p.price > 0 && unitCost > 0 ? Math.round(((unitProfit / p.price) * 100) * 10) / 10 : 0;
      const markupPercent =
        unitCost > 0 ? Math.round(((unitProfit / unitCost) * 100) * 10) / 10 : 0;

      return {
        productId: p.id,
        name: p.name,
        category: p.category,
        weight: p.weight,
        costingMethod,
        unitCost,
        sellingPrice: p.price,
        unitProfit,
        marginPercent,
        markupPercent,
        unitsSold,
        totalRevenue: revenue,
        totalCOGS,
        grossProfit,
        isCostMissing: unitCost <= 0,
      };
    });

    if (format === "csv") {
      const headers = ["Product ID", "Name", "Category", "Size", "Method", "Unit Cost (INR)", "Selling Price (INR)", "Unit Profit (INR)", "Margin %", "Markup %", "Units Sold", "Total Revenue (INR)", "Total COGS (INR)", "Gross Profit (INR)"];
      const rows = productStats.map((r) => [
        r.productId,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        r.weight,
        r.costingMethod,
        r.unitCost,
        r.sellingPrice,
        r.unitProfit,
        `${r.marginPercent}%`,
        `${r.markupPercent}%`,
        r.unitsSold,
        r.totalRevenue,
        r.totalCOGS,
        r.grossProfit,
      ]);
      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ghartika-product-profitability-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json(productStats);
  } catch (error) {
    console.error("Error generating costing report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
