import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase/client";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate("/admin/dashboard");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        "Password reset email sent. Please check your inbox."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-slate-200 transition-all shadow-2xs group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        {/* LOGOS */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <OptimizedImage
            src="/eesa-logo.jpg"
            alt="EESA Logo"
            variant="logo"
            priority={true}
            containerClassName="w-14 h-14"
          />
          <OptimizedImage
            src="/college-logo.jpg"
            alt="PRMITR Logo"
            variant="logo"
            priority={true}
            containerClassName="w-14 h-14"
          />
        </div>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="text-gray-500 mt-1">
            Electronics Engineering Students Association (EESA)
          </p>
          <p className="text-sm text-gray-400">
            PRMITR, Badnera
          </p>
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded mb-4">
            {errorMsg}
          </div>
        )}

        {/* SUCCESS */}
        {successMsg && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded mb-4">
            {successMsg}
          </div>
        )}

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="admin@prmitr.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-right mb-6">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* FOOTER */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Authorized access only • PRMITR
        </p>
      </div>
    </div>
  );
}
