import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔑 IMPORTANT: establish session from recovery link
  useEffect(() => {
    const handleRecovery = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setMessage("Invalid or expired reset link.");
      }
    };

    handleRecovery();
  }, []);

  const updatePassword = async () => {
    if (!password) {
      setMessage("Please enter a new password");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Failed to update password. Try again.");
    } else {
      setMessage("Password updated successfully. Redirecting...");
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs md:text-sm font-semibold text-slate-700 hover:text-primary hover:bg-slate-200 transition-all shadow-2xs group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Login</span>
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">
          Reset Password
        </h2>

        {message && (
          <p className="text-sm text-center mb-4 text-gray-600">
            {message}
          </p>
        )}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          onClick={updatePassword}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
