import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export function SalesChart() {
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ["sales-chart"],
    queryFn: async () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, "yyyy-MM-dd"),
          name: format(date, "EEE"),
          start: startOfDay(date).toISOString(),
          end: endOfDay(date).toISOString(),
        };
      });

      const results = await Promise.all(
        last7Days.map(async (day) => {
          const { data: invoices } = await supabase
            .from("invoices")
            .select("total_amount")
            .gte("created_at", day.start)
            .lte("created_at", day.end)
            .eq("status", "paid");

          const sales = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

          return {
            name: day.name,
            sales,
          };
        })
      );

      return results;
    },
  });

  if (isLoading) {
    return (
      <div className="chart-container animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Sales Overview</h3>
          <p className="text-sm text-muted-foreground">Weekly sales performance</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sales Overview</h3>
          <p className="text-sm text-muted-foreground">Weekly sales performance</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
              tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222 47% 9%)",
                border: "1px solid hsl(222 30% 16%)",
                borderRadius: "8px",
                boxShadow: "0 4px 16px hsl(222 47% 4% / 0.5)",
              }}
              labelStyle={{ color: "hsl(210 40% 96%)" }}
              itemStyle={{ color: "hsl(160 84% 39%)" }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(160 84% 39%)"
              strokeWidth={3}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
