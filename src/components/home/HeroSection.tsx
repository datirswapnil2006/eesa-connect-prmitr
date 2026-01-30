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
    <section className="relative bg-white overflow-hidden">
      {/* Circuit Pattern Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none text-primary"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="circuit-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-eesa-teal/10 pointer-events-none" />

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto px-6 py-28 flex flex-col items-center text-center">

        {/* MAIN BADGE (CENTER, BIG) */}
        <span className="inline-block px-10 py-4 rounded-full bg-primary/10 text-primary text-3xl md:text-5xl font-extrabold tracking-wide mb-4">
          Electronics Engineering Students Association (EESA)
        </span>
  
        {/* DEPARTMENT (TOP) */}
        <h2 className="text-xl md:text-3xl font-bold text-slate-700 mb-3">
          Department of Electronics & Telecommunication Engineering
        </h2>

        {/* INSTITUTE */}
        <h3 className="text-lg md:text-3xl font-bold text-blue-600 mb-8">
          Prof. Ram Meghe Institute of Technology & Research, Badnera - Amravati
        </h3>

        {/* SUBTITLE */}
        <p className="text-lg text-slate-600 max-w-2xl mb-12">
          {data.subtitle}
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
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

        {/* INFO CARDS (CENTERED BELOW BADGE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {[
            { icon: Users, title: "Strong Community", desc: "Connect with passionate engineers and mentors." },
            { icon: Calendar, title: "Live Events", desc: "Workshops, hackathons & expert sessions." },
            { icon: Cpu, title: "Hands-on Projects", desc: "Real-world electronics & software builds." },
            { icon: ArrowRight, title: "Career Growth", desc: "Placement prep & industry exposure." },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-eesa-teal/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <item.icon className="w-8 h-8 text-primary mb-4 relative z-10 mx-auto" />
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
