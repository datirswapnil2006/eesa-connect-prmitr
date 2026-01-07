import { useQuery } from "@tanstack/react-query";
import { getHomeHero } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowRight, Cpu, Users, Calendar } from "lucide-react";

export default function HeroSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-hero"],
    queryFn: getHomeHero,
  });

  if (isLoading || !data) return null;

  return (
    <section className="relative bg-white overflow-hidden text-primary">
      {/* Circuit Pattern Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="circuit-pattern"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M10 10h40v40h40M50 50v40h40M90 10v40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="10" cy="10" r="3" />
            <circle cx="50" cy="50" r="3" />
            <circle cx="90" cy="10" r="3" />
            <circle cx="90" cy="90" r="3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      </svg>

      {/* Gradient Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-eesa-teal/10 opacity-60 pointer-events-none" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT CONTENT */}
        <div>
          {/* Badge */}
          <span className="inline-flex items-center gap-2 mb-6 px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide">
            Electronics Engineering Students Association
          </span>

          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
            Building the Future of <span className="text-primary">Electronics Engineering</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg text-slate-600 max-w-xl">
            {data.subtitle}
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to={data.primary_button_link}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-white font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
            >
              {data.primary_button_text}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to={data.secondary_button_link}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-8 py-4 text-slate-700 font-semibold hover:bg-slate-100 transition"
            >
              {data.secondary_button_text}
            </Link>
          </div>
        </div>

        {/* RIGHT INTERACTIVE PANEL */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {[
            {
              icon: Users,
              title: "Strong Community",
              desc: "Connect with passionate engineers and mentors.",
            },
            {
              icon: Calendar,
              title: "Live Events",
              desc: "Workshops, hackathons & expert sessions.",
            },
            {
              icon: Cpu,
              title: "Hands-on Projects",
              desc: "Real-world electronics & software builds.",
            },
            {
              icon: ArrowRight,
              title: "Career Growth",
              desc: "Placement prep & industry exposure.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-eesa-teal/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <item.icon className="w-8 h-8 text-primary mb-4 relative z-10" />

              <h3 className="text-lg font-semibold text-slate-900 relative z-10">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-slate-600 relative z-10">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
