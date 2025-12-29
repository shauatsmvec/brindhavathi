import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Truck, Plus, Search, Eye, CheckCircle, Clock, Package, Loader2, X } from "lucide-react";
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

interface OrderItemForm {
  product_id: string;
  quantity: number;
  unit_cost: number;
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
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<PurchaseOrderForm>(initialForm);
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([{ product_id: "", quantity: 1, unit_cost: 0 }]);

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

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
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
      // Calculate total amount
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
      
      // Create purchase order
      const { data: poData, error: poError } = await supabase
        .from("purchase_orders")
        .insert({
          po_number: generatePONumber(),
          supplier_id: order.supplier_id,
          expected_delivery: order.expected_delivery || null,
          status: order.status,
          notes: order.notes || null,
          total_amount: totalAmount,
        })
        .select()
        .single();
      
      if (poError) throw poError;

      // Create order items
      const itemsToInsert = orderItems
        .filter(item => item.product_id && item.quantity > 0)
        .map(item => ({
          purchase_order_id: poData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.quantity * item.unit_cost,
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from("purchase_order_items")
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Purchase order created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to create purchase order: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("purchase_orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      // If delivered, update inventory stock levels
      if (status === "delivered") {
        const { data: items, error: itemsError } = await supabase
          .from("purchase_order_items")
          .select("*")
          .eq("purchase_order_id", id);
        
        if (itemsError) throw itemsError;

        // Update each product's stock quantity
        for (const item of items || []) {
          const { data: product } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({ 
                stock_quantity: product.stock_quantity + item.quantity 
              })
              .eq("id", item.product_id);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setForm(initialForm);
    setOrderItems([{ product_id: "", quantity: 1, unit_cost: 0 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.filter(item => item.product_id).length === 0) {
      toast.error("Please add at least one product to the order");
      return;
    }
    createMutation.mutate(form);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: "", quantity: 1, unit_cost: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof OrderItemForm, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fill unit cost from product cost_price
    if (field === "product_id" && value) {
      const product = products.find((p: any) => p.id === value);
      if (product) {
        updated[index].unit_cost = Number(product.cost_price);
      }
    }
    
    setOrderItems(updated);
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

  const orderItemsTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Products *</label>
                <button type="button" className="btn-ghost text-sm" onClick={addOrderItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </button>
              </div>
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <select
                        className="input-field"
                        value={item.product_id}
                        onChange={(e) => updateOrderItem(index, "product_id", e.target.value)}
                      >
                        <option value="">Select product</option>
                        {products.map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        className="input-field"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field"
                        placeholder="Unit Cost"
                        value={item.unit_cost}
                        onChange={(e) => updateOrderItem(index, "unit_cost", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-24 text-right font-medium text-foreground">
                      ${(item.quantity * item.unit_cost).toFixed(2)}
                    </div>
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        className="btn-ghost p-2 text-destructive"
                        onClick={() => removeOrderItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-end">
                <span className="text-lg font-semibold text-foreground">
                  Total: ${orderItemsTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <input
                  type="text"
                  className="input-field mt-1"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
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
