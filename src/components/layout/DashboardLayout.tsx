import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="lg:pl-64">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
