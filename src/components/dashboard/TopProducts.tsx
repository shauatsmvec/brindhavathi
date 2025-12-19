import { Package } from "lucide-react";

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    sold: 245,
    revenue: 12250,
    stock: 89,
  },
  {
    name: "Smart Watch Pro",
    sku: "SWP-002",
    sold: 189,
    revenue: 28350,
    stock: 45,
  },
  {
    name: "USB-C Fast Charger",
    sku: "UFC-003",
    sold: 312,
    revenue: 6240,
    stock: 234,
  },
  {
    name: "Portable Power Bank",
    sku: "PPB-004",
    sold: 156,
    revenue: 4680,
    stock: 12,
  },
  {
    name: "Wireless Mouse",
    sku: "WM-005",
    sold: 198,
    revenue: 5940,
    stock: 167,
  },
];

export function TopProducts() {
  const maxSold = Math.max(...products.map((p) => p.sold));

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Products</h3>
          <p className="text-sm text-muted-foreground">Best selling items this month</p>
        </div>
        <button className="btn-ghost text-sm">View all</button>
      </div>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.sku}
            className="flex items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-foreground truncate">{product.name}</p>
                <span className="text-sm font-semibold text-foreground ml-2">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{product.sold} sold</span>
                <span
                  className={`font-medium ${
                    product.stock < 20 ? "text-warning" : "text-muted-foreground"
                  }`}
                >
                  {product.stock} in stock
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(product.sold / maxSold) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
