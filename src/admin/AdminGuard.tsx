import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

export default function AdminGuard({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setAllowed(true);
      } else {
        window.location.href = "/admin/login";
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <p className="text-center mt-20">Checking access...</p>;

  return allowed ? children : null;
}
