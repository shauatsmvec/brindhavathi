import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Store, User, Bell, Shield, Database, Palette } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your store preferences and configurations"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store Settings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Store Information</h3>
              <p className="text-sm text-muted-foreground">Basic store details</p>
            </div>
          </div>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Name</label>
              <input type="text" className="input-field mt-1" defaultValue="E-Trends Explorer" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Email</label>
              <input type="email" className="input-field mt-1" defaultValue="admin@etrends.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Address</label>
              <textarea className="input-field mt-1 resize-none" rows={2} defaultValue="123 Business Street, Tech City, TC 12345" />
            </div>
            <button type="button" className="btn-primary">Save Changes</button>
          </form>
        </div>

        {/* User Settings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
              <User className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">User Profile</h3>
              <p className="text-sm text-muted-foreground">Your account settings</p>
            </div>
          </div>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <input type="text" className="input-field mt-1" defaultValue="Admin User" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input type="email" className="input-field mt-1" defaultValue="admin@etrends.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <input type="text" className="input-field mt-1" defaultValue="Store Manager" disabled />
            </div>
            <button type="button" className="btn-primary">Update Profile</button>
          </form>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">Alert preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Low stock alerts", checked: true },
              { label: "New order notifications", checked: true },
              { label: "Payment confirmations", checked: true },
              { label: "Daily summary reports", checked: false },
              { label: "Weekly analytics digest", checked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    item.checked ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      item.checked ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">Password and access</p>
            </div>
          </div>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Password</label>
              <input type="password" className="input-field mt-1" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">New Password</label>
              <input type="password" className="input-field mt-1" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
              <input type="password" className="input-field mt-1" placeholder="••••••••" />
            </div>
            <button type="button" className="btn-primary">Update Password</button>
          </form>
        </div>

        {/* Data & Backup */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
              <Database className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
              <p className="text-sm text-muted-foreground">Backup and export</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground mb-2">Last backup: January 15, 2024 at 3:00 AM</p>
              <button className="btn-secondary w-full">Create Backup</button>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground mb-2">Export all data as CSV</p>
              <button className="btn-secondary w-full">Export Data</button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Palette className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">Customize your dashboard</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Theme</label>
              <select className="input-field mt-1">
                <option>Dark (Default)</option>
                <option>Light</option>
                <option>System</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Accent Color</label>
              <div className="mt-2 flex gap-3">
                {["bg-primary", "bg-info", "bg-warning", "bg-success", "bg-purple-500"].map((color) => (
                  <button
                    key={color}
                    className={`h-8 w-8 rounded-full ${color} ring-2 ring-offset-2 ring-offset-background ${
                      color === "bg-primary" ? "ring-primary" : "ring-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
