import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Truck, Plus, Search, Eye, Mail, Phone, Star } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  outstandingOrders: number;
  rating: number;
  status: "active" | "inactive";
}

const suppliers: Supplier[] = [
  { id: "SUP-001", name: "TechParts Inc.", email: "orders@techparts.com", phone: "+1 234 567 1001", totalOrders: 45, totalSpent: 125000, outstandingOrders: 2, rating: 4.8, status: "active" },
  { id: "SUP-002", name: "Global Electronics", email: "sales@globalelec.com", phone: "+1 234 567 1002", totalOrders: 32, totalSpent: 89000, outstandingOrders: 1, rating: 4.5, status: "active" },
  { id: "SUP-003", name: "AccessoryWorld", email: "bulk@accessworld.com", phone: "+1 234 567 1003", totalOrders: 28, totalSpent: 45000, outstandingOrders: 0, rating: 4.7, status: "active" },
  { id: "SUP-004", name: "DigitalGoods Ltd", email: "b2b@digitalgoods.com", phone: "+1 234 567 1004", totalOrders: 15, totalSpent: 67000, outstandingOrders: 1, rating: 4.2, status: "active" },
  { id: "SUP-005", name: "PrimeTech Supply", email: "orders@primetech.com", phone: "+1 234 567 1005", totalOrders: 8, totalSpent: 23000, outstandingOrders: 0, rating: 3.9, status: "inactive" },
];

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const totalPurchased = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);
  const outstandingOrders = suppliers.reduce((sum, s) => sum + s.outstandingOrders, 0);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-warning text-warning"
                : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">{rating}</span>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Supplier Management"
      subtitle="Manage supplier relationships and purchase history"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Suppliers</p>
              <p className="text-2xl font-bold text-foreground">{totalSuppliers}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Truck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
              <p className="text-2xl font-bold text-foreground">{activeSuppliers}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <Truck className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Purchased</p>
              <p className="text-2xl font-bold text-foreground">${(totalPurchased / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20">
              <Truck className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Orders</p>
              <p className="text-2xl font-bold text-foreground">{outstandingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="glass-card">
        <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Outstanding</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent font-semibold">
                        {supplier.name.split(" ")[0][0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {supplier.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </div>
                    </div>
                  </td>
                  <td className="text-foreground">{supplier.totalOrders}</td>
                  <td className="font-semibold text-foreground">${supplier.totalSpent.toLocaleString()}</td>
                  <td>
                    <span className={supplier.outstandingOrders > 0 ? "text-warning font-medium" : "text-muted-foreground"}>
                      {supplier.outstandingOrders}
                    </span>
                  </td>
                  <td>{renderStars(supplier.rating)}</td>
                  <td>
                    <span className={supplier.status === "active" ? "badge-success" : "badge-warning"}>
                      {supplier.status}
                    </span>
                  </td>
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
    </DashboardLayout>
  );
}
