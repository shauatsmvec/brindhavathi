import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Store, User, Bell, Shield, Database, Palette } from "lucide-react";
import { toast } from "sonner";

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storeAddress: string;
}

interface UserSettings {
  fullName: string;
  email: string;
  role: string;
}

interface NotificationSettings {
  lowStockAlerts: boolean;
  newOrderNotifications: boolean;
  paymentConfirmations: boolean;
  dailySummaryReports: boolean;
  weeklyAnalyticsDigest: boolean;
}

interface AppearanceSettings {
  theme: string;
  accentColor: string;
}

const defaultStoreSettings: StoreSettings = {
  storeName: "E-Trends Explorer",
  storeEmail: "admin@etrends.com",
  storeAddress: "123 Business Street, Tech City, TC 12345",
};

const defaultUserSettings: UserSettings = {
  fullName: "Admin User",
  email: "admin@etrends.com",
  role: "Store Manager",
};

const defaultNotificationSettings: NotificationSettings = {
  lowStockAlerts: true,
  newOrderNotifications: true,
  paymentConfirmations: true,
  dailySummaryReports: false,
  weeklyAnalyticsDigest: true,
};

const defaultAppearanceSettings: AppearanceSettings = {
  theme: "dark",
  accentColor: "primary",
};

export default function Settings() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultUserSettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(defaultAppearanceSettings);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedStore = localStorage.getItem("storeSettings");
    const savedUser = localStorage.getItem("userSettings");
    const savedNotifications = localStorage.getItem("notificationSettings");
    const savedAppearance = localStorage.getItem("appearanceSettings");

    if (savedStore) setStoreSettings(JSON.parse(savedStore));
    if (savedUser) setUserSettings(JSON.parse(savedUser));
    if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
    if (savedAppearance) setAppearanceSettings(JSON.parse(savedAppearance));
  }, []);

  const handleSaveStoreSettings = () => {
    localStorage.setItem("storeSettings", JSON.stringify(storeSettings));
    toast.success("Store settings saved successfully");
  };

  const handleSaveUserSettings = () => {
    localStorage.setItem("userSettings", JSON.stringify(userSettings));
    toast.success("User profile updated successfully");
  };

  const handleToggleNotification = (key: keyof NotificationSettings) => {
    const updated = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(updated);
    localStorage.setItem("notificationSettings", JSON.stringify(updated));
    toast.success("Notification preference updated");
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
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
    // In a real app, this would call an API
    toast.success("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleCreateBackup = () => {
    const backup = {
      storeSettings,
      userSettings,
      notificationSettings,
      appearanceSettings,
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

  const handleExportData = () => {
    toast.info("Data export feature - Connect to backend for full export");
  };

  const handleThemeChange = (theme: string) => {
    const updated = { ...appearanceSettings, theme };
    setAppearanceSettings(updated);
    localStorage.setItem("appearanceSettings", JSON.stringify(updated));
    toast.success(`Theme changed to ${theme}`);
  };

  const handleAccentChange = (color: string) => {
    const updated = { ...appearanceSettings, accentColor: color };
    setAppearanceSettings(updated);
    localStorage.setItem("appearanceSettings", JSON.stringify(updated));
    toast.success("Accent color updated");
  };

  const accentColors = [
    { name: "primary", class: "bg-primary" },
    { name: "info", class: "bg-info" },
    { name: "warning", class: "bg-warning" },
    { name: "success", class: "bg-success" },
    { name: "purple", class: "bg-purple-500" },
  ];

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
          <form onSubmit={(e) => { e.preventDefault(); handleSaveStoreSettings(); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Name</label>
              <input 
                type="text" 
                className="input-field mt-1" 
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Email</label>
              <input 
                type="email" 
                className="input-field mt-1" 
                value={storeSettings.storeEmail}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Store Address</label>
              <textarea 
                className="input-field mt-1 resize-none" 
                rows={2} 
                value={storeSettings.storeAddress}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
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
          <form onSubmit={(e) => { e.preventDefault(); handleSaveUserSettings(); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <input 
                type="text" 
                className="input-field mt-1" 
                value={userSettings.fullName}
                onChange={(e) => setUserSettings({ ...userSettings, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input 
                type="email" 
                className="input-field mt-1" 
                value={userSettings.email}
                onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <input type="text" className="input-field mt-1" value={userSettings.role} disabled />
            </div>
            <button type="submit" className="btn-primary">Update Profile</button>
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
              { key: "lowStockAlerts" as const, label: "Low stock alerts" },
              { key: "newOrderNotifications" as const, label: "New order notifications" },
              { key: "paymentConfirmations" as const, label: "Payment confirmations" },
              { key: "dailySummaryReports" as const, label: "Daily summary reports" },
              { key: "weeklyAnalyticsDigest" as const, label: "Weekly analytics digest" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  onClick={() => handleToggleNotification(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings[item.key] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings[item.key] ? "translate-x-6" : "translate-x-1"
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
              <label className="text-sm font-medium text-muted-foreground">Current Password</label>
              <input 
                type="password" 
                className="input-field mt-1" 
                placeholder="••••••••" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
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
                value={appearanceSettings.theme}
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
                      appearanceSettings.accentColor === color.name ? "ring-primary" : "ring-transparent"
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
