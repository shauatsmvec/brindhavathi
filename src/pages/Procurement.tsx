import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Truck, Plus, Search, Eye, CheckCircle, Clock, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PurchaseOrderForm {
  supplier_id: string;
  expected_delivery: string;
  status: string;
  notes: string;
}

const initialForm: PurchaseOrderForm = {
  supplier_id: "",
  expected_delivery: "",
  status: "pending",
  notes: "",
};

export default function Procurement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<PurchaseOrderForm>(initialForm);

  const queryClient = useQueryClient();

  const { data: purchaseOrders = [], isLoading } = useQuery({
    queryKey: ["purchase_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`*, suppliers (name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const generatePONumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `PO-${year}-${random}`;
  };

  const createMutation = useMutation({
    mutationFn: async (order: PurchaseOrderForm) => {
      const { error } = await supabase.from("purchase_orders").insert({
        po_number: generatePONumber(),
        supplier_id: order.supplier_id,
        expected_delivery: order.expected_delivery || null,
        status: order.status,
        notes: order.notes || null,
        total_amount: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
      toast.success("Purchase order created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to create purchase order: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("purchase_orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
      toast.success("Status updated successfully");
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

  const filteredOrders = purchaseOrders.filter((order: any) =>
    order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeOrders = purchaseOrders.filter((p: any) => p.status !== "delivered" && p.status !== "cancelled").length;
  const inTransit = purchaseOrders.filter((p: any) => p.status === "shipped").length;
  const delivered = purchaseOrders.filter((p: any) => p.status === "delivered").length;
  const pendingTotal = purchaseOrders
    .filter((p: any) => p.status === "pending")
    .reduce((sum: number, p: any) => sum + Number(p.total_amount), 0);

  const getStatusBadge = (status: string) => {
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
      default:
        return <span className="badge-secondary">{status}</span>;
    }
  };

  // Group suppliers with orders for the sidebar
  const supplierStats = suppliers.slice(0, 4).map((supplier: any) => ({
    name: supplier.name,
    orders: supplier.total_orders || 0,
    rating: supplier.rating || 5,
  }));

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
              <p className="text-2xl font-bold text-foreground">{activeOrders}</p>
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
              <p className="text-2xl font-bold text-foreground">{inTransit}</p>
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
              <p className="text-2xl font-bold text-foreground">{delivered}</p>
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
              <p className="text-2xl font-bold text-foreground">${pendingTotal.toLocaleString()}</p>
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
              <button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Order
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
                      <th>Order ID</th>
                      <th>Supplier</th>
                      <th>Expected</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          No purchase orders found
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order: any) => (
                        <tr key={order.id}>
                          <td className="font-mono font-medium text-primary">{order.po_number}</td>
                          <td className="font-medium text-foreground">{order.suppliers?.name || "-"}</td>
                          <td className="text-muted-foreground">{order.expected_delivery || "-"}</td>
                          <td className="font-semibold text-foreground">${Number(order.total_amount).toFixed(2)}</td>
                          <td>
                            <select
                              className="input-field py-1 px-2 text-xs"
                              value={order.status}
                              onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button className="btn-ghost p-2">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Top Suppliers</h3>
          <div className="space-y-4">
            {supplierStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No suppliers found</p>
            ) : (
              supplierStats.map((supplier: any) => (
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
                  <div className="text-sm">
                    <span className="text-muted-foreground">Orders:</span>
                    <span className="ml-1 text-foreground">{supplier.orders}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Supplier *</label>
              <select
                className="input-field mt-1"
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier: any) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
              <input
                type="date"
                className="input-field mt-1"
                value={form.expected_delivery}
                onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })}
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
                <option value="confirmed">Confirmed</option>
              </select>
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
                Create Order
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
