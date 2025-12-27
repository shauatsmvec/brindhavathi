import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { InventoryStatus } from "@/components/dashboard/InventoryStatus";
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export default function Dashboard() {
  // Fetch total revenue from paid invoices
  const { data: revenueData } = useQuery({
    queryKey: ["dashboard-revenue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("total_amount")
        .eq("status", "paid");
      
      const total = data?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
      return total;
    },
  });

  // Fetch total orders
  const { data: ordersData } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: async () => {
      const { count } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Fetch products count
  const { data: productsData } = useQuery({
    queryKey: ["dashboard-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("stock_quantity, min_stock_level")
        .eq("status", "active");
      
      const total = data?.length || 0;
      const lowStock = data?.filter(p => p.stock_quantity <= p.min_stock_level).length || 0;
      return { total, lowStock };
    },
  });

  // Fetch customers count
  const { data: customersData } = useQuery({
    queryKey: ["dashboard-customers"],
    queryFn: async () => {
      const { count } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Fetch total expenses
  const { data: expensesData } = useQuery({
    queryKey: ["dashboard-expenses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("amount");
      
      const total = data?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
      return total;
    },
  });

  // Calculate profit margin
  const revenue = revenueData || 0;
  const expenses = expensesData || 0;
  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0";

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your store today."
    >
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${(revenue).toLocaleString()}`}
          change="From all paid invoices"
          changeType="neutral"
          icon={DollarSign}
          iconColor="bg-primary"
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value={(ordersData || 0).toLocaleString()}
          change="All invoices"
          changeType="neutral"
          icon={ShoppingBag}
          iconColor="bg-info"
          delay={50}
        />
        <StatCard
          title="Products"
          value={(productsData?.total || 0).toString()}
          change={`${productsData?.lowStock || 0} low stock items`}
          changeType={productsData?.lowStock && productsData.lowStock > 0 ? "negative" : "neutral"}
          icon={Package}
          iconColor="bg-accent"
          delay={100}
        />
        <StatCard
          title="Profit Margin"
          value={`${profitMargin}%`}
          change="Revenue minus expenses"
          changeType={Number(profitMargin) > 0 ? "positive" : "negative"}
          icon={TrendingUp}
          iconColor="bg-success"
          delay={150}
        />
        <StatCard
          title="Customers"
          value={(customersData || 0).toLocaleString()}
          change="Total registered"
          changeType="neutral"
          icon={Users}
          iconColor="bg-purple-500"
          delay={200}
        />
        <StatCard
          title="Expenses"
          value={`$${(expenses).toLocaleString()}`}
          change="Total recorded"
          changeType="neutral"
          icon={Wallet}
          iconColor="bg-expense"
          delay={250}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <InventoryStatus />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <TopProducts />
      </div>
    </DashboardLayout>
  );
}
