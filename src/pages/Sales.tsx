import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, Eye, Download, DollarSign, Receipt, TrendingUp, Loader2, X, Package } from "lucide-react";
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
}

interface InvoiceItemForm {
  product_id: string;
  quantity: number;
  unit_price: number;
}

const initialForm: InvoiceForm = {
  customer_id: "",
  status: "pending",
  payment_method: "cash",
  notes: "",
};

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(initialForm);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemForm[]>([{ product_id: "", quantity: 1, unit_price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

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

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .gt("stock_quantity", 0)
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
      const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount - discountAmount;

      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: generateInvoiceNumber(),
          customer_id: invoice.customer_id || null,
          status: invoice.status,
          payment_method: invoice.payment_method,
          notes: invoice.notes || null,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: total,
        })
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = invoiceItems
        .filter(item => item.product_id && item.quantity > 0)
        .map(item => ({
          invoice_id: invoiceData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;

        // Deduct stock from inventory
        for (const item of invoiceItems.filter(i => i.product_id && i.quantity > 0)) {
          const { data: product } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          if (product) {
            const newStock = Math.max(0, product.stock_quantity - item.quantity);
            await supabase
              .from("products")
              .update({ stock_quantity: newStock })
              .eq("id", item.product_id);
          }
        }
      }

      // Update customer stats if customer is selected
      if (invoice.customer_id) {
        const { data: customer } = await supabase
          .from("customers")
          .select("total_orders, total_spent")
          .eq("id", invoice.customer_id)
          .single();

        if (customer) {
          await supabase
            .from("customers")
            .update({
              total_orders: customer.total_orders + 1,
              total_spent: Number(customer.total_spent) + total,
            })
            .eq("id", invoice.customer_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
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
    setInvoiceItems([{ product_id: "", quantity: 1, unit_price: 0 }]);
    setTaxRate(0);
    setDiscountAmount(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceItems.filter(item => item.product_id).length === 0) {
      toast.error("Please add at least one product to the invoice");
      return;
    }
    createMutation.mutate(form);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { product_id: "", quantity: 1, unit_price: 0 }]);
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItemForm, value: any) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fill unit price from product price
    if (field === "product_id" && value) {
      const product = products.find((p: any) => p.id === value);
      if (product) {
        updated[index].unit_price = Number(product.price);
      }
    }
    
    setInvoiceItems(updated);
  };

  const getProductStock = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    return product?.stock_quantity || 0;
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

  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discountAmount;

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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Products *</label>
                <button type="button" className="btn-ghost text-sm" onClick={addInvoiceItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </button>
              </div>
              <div className="space-y-3">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <select
                        className="input-field"
                        value={item.product_id}
                        onChange={(e) => updateInvoiceItem(index, "product_id", e.target.value)}
                      >
                        <option value="">Select product</option>
                        {products.map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${Number(product.price).toFixed(2)} (Stock: {product.stock_quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        max={item.product_id ? getProductStock(item.product_id) : 999}
                        className="input-field"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => updateInvoiceItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-24 text-right font-medium text-foreground">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                    {invoiceItems.length > 1 && (
                      <button
                        type="button"
                        className="btn-ghost p-2 text-destructive"
                        onClick={() => removeInvoiceItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="input-field mt-1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Discount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field mt-1"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                />
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

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span className="text-foreground">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-foreground">-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <textarea
                className="input-field mt-1"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Optional notes"
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
