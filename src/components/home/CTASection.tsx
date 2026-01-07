import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-eesa-teal">
      {/* Decorative blurred shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-24 text-center text-white">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-md text-sm font-semibold tracking-wide mb-6 shadow-md">
          <Sparkles className="w-4 h-4" />
          Join the EESA Community
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
          Shape the Future of <br className="hidden md:block" />
          Electronics Engineering
        </h2>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
          Collaborate with innovators, gain hands-on experience, and access
          exclusive opportunities designed to accelerate your engineering
          career with EESA.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 gap-2 px-10 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <Link to="/about">
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-white/80 text-primary hover:bg-primary/10 px-10 transition-transform hover:-translate-y-0.5"
          >
            <Link to="/forum">Visit Forum</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
