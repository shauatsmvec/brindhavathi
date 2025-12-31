import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Package, Plus, Search, Filter, Edit, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductForm {
  name: string;
  sku: string;
  category_id: string | null;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
}

const initialForm: ProductForm = {
  name: "",
  sku: "",
  category_id: null,
  price: 0,
  cost_price: 0,
  stock_quantity: 0,
  min_stock_level: 10,
  unit: "pcs",
};

export default function Inventory() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`*, categories (name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (product: ProductForm) => {
      const { error } = await supabase.from("products").insert({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id || null,
        price: product.price,
        cost_price: product.cost_price,
        stock_quantity: product.stock_quantity,
        min_stock_level: product.min_stock_level,
        unit: product.unit,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to create product: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: ProductForm }) => {
      const { error } = await supabase.from("products").update({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id || null,
        price: product.price,
        cost_price: product.cost_price,
        stock_quantity: product.stock_quantity,
        min_stock_level: product.min_stock_level,
        unit: product.unit,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to update product: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete product: " + error.message);
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setForm(initialForm);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id,
      price: Number(product.price),
      cost_price: Number(product.cost_price),
      stock_quantity: product.stock_quantity,
      min_stock_level: product.min_stock_level,
      unit: product.unit,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct, product: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const categoryNames = ["all", ...new Set(products.map((p: any) => p.categories?.name).filter(Boolean))];

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.categories?.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatus = (product: any) => {
    if (product.stock_quantity === 0) return "out-of-stock";
    if (product.stock_quantity <= product.min_stock_level) return "low-stock";
    return "in-stock";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <span className="badge-success">In Stock</span>;
      case "low-stock":
        return <span className="badge-warning">Low Stock</span>;
      case "out-of-stock":
        return <span className="badge-danger">Out of Stock</span>;
    }
  };

  const inStockCount = products.filter((p: any) => getStatus(p) === "in-stock").length;
  const lowStockCount = products.filter((p: any) => getStatus(p) === "low-stock").length;
  const outOfStockCount = products.filter((p: any) => getStatus(p) === "out-of-stock").length;

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
              <p className="text-2xl font-bold text-foreground">{inStockCount}</p>
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
              <p className="text-2xl font-bold text-foreground">{lowStockCount}</p>
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
              <p className="text-2xl font-bold text-foreground">{outOfStockCount}</p>
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
                {categoryNames.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product: any) => (
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
                      <td className="text-muted-foreground">{product.categories?.name || "-"}</td>
                      <td className="font-medium text-foreground">${Number(product.price).toFixed(2)}</td>
                      <td className="text-muted-foreground">${Number(product.cost_price).toFixed(2)}</td>
                      <td>
                        <span className={product.stock_quantity <= product.min_stock_level ? "text-warning" : "text-foreground"}>
                          {product.stock_quantity}
                        </span>
                        <span className="text-muted-foreground"> / {product.min_stock_level} min</span>
                      </td>
                      <td>{getStatusBadge(getStatus(product))}</td>
                      {isAdmin && (
                        <td>
                          <div className="flex items-center gap-2">
                            <button className="btn-ghost p-2" onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="btn-ghost p-2 text-destructive hover:text-destructive"
                              onClick={() => deleteMutation.mutate(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                className="input-field mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">SKU</label>
              <input
                type="text"
                className="input-field mt-1"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <select
                className="input-field mt-1"
                value={form.category_id || ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
              >
                <option value="">Select category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field mt-1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cost Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field mt-1"
                  value={form.cost_price}
                  onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock Quantity</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Min Stock Level</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  value={form.min_stock_level}
                  onChange={(e) => setForm({ ...form, min_stock_level: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Unit</label>
              <input
                type="text"
                className="input-field mt-1"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" className="btn-ghost" onClick={handleCloseDialog}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
