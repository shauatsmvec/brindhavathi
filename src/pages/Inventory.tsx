import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Package, Plus, Search, Filter, Edit, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

const products: Product[] = [
  { id: "1", name: "Wireless Bluetooth Headphones", sku: "WBH-001", category: "Electronics", price: 79.99, cost: 35.00, stock: 89, minStock: 20, status: "in-stock" },
  { id: "2", name: "Smart Watch Pro", sku: "SWP-002", category: "Electronics", price: 199.99, cost: 85.00, stock: 45, minStock: 30, status: "in-stock" },
  { id: "3", name: "USB-C Fast Charger", sku: "UFC-003", category: "Accessories", price: 24.99, cost: 8.00, stock: 234, minStock: 50, status: "in-stock" },
  { id: "4", name: "Portable Power Bank", sku: "PPB-004", category: "Accessories", price: 39.99, cost: 15.00, stock: 12, minStock: 25, status: "low-stock" },
  { id: "5", name: "Wireless Mouse", sku: "WM-005", category: "Peripherals", price: 34.99, cost: 12.00, stock: 167, minStock: 40, status: "in-stock" },
  { id: "6", name: "Mechanical Keyboard", sku: "MK-006", category: "Peripherals", price: 89.99, cost: 40.00, stock: 0, minStock: 15, status: "out-of-stock" },
  { id: "7", name: "HD Webcam", sku: "HDW-007", category: "Electronics", price: 59.99, cost: 25.00, stock: 8, minStock: 10, status: "low-stock" },
  { id: "8", name: "Laptop Stand", sku: "LS-008", category: "Accessories", price: 44.99, cost: 18.00, stock: 56, minStock: 20, status: "in-stock" },
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "in-stock":
        return <span className="badge-success">In Stock</span>;
      case "low-stock":
        return <span className="badge-warning">Low Stock</span>;
      case "out-of-stock":
        return <span className="badge-danger">Out of Stock</span>;
    }
  };

  return (
    <DashboardLayout
      title="Inventory Management"
      subtitle="Track and manage your product stock levels"
    >
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Package className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold text-foreground">
                {products.filter((p) => p.status === "in-stock").length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20">
              <Package className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-foreground">
                {products.filter((p) => p.status === "low-stock").length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20">
              <Package className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-foreground">
                {products.filter((p) => p.status === "out-of-stock").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field w-40"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-muted-foreground">{product.sku}</td>
                  <td className="text-muted-foreground">{product.category}</td>
                  <td className="font-medium text-foreground">${product.price.toFixed(2)}</td>
                  <td className="text-muted-foreground">${product.cost.toFixed(2)}</td>
                  <td>
                    <span className={product.stock <= product.minStock ? "text-warning" : "text-foreground"}>
                      {product.stock}
                    </span>
                    <span className="text-muted-foreground"> / {product.minStock} min</span>
                  </td>
                  <td>{getStatusBadge(product.status)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost p-2">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="btn-ghost p-2 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
