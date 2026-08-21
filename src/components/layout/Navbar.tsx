import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ArrowLeft,
  Home,
  Info,
  Users,
  GraduationCap,
  Award,
  FileText,
  CalendarDays,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMembershipSettings } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [membership, setMembership] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Executive Members", path: "/executive-members", icon: Users },
    { name: "Batch Members", path: "/batch-members", icon: GraduationCap },
    { name: "Alumni", path: "/alumni", icon: Award },
    { name: "Blog", path: "/blog", icon: FileText },
    { name: "Events", path: "/events", icon: CalendarDays },
    { name: "Gallery", path: "/gallery", icon: ImageIcon },
    { name: "Forum", path: "/forum", icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    getMembershipSettings().then((data) => {
      setMembership(data);
    });
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 2xl:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* LEFT: BACK BUTTON (on non-home pages) + EESA BRAND */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {location.pathname !== "/" && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="group flex items-center gap-1 text-slate-600 hover:text-primary transition-all px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/60"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs font-semibold hidden sm:inline">Back</span>
              </button>
            )}

            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <OptimizedImage
                src="/eesa-logo.jpg"
                alt="EESA Logo"
                variant="logo"
                priority={true}
                containerClassName="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-display text-base sm:text-lg lg:text-xl tracking-tight font-extrabold text-slate-900 leading-none">
                  EESA
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline leading-tight">
                  PRMIT&R
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER NAV (DESKTOP / LAPTOP) */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-2 py-1.5 xl:px-2.5 2xl:px-3.5 2xl:py-2 rounded-xl text-xs xl:text-[13px] 2xl:text-sm font-medium transition-all whitespace-nowrap
                    ${
                      active
                        ? "text-primary bg-primary/10 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute left-1/2 -bottom-1 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}

            {membership?.enabled && (
              <a
                href={membership.form_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1.5 xl:ml-2 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-xl bg-gradient-to-r from-primary to-eesa-teal text-white text-xs 2xl:text-sm font-semibold hover:opacity-95 shadow-sm transition whitespace-nowrap"
              >
                Membership
              </a>
            )}
          </div>

          {/* RIGHT: PRMITR BRAND + MOBILE TOGGLE */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <OptimizedImage
                src="/college-logo.jpg"
                alt="PRMITR Logo"
                variant="logo"
                priority={true}
                containerClassName="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl"
              />
              <span className="font-display text-sm sm:text-base lg:text-lg font-bold tracking-tight text-slate-800">
                PRMIT&R
              </span>
            </div>

            {/* MOBILE MENU BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 border border-slate-200/60"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-slate-800" />
              ) : (
                <Menu className="w-5 h-5 text-slate-800" />
              )}
            </Button>
          </div>

        </div>

        {/* MOBILE MENU DRAWER */}
        {isOpen && (
          <div className="lg:hidden pb-5 pt-3 border-t border-slate-200/80 animate-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col gap-1.5 max-h-[calc(100vh-5rem)] overflow-y-auto pr-1">

              {/* MOBILE HEADER INFO */}
              <div className="flex items-center justify-between p-3 mb-1 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <OptimizedImage
                    src="/eesa-logo.jpg"
                    alt="EESA Logo"
                    variant="logo"
                    containerClassName="w-8 h-8 rounded-lg"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-900">EESA Connect</span>
                    <span className="text-[10px] text-slate-500">PRMIT&R Badnera</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  Navigation
                </span>
              </div>

              {/* LINKS */}
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                      active
                        ? "bg-primary text-white font-bold shadow-xs"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {membership?.enabled && (
                <a
                  href={membership.form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 mx-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-eesa-teal text-white text-center text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition"
                >
                  Join Membership
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
