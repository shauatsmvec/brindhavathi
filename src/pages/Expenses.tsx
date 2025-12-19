import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Wallet, Plus, Search, Edit, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
}

const expenses: Expense[] = [
  { id: "EXP-001", description: "Monthly Rent", category: "Rent", amount: 2500.00, date: "2024-01-01", paymentMethod: "Bank Transfer" },
  { id: "EXP-002", description: "Electricity Bill", category: "Utilities", amount: 450.00, date: "2024-01-05", paymentMethod: "Auto-debit" },
  { id: "EXP-003", description: "Internet Service", category: "Utilities", amount: 89.99, date: "2024-01-05", paymentMethod: "Credit Card" },
  { id: "EXP-004", description: "Staff Salaries", category: "Payroll", amount: 8500.00, date: "2024-01-10", paymentMethod: "Bank Transfer" },
  { id: "EXP-005", description: "Marketing Campaign", category: "Marketing", amount: 1200.00, date: "2024-01-12", paymentMethod: "Credit Card" },
  { id: "EXP-006", description: "Office Supplies", category: "Supplies", amount: 235.50, date: "2024-01-14", paymentMethod: "Cash" },
  { id: "EXP-007", description: "Software Subscriptions", category: "Software", amount: 299.99, date: "2024-01-15", paymentMethod: "Credit Card" },
];

const categoryData = [
  { name: "Rent", amount: 2500 },
  { name: "Payroll", amount: 8500 },
  { name: "Marketing", amount: 1200 },
  { name: "Utilities", amount: 540 },
  { name: "Software", amount: 300 },
  { name: "Supplies", amount: 236 },
];

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = ["all", ...new Set(expenses.map((e) => e.category))];
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-foreground">$13,275</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Wallet className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget Remaining</p>
              <p className="text-2xl font-bold text-success">$6,725</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Expense by Category Chart */}
        <div className="lg:col-span-2 chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-6">Expenses by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
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
          </div>
        </div>

        {/* Quick Add */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Quick Add Expense</h3>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <input type="text" className="input-field mt-1" placeholder="Enter description" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <select className="input-field mt-1">
                <option>Select category</option>
                {categories.filter((c) => c !== "all").map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <input type="number" className="input-field mt-1" placeholder="0.00" />
            </div>
            <button type="button" className="btn-primary w-full">
              <Plus className="mr-2 h-4 w-4" />
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="font-mono text-muted-foreground">{expense.id}</td>
                  <td className="font-medium text-foreground">{expense.description}</td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {expense.category}
                    </span>
                  </td>
                  <td className="font-semibold text-expense">${expense.amount.toFixed(2)}</td>
                  <td className="text-muted-foreground">{expense.date}</td>
                  <td className="text-muted-foreground">{expense.paymentMethod}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost p-2">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="btn-ghost p-2 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
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
