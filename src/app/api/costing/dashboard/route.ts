import { NextResponse } from "next/server";
import {
  getOrders,
  getProductCosts,
  getOrderCostSnapshots,
  getCostingSettings,
  getProducts,
} from "@/lib/db";
import { calculateProfitMetrics, createLineItemCostSnapshot } from "@/lib/costing-engine";
import type { OrderLineCostSnapshot } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30days"; // today, yesterday, 7days, 30days, this_month, all

    const [orders, productCosts, existingSnapshots, settings, allProducts] = await Promise.all([
      getOrders(),
      getProductCosts(),
      getOrderCostSnapshots(),
      getCostingSettings(),
      getProducts(),
    ]);

    const costMap = new Map(productCosts.map((c) => [c.productId, c]));
    const snapshotMap = new Map<string, OrderLineCostSnapshot[]>();
    existingSnapshots.forEach((s) => {
      const list = snapshotMap.get(s.orderId) || [];
      list.push(s);
      snapshotMap.set(s.orderId, list);
    });

    // Date range cutoff
    const now = new Date();
    let startDate = new Date(0); // all
    if (range === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "yesterday") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (range === "7days") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "this_month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredOrders = orders.filter((o) => {
      if (o.status === "Cancelled" || o.status === "Returned") return false;
      const d = new Date(o.date);
      return d >= startDate;
    });

    let totalGrossSales = 0;
    let totalCOGS = 0;
    let missingCostOrderLinesCount = 0;

    // Daily breakdown map for chart
    const dailyMap: Record<string, { date: string; sales: number; cogs: number; profit: number }> = {};

    // Product-wise aggregation
    const productStatsMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        unitsSold: number;
        revenue: number;
        cogs: number;
        grossProfit: number;
        unitCost: number;
        sellingPrice: number;
        isCostMissing: boolean;
      }
    >();

    // Process every order
    for (const order of filteredOrders) {
      totalGrossSales += order.total;
      const orderDateKey = order.date.slice(0, 10);
      if (!dailyMap[orderDateKey]) {
        dailyMap[orderDateKey] = { date: orderDateKey, sales: 0, cogs: 0, profit: 0 };
      }
      dailyMap[orderDateKey].sales += order.total;

      // Use immutable snapshot if available, otherwise fallback dynamically
      let orderSnapshots = snapshotMap.get(order.id);
      if (!orderSnapshots || orderSnapshots.length === 0) {
        orderSnapshots = (order.items || []).map((item) =>
          createLineItemCostSnapshot(order.id, order.date, item, costMap.get(item.id))
        );
      }

      for (const snap of orderSnapshots) {
        if (snap.costStatus === "cost_missing") {
          missingCostOrderLinesCount++;
        } else {
          totalCOGS += snap.totalCOGS;
          dailyMap[orderDateKey].cogs += snap.totalCOGS;
          dailyMap[orderDateKey].profit += snap.grossProfit;
        }

        const stat = productStatsMap.get(snap.productId) || {
          productId: snap.productId,
          productName: snap.productName,
          unitsSold: 0,
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          unitCost: snap.unitCost,
          sellingPrice: snap.unitSellingPrice,
          isCostMissing: snap.costStatus === "cost_missing",
        };

        stat.unitsSold += snap.quantity;
        stat.revenue += snap.totalSale;
        stat.cogs += snap.totalCOGS;
        stat.grossProfit += snap.grossProfit;
        productStatsMap.set(snap.productId, stat);
      }
    }

    const estimatedGrossProfit = Math.round((totalGrossSales - totalCOGS) * 100) / 100;
    const overallGrossMargin =
      totalGrossSales > 0 ? Math.round(((estimatedGrossProfit / totalGrossSales) * 100) * 100) / 100 : 0;

    // Contribution profit deductions: payment gateway fees & variable shipping
    const gatewayFees = Math.round((totalGrossSales * (settings.paymentGatewayFeePercent / 100)) * 100) / 100;
    const estimatedContributionProfit = Math.max(0, Math.round((estimatedGrossProfit - gatewayFees) * 100) / 100);

    // Sorted products list
    const productRankings = Array.from(productStatsMap.values()).map((p) => {
      const margin = p.revenue > 0 ? Math.round(((p.grossProfit / p.revenue) * 100) * 10) / 10 : 0;
      return {
        ...p,
        marginPercent: margin,
      };
    });

    const mostProfitable = [...productRankings].sort((a, b) => b.grossProfit - a.grossProfit).slice(0, 5);
    const highRevLowMargin = productRankings.filter((p) => p.marginPercent > 0 && p.marginPercent < 30);
    const lossMaking = productRankings.filter((p) => p.grossProfit < 0);

    // Products catalog check for missing costs
    const productsMissingCost = allProducts.filter((p) => {
      const c = costMap.get(p.id);
      return !c || c.totalUnitCost <= 0;
    });

    // Chart daily array sorted by date
    const chartData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      range,
      totalOrdersCount: filteredOrders.length,
      totalGrossSales,
      totalCOGS: Math.round(totalCOGS * 100) / 100,
      estimatedGrossProfit,
      overallGrossMargin,
      estimatedContributionProfit,
      gatewayFees,
      missingCostOrderLinesCount,
      chartData,
      mostProfitable,
      highRevLowMargin,
      lossMaking,
      productsMissingCost: productsMissingCost.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        weight: p.weight,
        category: p.category,
      })),
      configuredProductsCount: productCosts.filter((c) => c.totalUnitCost > 0).length,
      totalProductsCount: allProducts.length,
    });
  } catch (error) {
    console.error("Error generating costing dashboard:", error);
    return NextResponse.json({ error: "Failed to load costing dashboard" }, { status: 500 });
  }
}
