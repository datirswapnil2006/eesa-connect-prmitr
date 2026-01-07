import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Linkedin,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="eesa-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/eesa-logo.jpg"
                alt="EESA logo"
                className="w-10 h-10 object-contain rounded-md group-hover:scale-105 transition-transform"
              />
              <span className="font-display  text-xl tracking-wide text-background">
                EESA
              </span>
            </Link>

            <p className="text-background/70 text-sm leading-relaxed">
              Electronics Engineering Students Association – fostering innovation,
              collaboration, and excellence in electronics education.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/eesa_prmitr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://www.linkedin.com/in/eesa-electronics-engineering-student-association-b7b8073a1/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>



            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {["Home", "About", "Blog", "Events", "Gallery", "Forum"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      to={`/${link.toLowerCase() === "home" ? "" : link.toLowerCase()}`}
                      className="text-background/70 hover:text-primary transition-colors text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Forum Topics */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Forum Topics</h4>
            <ul className="space-y-3">
              {[
                "IT & Computing",
                "Core Electronics",
                "Career Development",
                "Project Ideas",
                "Resources",
              ].map((topic) => (
                <li key={topic}>
                  <Link
                    to="/forum"
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {topic}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">

              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span className="text-background/70 text-sm leading-relaxed">
                  Prof. Ram Meghe Institute of Technology & Research, Badnera,<br />
                  Amravati, Maharashtra, India
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a
                  href="mailto:eesa.prmitr@gmail.com"
                  className="text-background/70 hover:text-primary transition-colors text-sm"
                >
                  eesa.prmitr@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-background/70 text-sm">
                  Contact via official email
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} EESA. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-background/50 hover:text-primary text-sm transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="text-background/50 hover:text-primary text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
