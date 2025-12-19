import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Wallet, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExpenseForm {
  description: string;
  category_id: string | null;
  amount: number;
  date: string;
  payment_method: string;
  notes: string;
}

const initialForm: ExpenseForm = {
  description: "",
  category_id: null,
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  payment_method: "cash",
  notes: "",
};

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(initialForm);

  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(`*, expense_categories (name, color)`)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["expense_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (expense: ExpenseForm) => {
      const { error } = await supabase.from("expenses").insert({
        description: expense.description,
        category_id: expense.category_id || null,
        amount: expense.amount,
        date: expense.date,
        payment_method: expense.payment_method,
        notes: expense.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to create expense: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, expense }: { id: string; expense: ExpenseForm }) => {
      const { error } = await supabase.from("expenses").update({
        description: expense.description,
        category_id: expense.category_id || null,
        amount: expense.amount,
        date: expense.date,
        payment_method: expense.payment_method,
        notes: expense.notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to update expense: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete expense: " + error.message);
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    setForm(initialForm);
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense.id);
    setForm({
      description: expense.description,
      category_id: expense.category_id,
      amount: Number(expense.amount),
      date: expense.date,
      payment_method: expense.payment_method,
      notes: expense.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense, expense: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const categoryNames = ["all", ...new Set(expenses.map((e: any) => e.expense_categories?.name).filter(Boolean))];
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  const filteredExpenses = expenses.filter((expense: any) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.expense_categories?.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group expenses by category for chart
  const categoryData = expenses.reduce((acc: any, expense: any) => {
    const catName = expense.expense_categories?.name || "Uncategorized";
    if (!acc[catName]) acc[catName] = 0;
    acc[catName] += Number(expense.amount);
    return acc;
  }, {});

  const chartData = Object.entries(categoryData).map(([name, amount]) => ({
    name,
    amount: amount as number,
  })).sort((a, b) => b.amount - a.amount).slice(0, 6);

  return (
    <DashboardLayout
      title="Expense Tracking"
      subtitle="Monitor and categorize operational expenses"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-expense/20">
              <Wallet className="h-6 w-6 text-expense" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold text-foreground">{expenses.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Wallet className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold text-foreground">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Expense by Category Chart */}
        <div className="lg:col-span-2 chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-6">Expenses by Category</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 9%)",
                      border: "1px solid hsl(222 30% 16%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                  />
                  <Bar dataKey="amount" fill="hsl(0 72% 55%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Quick Add */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Quick Add Expense</h3>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <input
                type="text"
                className="input-field mt-1"
                placeholder="Enter description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <input
                type="number"
                step="0.01"
                className="input-field mt-1"
                placeholder="0.00"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Expense
            </button>
          </form>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card">
        <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field w-40"
            >
              {categoryNames.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
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
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense: any) => (
                    <tr key={expense.id}>
                      <td className="font-medium text-foreground">{expense.description}</td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {expense.expense_categories?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="font-semibold text-expense">${Number(expense.amount).toFixed(2)}</td>
                      <td className="text-muted-foreground">{expense.date}</td>
                      <td className="text-muted-foreground capitalize">{expense.payment_method}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button className="btn-ghost p-2" onClick={() => handleEdit(expense)}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="btn-ghost p-2 text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description *</label>
              <input
                type="text"
                className="input-field mt-1"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                <label className="text-sm font-medium text-muted-foreground">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field mt-1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date *</label>
                <input
                  type="date"
                  className="input-field mt-1"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
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
                <option value="auto_debit">Auto-debit</option>
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
              <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingExpense ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
