import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout
const SESSION_KEY = "e_trends_session_id";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem(SESSION_KEY);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }, []);

  // Handle visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && session) {
        const storedSessionId = sessionStorage.getItem(SESSION_KEY);
        if (!storedSessionId || storedSessionId !== session.access_token) {
          // Session mismatch - force logout
          signOut();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [session, signOut]);

  // Handle page refresh/beforeunload - clear session
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Mark session as ending on refresh
      sessionStorage.removeItem(SESSION_KEY);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Auto logout after inactivity
  useEffect(() => {
    if (!session) return;

    let timeoutId: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut();
      }, SESSION_TIMEOUT_MS);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    
    resetTimer(); // Start the timer

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [session, signOut]);

  // Check for existing session on page load
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem(SESSION_KEY);
    
    // If no stored session ID, user needs to login fresh
    if (!storedSessionId) {
      supabase.auth.signOut().then(() => {
        setIsLoading(false);
      });
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user) {
          // Store session token for tab/refresh validation
          sessionStorage.setItem(SESSION_KEY, session.access_token);
          
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.access_token === storedSessionId) {
        setSession(session);
        setUser(session.user);
        sessionStorage.setItem(SESSION_KEY, session.access_token);
        
        if (session.user) {
          checkAdminRole(session.user.id);
        }
      } else {
        // Session mismatch or expired
        supabase.auth.signOut();
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    
    if (!error && data) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper to initialize session after login
export function initSession(accessToken: string) {
  sessionStorage.setItem(SESSION_KEY, accessToken);
}
