import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, Package, ShoppingBag, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "low_stock" | "new_order" | "pending_po";
  title: string;
  message: string;
  link: string;
  time: string;
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const notifs: Notification[] = [];

      // Check for low stock products
      const { data: lowStockProducts } = await supabase
        .from("products")
        .select("id, name, stock_quantity, min_stock_level, updated_at")
        .eq("status", "active")
        .lte("stock_quantity", 10)
        .order("updated_at", { ascending: false })
        .limit(3);

      lowStockProducts?.forEach((p) => {
        notifs.push({
          id: `low-stock-${p.id}`,
          type: "low_stock",
          title: "Low Stock Alert",
          message: `${p.name} has only ${p.stock_quantity} units left`,
          link: "/inventory",
          time: formatDistanceToNow(new Date(p.updated_at), { addSuffix: true }),
        });
      });

      // Check for recent pending invoices
      const { data: pendingInvoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(3);

      pendingInvoices?.forEach((inv) => {
        notifs.push({
          id: `pending-invoice-${inv.id}`,
          type: "new_order",
          title: "Pending Invoice",
          message: `${inv.invoice_number} - $${Number(inv.total_amount).toLocaleString()}`,
          link: "/sales",
          time: formatDistanceToNow(new Date(inv.created_at), { addSuffix: true }),
        });
      });

      // Check for pending purchase orders
      const { data: pendingPOs } = await supabase
        .from("purchase_orders")
        .select("id, po_number, total_amount, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(2);

      pendingPOs?.forEach((po) => {
        notifs.push({
          id: `pending-po-${po.id}`,
          type: "pending_po",
          title: "Pending Purchase Order",
          message: `${po.po_number} - $${Number(po.total_amount).toLocaleString()}`,
          link: "/procurement",
          time: formatDistanceToNow(new Date(po.created_at), { addSuffix: true }),
        });
      });

      return notifs.slice(0, 8);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "low_stock": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "new_order": return <ShoppingBag className="h-4 w-4 text-success" />;
      case "pending_po": return <Package className="h-4 w-4 text-info" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 lg:h-5 lg:w-5 items-center justify-center rounded-full bg-primary text-[10px] lg:text-xs font-medium text-primary-foreground">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    to={notif.link}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 p-4 hover:bg-muted/50 border-b border-border/50 last:border-0 transition-colors"
                  >
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{notif.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
