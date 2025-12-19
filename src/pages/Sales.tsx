import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, Eye, Download, DollarSign, Receipt, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          customers (name, email)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredInvoices = invoices.filter((invoice) => {
    const customerName = invoice.customers?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + Number(i.total_amount), 0);
  const pendingAmount = invoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + Number(i.total_amount), 0);
  const overdueAmount = invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + Number(i.total_amount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="badge-success">Paid</span>;
      case "pending":
        return <span className="badge-warning">Pending</span>;
      case "overdue":
        return <span className="badge-danger">Overdue</span>;
      default:
        return <span className="badge-secondary">{status}</span>;
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-mono font-medium text-primary">{invoice.invoice_number}</td>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">{invoice.customers?.name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{invoice.customers?.email || ""}</p>
                        </div>
                      </td>
                      <td className="text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="font-semibold text-foreground">${Number(invoice.total_amount).toFixed(2)}</td>
                      <td className="text-muted-foreground capitalize">{invoice.payment_method}</td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
