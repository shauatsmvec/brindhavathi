import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Truck, Plus, Search, Eye, CheckCircle, Clock, Package } from "lucide-react";

interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  expectedDelivery: string;
  items: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-2024-001", supplier: "TechParts Inc.", date: "2024-01-10", expectedDelivery: "2024-01-20", items: 50, total: 4500.00, status: "delivered" },
  { id: "PO-2024-002", supplier: "Global Electronics", date: "2024-01-12", expectedDelivery: "2024-01-22", items: 30, total: 2850.00, status: "shipped" },
  { id: "PO-2024-003", supplier: "AccessoryWorld", date: "2024-01-14", expectedDelivery: "2024-01-24", items: 100, total: 1200.00, status: "confirmed" },
  { id: "PO-2024-004", supplier: "DigitalGoods Ltd", date: "2024-01-15", expectedDelivery: "2024-01-25", items: 25, total: 3750.00, status: "pending" },
  { id: "PO-2024-005", supplier: "TechParts Inc.", date: "2024-01-15", expectedDelivery: "2024-01-25", items: 40, total: 3600.00, status: "pending" },
];

const suppliers = [
  { name: "TechParts Inc.", orders: 45, totalSpent: 125000, rating: 4.8 },
  { name: "Global Electronics", orders: 32, totalSpent: 89000, rating: 4.5 },
  { name: "AccessoryWorld", orders: 28, totalSpent: 45000, rating: 4.7 },
  { name: "DigitalGoods Ltd", orders: 15, totalSpent: 67000, rating: 4.2 },
];

export default function Procurement() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "delivered":
        return <span className="badge-success">Delivered</span>;
      case "shipped":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info/20 text-info">Shipped</span>;
      case "confirmed":
        return <span className="badge-success">Confirmed</span>;
      case "pending":
        return <span className="badge-warning">Pending</span>;
      case "cancelled":
        return <span className="badge-danger">Cancelled</span>;
    }
  };

  const getStatusIcon = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-info" />;
      case "confirmed":
      case "pending":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout
      title="Procurement"
      subtitle="Manage purchase orders and supplier relationships"
    >
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <p className="text-2xl font-bold text-foreground">
                {purchaseOrders.filter((p) => p.status !== "delivered" && p.status !== "cancelled").length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/20">
              <Package className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Transit</p>
              <p className="text-2xl font-bold text-foreground">
                {purchaseOrders.filter((p) => p.status === "shipped").length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold text-foreground">
                {purchaseOrders.filter((p) => p.status === "delivered").length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Total</p>
              <p className="text-2xl font-bold text-foreground">
                ${purchaseOrders.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Purchase Orders */}
        <div className="lg:col-span-2">
          <div className="glass-card">
            <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <button className="btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Supplier</th>
                    <th>Expected</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono font-medium text-primary">{order.id}</td>
                      <td className="font-medium text-foreground">{order.supplier}</td>
                      <td className="text-muted-foreground">{order.expectedDelivery}</td>
                      <td className="text-muted-foreground">{order.items}</td>
                      <td className="font-semibold text-foreground">${order.total.toFixed(2)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <button className="btn-ghost p-2">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Top Suppliers</h3>
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.name}
                className="rounded-lg bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{supplier.name}</h4>
                  <div className="flex items-center gap-1 text-warning">
                    <span className="text-sm font-medium">★ {supplier.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Orders:</span>
                    <span className="ml-1 text-foreground">{supplier.orders}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spent:</span>
                    <span className="ml-1 text-foreground">${(supplier.totalSpent / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
