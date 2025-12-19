import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "In Stock", value: 65, color: "hsl(160 84% 39%)" },
  { name: "Low Stock", value: 20, color: "hsl(38 92% 50%)" },
  { name: "Out of Stock", value: 15, color: "hsl(0 72% 51%)" },
];

export function InventoryStatus() {
  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Inventory Status</h3>
        <p className="text-sm text-muted-foreground">Current stock distribution</p>
      </div>
      <div className="flex items-center gap-8">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 47% 9%)",
                  border: "1px solid hsl(222 30% 16%)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-semibold text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
