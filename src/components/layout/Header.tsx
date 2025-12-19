import { forwardRef } from "react";
import { Bell, Search, User, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(function Header({ title, subtitle, onMenuClick }, ref) {
  return (
    <header className="sticky top-0 z-30 h-16 lg:h-20 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex h-full items-center justify-between px-4 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Title */}
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything..."
              className="h-10 w-48 lg:w-64 rounded-lg bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Mobile Search Button */}
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 lg:h-5 lg:w-5 items-center justify-center rounded-full bg-primary text-[10px] lg:text-xs font-medium text-primary-foreground">
              3
            </span>
          </button>

          {/* User */}
          <button className="flex items-center gap-2 lg:gap-3 rounded-lg bg-muted/50 p-2 lg:px-3 lg:py-2 transition-colors hover:bg-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">Store Manager</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
});
