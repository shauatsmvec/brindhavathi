import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Store, User, Bell, Shield, Database, Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserManagement } from "@/components/settings/UserManagement";

interface NotificationSettings {
  low_stock_alerts: boolean;
  new_order_notifications: boolean;
  payment_confirmations: boolean;
  daily_summary_reports: boolean;
  weekly_analytics_digest: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Store settings
  const [storeName, setStoreName] = useState("E-Trends Explorer");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  
  // User profile from backend
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Store settings from backend
  const { data: storeSettings, isLoading: storeLoading } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // Notification preferences from backend
  const { data: notificationPrefs, isLoading: notifLoading } = useQuery({
    queryKey: ["notification_preferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    low_stock_alerts: true,
    new_order_notifications: true,
    payment_confirmations: true,
    daily_summary_reports: false,
    weekly_analytics_digest: true,
  });

  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("primary");

  // Load data into state
  useEffect(() => {
    if (storeSettings) {
      setStoreName(storeSettings.store_name || "E-Trends Explorer");
      setStoreEmail(storeSettings.store_email || "");
      setStoreAddress(storeSettings.store_address || "");
    }
  }, [storeSettings]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  useEffect(() => {
    if (notificationPrefs) {
      setNotifications({
        low_stock_alerts: notificationPrefs.low_stock_alerts,
        new_order_notifications: notificationPrefs.new_order_notifications,
        payment_confirmations: notificationPrefs.payment_confirmations,
        daily_summary_reports: notificationPrefs.daily_summary_reports,
        weekly_analytics_digest: notificationPrefs.weekly_analytics_digest,
      });
    }
  }, [notificationPrefs]);

  useEffect(() => {
    const savedAppearance = localStorage.getItem("appearanceSettings");
    if (savedAppearance) {
      const parsed = JSON.parse(savedAppearance);
      setTheme(parsed.theme || "dark");
      setAccentColor(parsed.accentColor || "primary");
    }
  }, []);

  // Save store settings mutation
  const saveStoreMutation = useMutation({
    mutationFn: async () => {
      if (storeSettings?.id) {
        const { error } = await supabase
          .from("store_settings")
          .update({ store_name: storeName, store_email: storeEmail, store_address: storeAddress })
          .eq("id", storeSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("store_settings")
          .insert({ store_name: storeName, store_email: storeEmail, store_address: storeAddress });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store_settings"] });
      toast.success("Store settings saved");
    },
    onError: (error) => toast.error("Failed to save: " + error.message),
  });

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error("Failed to update: " + error.message),
  });

  // Save notification preferences mutation
  const saveNotificationsMutation = useMutation({
    mutationFn: async (notifs: NotificationSettings) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      if (notificationPrefs?.id) {
        const { error } = await supabase
          .from("notification_preferences")
          .update(notifs)
          .eq("id", notificationPrefs.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_preferences")
          .insert({ ...notifs, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_preferences"] });
      toast.success("Notification preferences updated");
    },
    onError: (error) => toast.error("Failed to save: " + error.message),
  });

  const handleToggleNotification = (key: keyof NotificationSettings) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    saveNotificationsMutation.mutate(updated);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Failed to update password: " + error.message);
    } else {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleExportData = async () => {
    try {
      // Fetch all data from backend
      const [products, invoices, customers, suppliers, expenses] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("invoices").select("*"),
        supabase.from("customers").select("*"),
        supabase.from("suppliers").select("*"),
        supabase.from("expenses").select("*"),
      ]);
      
      const exportData = {
        products: products.data || [],
        invoices: invoices.data || [],
        customers: customers.data || [],
        suppliers: suppliers.data || [],
        expenses: expenses.data || [],
        exportedAt: new Date().toISOString(),
      };
      
      // Convert to CSV-like format
      const csvData: string[] = [];
      
      // Products CSV
      if (exportData.products.length > 0) {
        csvData.push("=== PRODUCTS ===");
        csvData.push(Object.keys(exportData.products[0]).join(","));
        exportData.products.forEach(p => csvData.push(Object.values(p).join(",")));
        csvData.push("");
      }
      
      // Invoices CSV
      if (exportData.invoices.length > 0) {
        csvData.push("=== INVOICES ===");
        csvData.push(Object.keys(exportData.invoices[0]).join(","));
        exportData.invoices.forEach(i => csvData.push(Object.values(i).join(",")));
        csvData.push("");
      }
      
      // Customers CSV
      if (exportData.customers.length > 0) {
        csvData.push("=== CUSTOMERS ===");
        csvData.push(Object.keys(exportData.customers[0]).join(","));
        exportData.customers.forEach(c => csvData.push(Object.values(c).join(",")));
        csvData.push("");
      }
      
      // Suppliers CSV
      if (exportData.suppliers.length > 0) {
        csvData.push("=== SUPPLIERS ===");
        csvData.push(Object.keys(exportData.suppliers[0]).join(","));
        exportData.suppliers.forEach(s => csvData.push(Object.values(s).join(",")));
        csvData.push("");
      }
      
      // Expenses CSV
      if (exportData.expenses.length > 0) {
        csvData.push("=== EXPENSES ===");
        csvData.push(Object.keys(exportData.expenses[0]).join(","));
        exportData.expenses.forEach(e => csvData.push(Object.values(e).join(",")));
      }
      
      const blob = new Blob([csvData.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `e-trends-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (error: any) {
      toast.error("Export failed: " + error.message);
    }
  };

  const handleCreateBackup = () => {
    const backup = {
      storeName,
      storeEmail,
      storeAddress,
      notifications,
      theme,
      accentColor,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `e-trends-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup created and downloaded");
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("appearanceSettings", JSON.stringify({ theme: newTheme, accentColor }));
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleAccentChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem("appearanceSettings", JSON.stringify({ theme, accentColor: color }));
    toast.success("Accent color updated");
  };

  const accentColors = [
    { name: "primary", class: "bg-primary" },
    { name: "info", class: "bg-info" },
    { name: "warning", class: "bg-warning" },
    { name: "success", class: "bg-success" },
    { name: "purple", class: "bg-purple-500" },
  ];

  if (storeLoading || notifLoading) {
    return (
      <DashboardLayout title="Settings" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
          <form onSubmit={(e) => { e.preventDefault(); saveStoreMutation.mutate(); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Name</label>
              <input 
                type="text" 
                className="input-field mt-1" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Email</label>
              <input 
                type="email" 
                className="input-field mt-1" 
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Address</label>
              <textarea 
                className="input-field mt-1 resize-none" 
                rows={2} 
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={saveStoreMutation.isPending}>
              {saveStoreMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </button>
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
          <form onSubmit={(e) => { e.preventDefault(); saveProfileMutation.mutate(); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <input 
                type="text" 
                className="input-field mt-1" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input 
                type="email" 
                className="input-field mt-1" 
                value={user?.email || ""}
                disabled 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <input type="text" className="input-field mt-1" value="Administrator" disabled />
            </div>
            <button type="submit" className="btn-primary" disabled={saveProfileMutation.isPending}>
              {saveProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </button>
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
              { key: "low_stock_alerts" as const, label: "Low stock alerts" },
              { key: "new_order_notifications" as const, label: "New order notifications" },
              { key: "payment_confirmations" as const, label: "Payment confirmations" },
              { key: "daily_summary_reports" as const, label: "Daily summary reports" },
              { key: "weekly_analytics_digest" as const, label: "Weekly analytics digest" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  onClick={() => handleToggleNotification(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[item.key] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[item.key] ? "translate-x-6" : "translate-x-1"
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
          <form onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">New Password</label>
              <input 
                type="password" 
                className="input-field mt-1" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
              <input 
                type="password" 
                className="input-field mt-1" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Update Password</button>
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
              <p className="text-sm text-muted-foreground mb-2">Create a backup of your settings</p>
              <button onClick={handleCreateBackup} className="btn-secondary w-full">Create Backup</button>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground mb-2">Export all data as CSV</p>
              <button onClick={handleExportData} className="btn-secondary w-full">Export Data</button>
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
              <select 
                className="input-field mt-1"
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
              >
                <option value="dark">Dark (Default)</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Accent Color</label>
              <div className="mt-2 flex gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleAccentChange(color.name)}
                    className={`h-8 w-8 rounded-full ${color.class} ring-2 ring-offset-2 ring-offset-background ${
                      accentColor === color.name ? "ring-primary" : "ring-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Management - Full Width */}
        <UserManagement />
      </div>
    </DashboardLayout>
  );
}
