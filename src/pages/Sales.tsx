import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, Eye, Download, DollarSign, Receipt, TrendingUp, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvoiceForm {
  customer_id: string;
  status: string;
  payment_method: string;
  notes: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
}

const initialForm: InvoiceForm = {
  customer_id: "",
  status: "pending",
  payment_method: "cash",
  notes: "",
  subtotal: 0,
  tax_amount: 0,
  discount_amount: 0,
};

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(initialForm);

  const queryClient = useQueryClient();

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

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `INV-${year}-${random}`;
  };

  const createMutation = useMutation({
    mutationFn: async (invoice: InvoiceForm) => {
      const total = invoice.subtotal + invoice.tax_amount - invoice.discount_amount;
      const { error } = await supabase.from("invoices").insert({
        invoice_number: generateInvoiceNumber(),
        customer_id: invoice.customer_id || null,
        status: invoice.status,
        payment_method: invoice.payment_method,
        notes: invoice.notes || null,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        discount_amount: invoice.discount_amount,
        total_amount: total,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to create invoice: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Status updated");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setForm(initialForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const filteredInvoices = invoices.filter((invoice: any) => {
    const customerName = invoice.customers?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter((i: any) => i.status === "paid").reduce((sum: number, i: any) => sum + Number(i.total_amount), 0);
  const pendingAmount = invoices.filter((i: any) => i.status === "pending").reduce((sum: number, i: any) => sum + Number(i.total_amount), 0);
  const overdueAmount = invoices.filter((i: any) => i.status === "overdue").reduce((sum: number, i: any) => sum + Number(i.total_amount), 0);

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
          <button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
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
                  filteredInvoices.map((invoice: any) => (
                    <tr key={invoice.id}>
                      <td className="font-mono font-medium text-primary">{invoice.invoice_number}</td>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">{invoice.customers?.name || "Walk-in"}</p>
                          <p className="text-sm text-muted-foreground">{invoice.customers?.email || ""}</p>
                        </div>
                      </td>
                      <td className="text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="font-semibold text-foreground">${Number(invoice.total_amount).toFixed(2)}</td>
                      <td className="text-muted-foreground capitalize">{invoice.payment_method}</td>
                      <td>
                        <select
                          className="input-field py-1 px-2 text-xs"
                          value={invoice.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: invoice.id, status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </td>
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

      {/* Create Invoice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Customer</label>
              <select
                className="input-field mt-1"
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              >
                <option value="">Walk-in Customer</option>
                {customers.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subtotal *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field mt-1"
                  value={form.subtotal}
                  onChange={(e) => setForm({ ...form, subtotal: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field mt-1"
                  value={form.tax_amount}
                  onChange={(e) => setForm({ ...form, tax_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Discount</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field mt-1"
                  value={form.discount_amount}
                  onChange={(e) => setForm({ ...form, discount_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total</label>
                <input
                  type="text"
                  className="input-field mt-1 bg-muted"
                  value={`$${(form.subtotal + form.tax_amount - form.discount_amount).toFixed(2)}`}
                  readOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                <select
                  className="input-field mt-1"
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <select
                  className="input-field mt-1"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <textarea
                className="input-field mt-1"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" className="btn-ghost" onClick={handleCloseDialog}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Invoice
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
