import { useState } from "react";
import { Bell, Search, User, Menu, LogOut } from "lucide-react";
import { SearchModal } from "./SearchModal";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
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
                className="h-10 w-48 lg:w-64 rounded-lg bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
                readOnly
              />
            </div>

            {/* Mobile Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* User */}
            <div className="flex items-center gap-2 lg:gap-3 rounded-lg bg-muted/50 p-2 lg:px-3 lg:py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-foreground">{user?.email?.split("@")[0] || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
