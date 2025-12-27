import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";

export function TopProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["top-products"],
    queryFn: async () => {
      // Get products with their invoice items to calculate sales
      const { data: allProducts } = await supabase
        .from("products")
        .select("id, name, sku, price, stock_quantity")
        .eq("status", "active")
        .order("stock_quantity", { ascending: false })
        .limit(10);

      if (!allProducts) return [];

      // Get sales data for each product
      const productsWithSales = await Promise.all(
        allProducts.map(async (product) => {
          const { data: items } = await supabase
            .from("invoice_items")
            .select("quantity, total_price")
            .eq("product_id", product.id);

          const sold = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
          const revenue = items?.reduce((sum, item) => sum + Number(item.total_price || 0), 0) || 0;

          return {
            ...product,
            sold,
            revenue,
            stock: product.stock_quantity,
          };
        })
      );

      // Sort by revenue and take top 5
      return productsWithSales
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  });

  if (isLoading) {
    return (
      <div className="chart-container animate-slide-up" style={{ animationDelay: "400ms" }}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Top Products</h3>
          <p className="text-sm text-muted-foreground">Best selling items this month</p>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const maxSold = Math.max(...products.map((p) => p.sold), 1);

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Products</h3>
          <p className="text-sm text-muted-foreground">Best selling items</p>
        </div>
        <Link to="/inventory" className="btn-ghost text-sm">View all</Link>
      </div>
      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No products yet</p>
        ) : (
          products.map((product) => (
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
          ))
        )}
      </div>
    </div>
  );
}
