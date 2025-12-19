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
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your store today."
    >
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="$48,250"
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-primary"
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value="1,247"
          change="+8.2% from last month"
          changeType="positive"
          icon={ShoppingBag}
          iconColor="bg-info"
          delay={50}
        />
        <StatCard
          title="Products"
          value="856"
          change="24 low stock items"
          changeType="neutral"
          icon={Package}
          iconColor="bg-accent"
          delay={100}
        />
        <StatCard
          title="Profit Margin"
          value="32.5%"
          change="+2.1% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-success"
          delay={150}
        />
        <StatCard
          title="Customers"
          value="3,842"
          change="+156 new this month"
          changeType="positive"
          icon={Users}
          iconColor="bg-purple-500"
          delay={200}
        />
        <StatCard
          title="Expenses"
          value="$12,430"
          change="-5.3% from last month"
          changeType="positive"
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
