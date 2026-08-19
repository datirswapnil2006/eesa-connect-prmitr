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
            className="group flex items-center gap-2 text-slate-700 hover:text-primary transition-all duration-300 px-4 py-2 rounded-lg hover:bg-slate-100 bg-slate-50 border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition shadow-sm"
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
