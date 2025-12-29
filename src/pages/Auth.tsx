import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LogIn, UserPlus, KeyRound } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
];

type AuthMode = "login" | "register" | "forgot";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "answer" | "reset">("email");
  const [userSecurityQuestion, setUserSecurityQuestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e: any) {
      newErrors.email = e.errors[0].message;
    }
    
    if (mode !== "forgot" || forgotStep === "reset") {
      try {
        passwordSchema.parse(mode === "forgot" ? newPassword : password);
      } catch (e: any) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    if (mode === "register") {
      if (!fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!securityAnswer.trim()) {
        newErrors.securityAnswer = "Security answer is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Welcome back!");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          security_question: securityQuestion,
          security_answer: securityAnswer.toLowerCase().trim(),
        },
      },
    });
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created successfully!");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotStep === "email") {
      if (!email.trim()) {
        setErrors({ email: "Email is required" });
        return;
      }
      
      setIsLoading(true);
      const { data, error } = await supabase.rpc("get_security_question", {
        user_email: email,
      });
      setIsLoading(false);
      
      if (error || !data) {
        toast.error("No account found with this email");
        return;
      }
      
      setUserSecurityQuestion(data);
      setForgotStep("answer");
    } else if (forgotStep === "answer") {
      if (!securityAnswer.trim()) {
        setErrors({ securityAnswer: "Answer is required" });
        return;
      }
      
      setIsLoading(true);
      const { data, error } = await supabase.rpc("verify_security_answer", {
        user_email: email,
        answer: securityAnswer.toLowerCase().trim(),
      });
      setIsLoading(false);
      
      if (error || !data) {
        toast.error("Incorrect answer. Please try again.");
        return;
      }
      
      setForgotStep("reset");
      toast.success("Answer verified! Please set a new password.");
    } else if (forgotStep === "reset") {
      if (!validateForm()) return;
      
      // For security question reset, we use the admin API via an edge function
      // For now, we'll use the standard password reset flow
      toast.info("Please check your email for password reset instructions.");
      setIsLoading(true);
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      setIsLoading(false);
      setMode("login");
      resetForm();
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setSecurityQuestion(SECURITY_QUESTIONS[0]);
    setSecurityAnswer("");
    setNewPassword("");
    setForgotStep("email");
    setUserSecurityQuestion("");
    setErrors({});
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 mx-auto mb-4">
              {mode === "login" && <LogIn className="h-8 w-8 text-primary" />}
              {mode === "register" && <UserPlus className="h-8 w-8 text-primary" />}
              {mode === "forgot" && <KeyRound className="h-8 w-8 text-primary" />}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "login" && "Welcome Back"}
              {mode === "register" && "Create Account"}
              {mode === "forgot" && "Reset Password"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "login" && "Sign in to access your dashboard"}
              {mode === "register" && "Register to get started"}
              {mode === "forgot" && "Verify your identity to reset password"}
            </p>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgotPassword} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
              </div>
            )}

            {(mode !== "forgot" || forgotStep === "email") && (
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  className="input-field mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
            )}

            {mode === "forgot" && forgotStep === "answer" && (
              <>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Security Question:</p>
                  <p className="font-medium text-foreground">{userSecurityQuestion}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Your Answer</label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Enter your answer"
                  />
                  {errors.securityAnswer && <p className="text-sm text-destructive mt-1">{errors.securityAnswer}</p>}
                </div>
              </>
            )}

            {mode !== "forgot" && (
              <div>
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field mt-1 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground mt-0.5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>
            )}

            {mode === "register" && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground">Security Question</label>
                  <select
                    className="input-field mt-1"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                  >
                    {SECURITY_QUESTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Security Answer</label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Your answer (used for password recovery)"
                  />
                  {errors.securityAnswer && <p className="text-sm text-destructive mt-1">{errors.securityAnswer}</p>}
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-6"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" && "Sign In"}
              {mode === "register" && "Create Account"}
              {mode === "forgot" && forgotStep === "email" && "Find Account"}
              {mode === "forgot" && forgotStep === "answer" && "Verify Answer"}
              {mode === "forgot" && forgotStep === "reset" && "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === "login" && (
              <>
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => switchMode("forgot")}
                >
                  Forgot password?
                </button>
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    className="text-primary hover:underline font-medium"
                    onClick={() => switchMode("register")}
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode === "register" && (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  className="text-primary hover:underline font-medium"
                  onClick={() => switchMode("login")}
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <button
                className="text-sm text-primary hover:underline"
                onClick={() => switchMode("login")}
              >
                Back to login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
