import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const transactions = [
  {
    id: "INV-001",
    customer: "John Smith",
    type: "sale",
    amount: 1250.0,
    status: "completed",
    date: "2 min ago",
  },
  {
    id: "PO-042",
    customer: "ABC Suppliers",
    type: "purchase",
    amount: 3400.0,
    status: "pending",
    date: "15 min ago",
  },
  {
    id: "INV-002",
    customer: "Sarah Johnson",
    type: "sale",
    amount: 890.5,
    status: "completed",
    date: "1 hour ago",
  },
  {
    id: "EXP-018",
    customer: "Utility Payment",
    type: "expense",
    amount: 450.0,
    status: "completed",
    date: "2 hours ago",
  },
  {
    id: "INV-003",
    customer: "Mike Wilson",
    type: "sale",
    amount: 2100.0,
    status: "completed",
    date: "3 hours ago",
  },
];

export function RecentTransactions() {
  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Latest financial activities</p>
        </div>
        <button className="btn-ghost text-sm">View all</button>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
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
                  transaction.status === "completed"
                    ? "text-success"
                    : "text-warning"
                }`}
              >
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
