import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMembershipSettings } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";

type MembershipSettings = {
  enabled: boolean;
  form_url: string;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [membership, setMembership] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Executive Members", path: "/executive-members" },
    { name: "Alumni", path: "/alumni" },
    { name: "Blog", path: "/blog" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "Forum", path: "/forum" },
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* LEFT: BACK BUTTON (on non-home pages) + EESA BRAND */}
          <div className="flex items-center gap-2">
            {location.pathname !== "/" && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-slate-700 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-100"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </button>
            )}

            <Link to="/" className="flex items-center gap-2 md:gap-3">
              <OptimizedImage
                src="/eesa-logo.jpg"
                alt="EESA Logo"
                variant="logo"
                priority={true}
                containerClassName="w-10 h-10 md:w-11 md:h-11"
              />
              <span className="font-display text-lg md:text-xl tracking-wide font-bold">
                EESA
              </span>
            </Link>
          </div>

          {/* CENTER NAV (DESKTOP) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive(link.path)
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute left-1/2 -bottom-1 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            ))}

            {membership?.enabled && (
              <a
                href={membership.form_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                Membership
              </a>
            )}
          </div>

          {/* RIGHT: PRMITR */}
          <div className="flex items-center gap-2 md:gap-3">
            <OptimizedImage
              src="/college-logo.jpg"
              alt="PRMITR Logo"
              variant="logo"
              priority={true}
              containerClassName="w-10 h-10 md:w-11 md:h-11"
            />
            <span className="font-display text-lg md:text-xl tracking-wide font-bold">
              PRMIT&R
            </span>
          </div>

          {/* MOBILE MENU BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-3 border-t border-slate-200 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">

              {/* MOBILE HEADER LOGOS */}
              <div className="flex justify-between px-4 pb-3">
                <div className="flex items-center gap-2">
                  <OptimizedImage
                    src="/eesa-logo.jpg"
                    alt="EESA Logo"
                    variant="logo"
                    containerClassName="w-10 h-10"
                  />
                  <span className="font-semibold">EESA</span>
                </div>
                <div className="flex items-center gap-2">
                  <OptimizedImage
                    src="/college-logo.jpg"
                    alt="PRMITR Logo"
                    variant="logo"
                    containerClassName="w-10 h-10"
                  />
                  <span className="font-semibold">PRMITR</span>
                </div>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium
                    ${
                      isActive(link.path)
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {membership?.enabled && (
                <a
                  href={membership.form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-4 mt-2 px-4 py-3 rounded-lg bg-primary text-white text-center font-medium"
                >
                  Membership
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
