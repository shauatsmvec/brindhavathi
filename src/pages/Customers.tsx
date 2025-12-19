import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Plus, Search, Eye, Mail, Phone } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchase: string;
  status: "active" | "inactive";
}

const customers: Customer[] = [
  { id: "CUS-001", name: "John Smith", email: "john.smith@email.com", phone: "+1 234 567 8901", totalOrders: 24, totalSpent: 4520.50, lastPurchase: "2024-01-15", status: "active" },
  { id: "CUS-002", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 234 567 8902", totalOrders: 18, totalSpent: 3250.00, lastPurchase: "2024-01-14", status: "active" },
  { id: "CUS-003", name: "Mike Wilson", email: "mike.w@email.com", phone: "+1 234 567 8903", totalOrders: 31, totalSpent: 6780.25, lastPurchase: "2024-01-13", status: "active" },
  { id: "CUS-004", name: "Emily Brown", email: "emily.b@email.com", phone: "+1 234 567 8904", totalOrders: 8, totalSpent: 1290.00, lastPurchase: "2024-01-10", status: "active" },
  { id: "CUS-005", name: "David Lee", email: "david.l@email.com", phone: "+1 234 567 8905", totalOrders: 5, totalSpent: 850.75, lastPurchase: "2023-12-20", status: "inactive" },
  { id: "CUS-006", name: "Lisa Anderson", email: "lisa.a@email.com", phone: "+1 234 567 8906", totalOrders: 42, totalSpent: 8920.00, lastPurchase: "2024-01-15", status: "active" },
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <DashboardLayout
      title="Customer Management"
      subtitle="Track customer relationships and purchase history"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="text-2xl font-bold text-foreground">{activeCustomers}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/20">
              <Users className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">${avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-card">
        <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Purchase</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        {customer.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="text-foreground">{customer.totalOrders}</td>
                  <td className="font-semibold text-success">${customer.totalSpent.toLocaleString()}</td>
                  <td className="text-muted-foreground">{customer.lastPurchase}</td>
                  <td>
                    <span className={customer.status === "active" ? "badge-success" : "badge-warning"}>
                      {customer.status}
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
