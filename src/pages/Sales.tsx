import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShoppingCart, Plus, Search, Eye, Download, DollarSign, Receipt, TrendingUp } from "lucide-react";

interface Invoice {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "pending" | "overdue";
  paymentMethod: string;
}

const invoices: Invoice[] = [
  { id: "INV-2024-001", customer: "John Smith", email: "john@email.com", date: "2024-01-15", items: 3, subtotal: 299.97, tax: 24.00, total: 323.97, status: "paid", paymentMethod: "Credit Card" },
  { id: "INV-2024-002", customer: "Sarah Johnson", email: "sarah@email.com", date: "2024-01-15", items: 2, subtotal: 159.98, tax: 12.80, total: 172.78, status: "paid", paymentMethod: "PayPal" },
  { id: "INV-2024-003", customer: "Mike Wilson", email: "mike@email.com", date: "2024-01-14", items: 5, subtotal: 489.95, tax: 39.20, total: 529.15, status: "pending", paymentMethod: "Bank Transfer" },
  { id: "INV-2024-004", customer: "Emily Brown", email: "emily@email.com", date: "2024-01-14", items: 1, subtotal: 79.99, tax: 6.40, total: 86.39, status: "paid", paymentMethod: "Credit Card" },
  { id: "INV-2024-005", customer: "David Lee", email: "david@email.com", date: "2024-01-13", items: 4, subtotal: 359.96, tax: 28.80, total: 388.76, status: "overdue", paymentMethod: "Credit Card" },
  { id: "INV-2024-006", customer: "Lisa Anderson", email: "lisa@email.com", date: "2024-01-13", items: 2, subtotal: 199.98, tax: 16.00, total: 215.98, status: "paid", paymentMethod: "Cash" },
];

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = invoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.total, 0);
  const overdueAmount = invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.total, 0);

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <span className="badge-success">Paid</span>;
      case "pending":
        return <span className="badge-warning">Pending</span>;
      case "overdue":
        return <span className="badge-danger">Overdue</span>;
    }
  };

  return (
    <DashboardLayout
      title="Sales & Billing"
      subtitle="Manage invoices, transactions, and billing"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue (Paid)</p>
              <p className="text-2xl font-bold text-success">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20">
              <Receipt className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">${pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20">
              <Receipt className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-destructive">${overdueAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-2xl font-bold text-foreground">{invoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card">
        <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-mono font-medium text-primary">{invoice.id}</td>
                  <td>
                    <div>
                      <p className="font-medium text-foreground">{invoice.customer}</p>
                      <p className="text-sm text-muted-foreground">{invoice.email}</p>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{invoice.date}</td>
                  <td className="text-muted-foreground">{invoice.items} items</td>
                  <td className="font-semibold text-foreground">${invoice.total.toFixed(2)}</td>
                  <td className="text-muted-foreground">{invoice.paymentMethod}</td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost p-2">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="btn-ghost p-2">
                        <Download className="h-4 w-4" />
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
