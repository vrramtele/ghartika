"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  weight: string;
  category: string;
  image: string;
  badge?: string;
  description: string;
  isCombo?: boolean;
  comboItems?: string[];
};

type ProductContextType = {
  products: Product[];
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, updatedData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load products from server on mount
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const addProduct = async (product: Omit<Product, "id">): Promise<void> => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to add product");
    const newProduct: Product = await res.json();
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = async (
    id: string,
    updatedData: Partial<Product>
  ): Promise<void> => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) throw new Error("Failed to update product");
    const updated: Product = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete product");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getProductById = (id: string): Product | undefined =>
    products.find((p) => p.id === id);

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
