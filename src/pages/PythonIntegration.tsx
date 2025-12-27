import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Code, Terminal, FileCode, Zap, ExternalLink } from "lucide-react";

export default function PythonIntegration() {
  return (
    <DashboardLayout
      title="Python Integration"
      subtitle="Connect Python scripts and automation to your store"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overview */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Python Integration Guide</h2>
              <p className="text-muted-foreground">Use Python for data analysis, automation, and custom integrations</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            This page provides documentation and examples for integrating Python with your E-Trends Explorer store. 
            Python can be used for advanced analytics, machine learning, automated reporting, and connecting to external APIs.
          </p>
        </div>

        {/* API Connection */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
              <Terminal className="h-5 w-5 text-info" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Database Connection</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Connect to your store database using Python and the Supabase client library.
          </p>
          <pre className="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto">
            <code className="text-foreground">{`# Install: pip install supabase

from supabase import create_client

url = "YOUR_SUPABASE_URL"
key = "YOUR_SUPABASE_KEY"

supabase = create_client(url, key)

# Fetch products
products = supabase.table('products').select("*").execute()
print(products.data)

# Fetch sales data
invoices = supabase.table('invoices').select("*").eq('status', 'paid').execute()
print(invoices.data)`}</code>
          </pre>
        </div>

        {/* Data Analysis */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
              <FileCode className="h-5 w-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Data Analysis Example</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Use pandas and matplotlib for advanced analytics.
          </p>
          <pre className="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto">
            <code className="text-foreground">{`import pandas as pd
import matplotlib.pyplot as plt

# Convert to DataFrame
df = pd.DataFrame(invoices.data)

# Calculate monthly revenue
df['created_at'] = pd.to_datetime(df['created_at'])
monthly = df.groupby(df['created_at'].dt.month)['total_amount'].sum()

# Plot revenue trend
plt.figure(figsize=(10, 6))
monthly.plot(kind='bar')
plt.title('Monthly Revenue')
plt.xlabel('Month')
plt.ylabel('Revenue ($)')
plt.savefig('revenue_chart.png')`}</code>
          </pre>
        </div>

        {/* Automation */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Automation Scripts</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Automate inventory alerts and reporting.
          </p>
          <pre className="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto">
            <code className="text-foreground">{`# Low stock alert automation
def check_low_stock():
    products = supabase.table('products').select("*").lte('stock_quantity', 10).execute()
    
    for product in products.data:
        print(f"Low stock: {product['name']} - {product['stock_quantity']} units")
        # Send email notification
        # send_alert_email(product)

# Run daily with cron or scheduler
check_low_stock()`}</code>
          </pre>
        </div>

        {/* Resources */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <ExternalLink className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Resources</h3>
          </div>
          <ul className="space-y-3">
            <li>
              <a href="https://supabase.com/docs/reference/python/introduction" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <ExternalLink className="h-4 w-4" />
                Supabase Python Client Documentation
              </a>
            </li>
            <li>
              <a href="https://pandas.pydata.org/docs/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <ExternalLink className="h-4 w-4" />
                Pandas Documentation
              </a>
            </li>
            <li>
              <a href="https://matplotlib.org/stable/tutorials/index.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <ExternalLink className="h-4 w-4" />
                Matplotlib Tutorials
              </a>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
