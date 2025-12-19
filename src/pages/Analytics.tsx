import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 42000, expenses: 28000, profit: 14000 },
  { month: "Feb", revenue: 38000, expenses: 25000, profit: 13000 },
  { month: "Mar", revenue: 51000, expenses: 32000, profit: 19000 },
  { month: "Apr", revenue: 46000, expenses: 29000, profit: 17000 },
  { month: "May", revenue: 52000, expenses: 31000, profit: 21000 },
  { month: "Jun", revenue: 48000, expenses: 28000, profit: 20000 },
];

const categoryRevenue = [
  { name: "Electronics", value: 45, color: "hsl(160 84% 39%)" },
  { name: "Accessories", value: 28, color: "hsl(38 92% 50%)" },
  { name: "Peripherals", value: 18, color: "hsl(200 90% 50%)" },
  { name: "Other", value: 9, color: "hsl(270 70% 60%)" },
];

const dailySales = [
  { day: "Mon", sales: 120, orders: 45 },
  { day: "Tue", sales: 98, orders: 38 },
  { day: "Wed", sales: 145, orders: 52 },
  { day: "Thu", sales: 132, orders: 48 },
  { day: "Fri", sales: 165, orders: 61 },
  { day: "Sat", sales: 189, orders: 72 },
  { day: "Sun", sales: 134, orders: 51 },
];

const inventoryTrend = [
  { week: "W1", inStock: 850, lowStock: 45, outOfStock: 12 },
  { week: "W2", inStock: 820, lowStock: 52, outOfStock: 18 },
  { week: "W3", inStock: 890, lowStock: 38, outOfStock: 8 },
  { week: "W4", inStock: 875, lowStock: 42, outOfStock: 10 },
];

export default function Analytics() {
  return (
    <DashboardLayout
      title="Analytics & Reports"
      subtitle="Comprehensive business insights and performance metrics"
    >
      {/* KPI Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">$277,000</p>
              <div className="flex items-center gap-1 mt-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+12.5%</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-foreground">$173,000</p>
              <div className="flex items-center gap-1 mt-1 text-destructive">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">-3.2%</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-expense/20">
              <DollarSign className="h-6 w-6 text-expense" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold text-foreground">$104,000</p>
              <div className="flex items-center gap-1 mt-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+18.7%</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">2,847</p>
              <div className="flex items-center gap-1 mt-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+8.4%</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/20">
              <ShoppingBag className="h-6 w-6 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Profit Chart */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-2">Revenue vs Expenses</h3>
          <p className="text-sm text-muted-foreground mb-6">6-month financial overview</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0 72% 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(0 72% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: "8px" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="hsl(160 84% 39%)" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="hsl(0 72% 55%)" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-2">Revenue by Category</h3>
          <p className="text-sm text-muted-foreground mb-6">Sales distribution</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: "8px" }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryRevenue.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Sales & Inventory */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-2">Daily Sales</h3>
          <p className="text-sm text-muted-foreground mb-6">This week's performance</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: "8px" }}
                />
                <Bar dataKey="sales" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} name="Sales ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-2">Inventory Trend</h3>
          <p className="text-sm text-muted-foreground mb-6">Stock levels over time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inventoryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: "8px" }}
                />
                <Legend />
                <Line type="monotone" dataKey="inStock" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={{ fill: "hsl(160 84% 39%)" }} name="In Stock" />
                <Line type="monotone" dataKey="lowStock" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={{ fill: "hsl(38 92% 50%)" }} name="Low Stock" />
                <Line type="monotone" dataKey="outOfStock" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={{ fill: "hsl(0 72% 55%)" }} name="Out of Stock" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
