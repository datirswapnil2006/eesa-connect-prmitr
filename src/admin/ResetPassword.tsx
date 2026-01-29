import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

export default function ResetPassword() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full">
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
