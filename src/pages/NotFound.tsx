import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow border border-slate-200">
        <h1 className="mb-2 text-5xl font-extrabold text-slate-900">404</h1>
        <p className="mb-6 text-lg text-slate-600">Oops! Page not found</p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
