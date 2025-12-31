import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { initSession } from "@/hooks/useAuth";
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
  "What was the name of your first school?",
  "What is your favorite book?",
  "What is the name of your favorite teacher?",
];

type AuthMode = "login" | "register" | "forgot";

interface SecurityQA {
  question: string;
  answer: string;
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [securityQAs, setSecurityQAs] = useState<SecurityQA[]>([
    { question: SECURITY_QUESTIONS[0], answer: "" },
    { question: SECURITY_QUESTIONS[1], answer: "" },
    { question: SECURITY_QUESTIONS[2], answer: "" },
  ]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "answer" | "reset">("email");
  const [userSecurityQuestions, setUserSecurityQuestions] = useState<{question_1: string; question_2: string; question_3: string} | null>(null);
  const [forgotAnswers, setForgotAnswers] = useState(["", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        initSession(session.access_token);
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        initSession(session.access_token);
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
      securityQAs.forEach((qa, idx) => {
        if (!qa.answer.trim()) {
          newErrors[`securityAnswer${idx}`] = "This answer is required";
        }
      });
      
      // Check for unique questions
      const questions = securityQAs.map(qa => qa.question);
      if (new Set(questions).size !== questions.length) {
        newErrors.securityQuestions = "Please select different security questions";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
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
    } else if (data.session) {
      initSession(data.session.access_token);
      toast.success("Welcome back!");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          security_question: securityQAs[0].question,
          security_answer: securityQAs[0].answer.toLowerCase().trim(),
          security_question_2: securityQAs[1].question,
          security_answer_2: securityQAs[1].answer.toLowerCase().trim(),
          security_question_3: securityQAs[2].question,
          security_answer_3: securityQAs[2].answer.toLowerCase().trim(),
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
    } else if (data.session) {
      initSession(data.session.access_token);
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
      const { data, error } = await supabase.rpc("get_security_questions", {
        user_email: email,
      });
      setIsLoading(false);
      
      if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
        toast.error("No account found with this email");
        return;
      }
      
      const questions = data as { question_1: string; question_2: string; question_3: string };
      setUserSecurityQuestions(questions);
      setForgotStep("answer");
    } else if (forgotStep === "answer") {
      if (forgotAnswers.some((a, i) => {
        const q = i === 0 ? userSecurityQuestions?.question_1 : i === 1 ? userSecurityQuestions?.question_2 : userSecurityQuestions?.question_3;
        return q && !a.trim();
      })) {
        setErrors({ forgotAnswers: "Please answer all security questions" });
        return;
      }
      
      setIsLoading(true);
      const { data, error } = await supabase.rpc("verify_security_answers", {
        user_email: email,
        answer_1: forgotAnswers[0].toLowerCase().trim(),
        answer_2: userSecurityQuestions?.question_2 ? forgotAnswers[1].toLowerCase().trim() : null,
        answer_3: userSecurityQuestions?.question_3 ? forgotAnswers[2].toLowerCase().trim() : null,
      });
      setIsLoading(false);
      
      if (error || !data) {
        toast.error("One or more answers are incorrect. Please try again.");
        return;
      }
      
      setForgotStep("reset");
      toast.success("Answers verified! Please set a new password.");
    } else if (forgotStep === "reset") {
      try {
        passwordSchema.parse(newPassword);
      } catch (e: any) {
        setErrors({ password: e.errors[0].message });
        return;
      }
      
      // Use admin password update via edge function or direct update
      // For now, use magic link as fallback
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setIsLoading(false);
      
      if (error) {
        // If not authenticated, send reset link
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        toast.success("Password reset link sent to your email.");
      } else {
        toast.success("Password updated successfully! Please login.");
      }
      
      setMode("login");
      resetForm();
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setSecurityQAs([
      { question: SECURITY_QUESTIONS[0], answer: "" },
      { question: SECURITY_QUESTIONS[1], answer: "" },
      { question: SECURITY_QUESTIONS[2], answer: "" },
    ]);
    setNewPassword("");
    setForgotStep("email");
    setUserSecurityQuestions(null);
    setForgotAnswers(["", "", ""]);
    setErrors({});
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const updateSecurityQA = (index: number, field: "question" | "answer", value: string) => {
    setSecurityQAs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const getAvailableQuestions = (currentIndex: number) => {
    const usedQuestions = securityQAs
      .filter((_, idx) => idx !== currentIndex)
      .map(qa => qa.question);
    return SECURITY_QUESTIONS.filter(q => !usedQuestions.includes(q));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 max-h-[90vh] overflow-y-auto">
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

            {mode === "forgot" && forgotStep === "answer" && userSecurityQuestions && (
              <div className="space-y-4">
                {[userSecurityQuestions.question_1, userSecurityQuestions.question_2, userSecurityQuestions.question_3]
                  .filter(Boolean)
                  .map((question, idx) => (
                    <div key={idx}>
                      <div className="bg-muted/50 rounded-lg p-3 mb-2">
                        <p className="text-sm text-muted-foreground">Question {idx + 1}:</p>
                        <p className="font-medium text-foreground text-sm">{question}</p>
                      </div>
                      <input
                        type="text"
                        className="input-field"
                        value={forgotAnswers[idx]}
                        onChange={(e) => {
                          const updated = [...forgotAnswers];
                          updated[idx] = e.target.value;
                          setForgotAnswers(updated);
                        }}
                        placeholder="Your answer"
                      />
                    </div>
                  ))}
                {errors.forgotAnswers && <p className="text-sm text-destructive">{errors.forgotAnswers}</p>}
              </div>
            )}

            {mode === "forgot" && forgotStep === "reset" && (
              <div>
                <label className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field mt-1 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
              <div className="space-y-4 pt-2">
                <p className="text-sm font-medium text-foreground">Security Questions (for password recovery)</p>
                {errors.securityQuestions && <p className="text-sm text-destructive">{errors.securityQuestions}</p>}
                
                {securityQAs.map((qa, idx) => (
                  <div key={idx} className="space-y-2 p-3 rounded-lg bg-muted/30">
                    <label className="text-xs font-medium text-muted-foreground">Question {idx + 1}</label>
                    <select
                      className="input-field"
                      value={qa.question}
                      onChange={(e) => updateSecurityQA(idx, "question", e.target.value)}
                    >
                      {getAvailableQuestions(idx).map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                      <option value={qa.question}>{qa.question}</option>
                    </select>
                    <input
                      type="text"
                      className="input-field"
                      value={qa.answer}
                      onChange={(e) => updateSecurityQA(idx, "answer", e.target.value)}
                      placeholder="Your answer"
                    />
                    {errors[`securityAnswer${idx}`] && (
                      <p className="text-sm text-destructive">{errors[`securityAnswer${idx}`]}</p>
                    )}
                  </div>
                ))}
              </div>
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
              {mode === "forgot" && forgotStep === "answer" && "Verify Answers"}
              {mode === "forgot" && forgotStep === "reset" && "Update Password"}
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
