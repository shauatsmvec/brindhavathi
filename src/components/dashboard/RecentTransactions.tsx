import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Transaction {
  id: string;
  customer: string;
  type: "sale" | "purchase" | "expense";
  amount: number;
  status: string;
  date: string;
}

export function RecentTransactions() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const results: Transaction[] = [];

      // Fetch recent invoices (sales)
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, status, created_at, customer_id, customers(name)")
        .order("created_at", { ascending: false })
        .limit(3);

      invoices?.forEach((inv: any) => {
        results.push({
          id: inv.invoice_number,
          customer: inv.customers?.name || "Walk-in Customer",
          type: "sale",
          amount: Number(inv.total_amount),
          status: inv.status,
          date: formatDistanceToNow(new Date(inv.created_at), { addSuffix: true }),
        });
      });

      // Fetch recent purchase orders
      const { data: purchases } = await supabase
        .from("purchase_orders")
        .select("id, po_number, total_amount, status, created_at, supplier_id, suppliers(name)")
        .order("created_at", { ascending: false })
        .limit(2);

      purchases?.forEach((po: any) => {
        results.push({
          id: po.po_number,
          customer: po.suppliers?.name || "Unknown Supplier",
          type: "purchase",
          amount: Number(po.total_amount),
          status: po.status,
          date: formatDistanceToNow(new Date(po.created_at), { addSuffix: true }),
        });
      });

      // Fetch recent expenses
      const { data: expenses } = await supabase
        .from("expenses")
        .select("id, description, amount, created_at")
        .order("created_at", { ascending: false })
        .limit(2);

      expenses?.forEach((exp) => {
        results.push({
          id: `EXP-${exp.id.slice(0, 4).toUpperCase()}`,
          customer: exp.description,
          type: "expense",
          amount: Number(exp.amount),
          status: "completed",
          date: formatDistanceToNow(new Date(exp.created_at), { addSuffix: true }),
        });
      });

      // Sort by date (most recent first)
      return results.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
    },
  });

  if (isLoading) {
    return (
      <div className="chart-container animate-slide-up" style={{ animationDelay: "300ms" }}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Latest financial activities</p>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Latest financial activities</p>
        </div>
        <Link to="/sales" className="btn-ghost text-sm">View all</Link>
      </div>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    transaction.type === "sale"
                      ? "bg-success/20 text-success"
                      : transaction.type === "purchase"
                      ? "bg-info/20 text-info"
                      : "bg-expense/20 text-expense"
                  }`}
                >
                  {transaction.type === "sale" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{transaction.customer}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.id} • {transaction.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.type === "sale" ? "text-success" : "text-foreground"
                  }`}
                >
                  {transaction.type === "sale" ? "+" : "-"}$
                  {transaction.amount.toLocaleString()}
                </p>
                <span
                  className={`text-xs font-medium ${
                    transaction.status === "completed" || transaction.status === "paid"
                      ? "text-success"
                      : "text-warning"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
