import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { format, subMonths, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from "date-fns";

export default function Analytics() {
  // Fetch monthly revenue and expenses for the last 6 months
  const { data: monthlyData = [] } = useQuery({
    queryKey: ["analytics-monthly"],
    queryFn: async () => {
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i);
        return {
          month: format(date, "MMM"),
          start: startOfMonth(date).toISOString(),
          end: endOfMonth(date).toISOString(),
        };
      });

      const results = await Promise.all(
        last6Months.map(async (month) => {
          const { data: invoices } = await supabase
            .from("invoices")
            .select("total_amount")
            .eq("status", "paid")
            .gte("created_at", month.start)
            .lte("created_at", month.end);

          const { data: expenses } = await supabase
            .from("expenses")
            .select("amount")
            .gte("created_at", month.start)
            .lte("created_at", month.end);

          const revenue = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
          const expenseTotal = expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;

          return {
            month: month.month,
            revenue,
            expenses: expenseTotal,
            profit: revenue - expenseTotal,
          };
        })
      );

      return results;
    },
  });

  // Fetch category revenue from invoice items
  const { data: categoryData = [] } = useQuery({
    queryKey: ["analytics-categories"],
    queryFn: async () => {
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name");

      if (!categories || categories.length === 0) {
        return [{ name: "Uncategorized", value: 100, color: "hsl(160 84% 39%)" }];
      }

      const colors = [
        "hsl(160 84% 39%)",
        "hsl(38 92% 50%)",
        "hsl(200 90% 50%)",
        "hsl(270 70% 60%)",
        "hsl(340 75% 55%)",
      ];

      const categoryRevenue = await Promise.all(
        categories.map(async (cat, index) => {
          const { data: products } = await supabase
            .from("products")
            .select("id")
            .eq("category_id", cat.id);

          if (!products || products.length === 0) {
            return { name: cat.name, value: 0, color: colors[index % colors.length] };
          }

          const productIds = products.map(p => p.id);
          const { data: items } = await supabase
            .from("invoice_items")
            .select("total_price")
            .in("product_id", productIds);

          const revenue = items?.reduce((sum, item) => sum + Number(item.total_price || 0), 0) || 0;

          return { name: cat.name, value: revenue, color: colors[index % colors.length] };
        })
      );

      // Convert to percentages
      const total = categoryRevenue.reduce((sum, cat) => sum + cat.value, 0);
      if (total === 0) {
        return [{ name: "No Sales Yet", value: 100, color: "hsl(160 84% 39%)" }];
      }

      return categoryRevenue
        .filter(cat => cat.value > 0)
        .map(cat => ({
          ...cat,
          value: Math.round((cat.value / total) * 100),
        }));
    },
  });

  // Fetch daily sales for the week
  const { data: dailySalesData = [] } = useQuery({
    queryKey: ["analytics-daily"],
    queryFn: async () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          day: format(date, "EEE"),
          start: startOfDay(date).toISOString(),
          end: endOfDay(date).toISOString(),
        };
      });

      const results = await Promise.all(
        last7Days.map(async (day) => {
          const { data: invoices, count } = await supabase
            .from("invoices")
            .select("total_amount", { count: "exact" })
            .gte("created_at", day.start)
            .lte("created_at", day.end);

          const sales = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

          return {
            day: day.day,
            sales,
            orders: count || 0,
          };
        })
      );

      return results;
    },
  });

  // Fetch inventory trend (simulated based on current data)
  const { data: inventoryData = [] } = useQuery({
    queryKey: ["analytics-inventory"],
    queryFn: async () => {
      const { data: products } = await supabase
        .from("products")
        .select("stock_quantity, min_stock_level")
        .eq("status", "active");

      if (!products) return [];

      const inStock = products.filter(p => p.stock_quantity > p.min_stock_level).length;
      const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level).length;
      const outOfStock = products.filter(p => p.stock_quantity === 0).length;

      // Create 4 week trend (static for now as we don't have historical data)
      return [
        { week: "W1", inStock: inStock, lowStock, outOfStock },
        { week: "W2", inStock: inStock, lowStock, outOfStock },
        { week: "W3", inStock: inStock, lowStock, outOfStock },
        { week: "W4", inStock: inStock, lowStock, outOfStock },
      ];
    },
  });

  // Calculate KPIs
  const { data: kpiData } = useQuery({
    queryKey: ["analytics-kpis"],
    queryFn: async () => {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("total_amount, status");

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount");

      const totalRevenue = invoices?.filter(i => i.status === "paid").reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const totalOrders = invoices?.length || 0;

      return { totalRevenue, totalExpenses, netProfit, totalOrders };
    },
  });

  const kpis = kpiData || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, totalOrders: 0 };

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
              <p className="text-2xl font-bold text-foreground">${kpis.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">From paid invoices</span>
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
              <p className="text-2xl font-bold text-foreground">${kpis.totalExpenses.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-destructive">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">All recorded</span>
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
              <p className="text-2xl font-bold text-foreground">${kpis.netProfit.toLocaleString()}</p>
              <div className={`flex items-center gap-1 mt-1 ${kpis.netProfit >= 0 ? "text-success" : "text-destructive"}`}>
                {kpis.netProfit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">Revenue - Expenses</span>
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
              <p className="text-2xl font-bold text-foreground">{kpis.totalOrders.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">All invoices</span>
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
              <AreaChart data={monthlyData}>
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
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
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
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
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
            {categoryData.map((item) => (
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
              <BarChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: "8px" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
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
              <LineChart data={inventoryData}>
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
