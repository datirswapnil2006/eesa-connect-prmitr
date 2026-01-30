import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMembershipSettings } from "@/lib/api";



const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Blog", path: "/blog" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Forum", path: "/forum" },
];

type MembershipSettings = {
  enabled: boolean;
  form_url: string;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [membership, setMembership] = useState<MembershipSettings | null>(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    getMembershipSettings().then((data) => {
      if (data) {
        setMembership({
          enabled: data.enabled,
          form_url: data.form_url,
        });
      }
    });
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* LEFT: EESA */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <img
              src="/eesa-logo.jpg"
              alt="EESA Logo"
              className="w-11 h-11 md:w-10 md:h-10 object-contain"
            />
            <span className="font-display text-lg md:text-xl tracking-wide">
              EESA
            </span>
          </Link>

          {/* CENTER NAV (DESKTOP) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive(link.path)
                      ? "text-primary bg-primary/10"
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
            <img
              src="/college-logo.jpg"
              alt="PRMITR Logo"
              className="w-11 h-11 md:w-10 md:h-10 object-contain"
            />
            <span className="font-display text-lg md:text-xl tracking-wide">
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
                  <img src="/eesa-logo.jpg" className="w-12 h-12" />
                  <span className="font-semibold">EESA</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/college-logo.jpg" className="w-12 h-12" />
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
