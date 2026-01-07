import { useState } from "react";
import Layout from "@/components/layout/Layout";
import {
  Target,
  Eye,
  Users,
  Award,
  BookOpen,
  Lightbulb,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAboutPage, getAboutTeam } from "@/lib/api";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We encourage creative thinking and novel approaches to solving engineering challenges.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "Working together across disciplines to achieve greater outcomes.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BookOpen,
    title: "Learning",
    description:
      "Continuous growth through knowledge sharing and skill development.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Striving for the highest standards in everything we do.",
    color: "from-purple-500 to-pink-500",
  },
];

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeValue, setActiveValue] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["about-page"],
    queryFn: getAboutPage,
  });

  const { data: team } = useQuery({
    queryKey: ["about-team"],
    queryFn: getAboutTeam,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const whoWeAre = data?.find((item) => item.section_title === "Who We Are");
  const mission = data?.find((item) => item.section_title === "Our Mission");
  const vision = data?.find((item) => item.section_title === "Our Vision");

  return (
    <Layout>
      {/* ANIMATED HERO */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-br from-background via-secondary/40 to-background">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-eesa-teal/5 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        </div>

        <div className="eesa-container max-w-5xl text-center relative z-10">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 hover:bg-primary/20 transition-colors">
              <Sparkles className="w-4 h-4" />
              About Us
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-8 animate-fade-in-up animation-delay-100">
              About{" "}
              <span className="bg-gradient-to-r from-primary via-eesa-teal to-primary bg-clip-text text-transparent animate-gradient">
                EESA
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              {whoWeAre?.content}
            </p>
          </div>

          <div className="mt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 mx-auto text-primary/50" />
          </div>
        </div>
      </section>

      {/* INTERACTIVE MISSION & VISION */}
      <section className="eesa-section bg-card">
        <div className="eesa-container grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            {
              icon: Target,
              title: "Mission",
              content: mission?.content,
              gradient: "from-primary to-eesa-teal",
              accentColor: "primary",
            },
            {
              icon: Eye,
              title: "Vision",
              content: vision?.content,
              gradient: "from-eesa-teal to-primary",
              accentColor: "eesa-teal",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden eesa-card p-10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <item.icon className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {item.title}
                </h2>

                <p className="text-muted-foreground leading-relaxed text-base">
                  {item.content}
                </p>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE CORE VALUES */}
      <section className="eesa-section bg-background">
        <div className="eesa-container">
          <div className="text-center mb-20 animate-fade-in-up">
            <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              What We Stand For
            </span>
            <h2 className="eesa-section-title bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveValue(index)}
                onMouseLeave={() => setActiveValue(null)}
                className="group relative p-8 text-center rounded-3xl bg-card hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Animated background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center transform ${activeValue === index ? 'scale-110 rotate-12' : ''} transition-all duration-300 shadow-lg`}>
                    <value.icon className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {value.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>

                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE TEAM */}
      <section className="eesa-section bg-card">
        <div className="eesa-container">
          <div className="text-center mb-20">
            <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our People
            </span>
            <h2 className="eesa-section-title">Faculty & Members</h2>
          </div>

          {/* FACULTY */}
          <div className="mb-24">
            <h3 className="text-3xl font-bold mb-12 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-primary to-eesa-teal rounded-full" />
              Faculty Mentors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {team
                ?.filter((p) => p.role === "faculty")
                .map((person, idx) => (
                  <div
                    key={person.id}
                    onClick={() => setSelectedMember(selectedMember === person.id ? null : person.id)}
                    className="group relative p-10 rounded-3xl bg-background text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-eesa-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10">
                      <div className="relative inline-block mb-6">
                        <img
                          src={person.image_url}
                          alt={person.name}
                          className="w-32 h-32 mx-auto rounded-full object-cover ring-4 ring-primary/20 group-hover:ring-8 group-hover:ring-primary/40 transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-eesa-teal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <h4 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {person.name}
                      </h4>

                      <p className="text-primary text-sm font-medium mb-4">
                        {person.position}
                      </p>

                      <div className={`overflow-hidden transition-all duration-300 ${selectedMember === person.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {person.bio}
                        </p>
                      </div>

                      <button className="mt-4 text-xs text-primary hover:text-primary/80 transition-colors">
                        {selectedMember === person.id ? 'Show less' : 'Read more'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* MEMBERS */}
          <div>
            <h3 className="text-3xl font-bold mb-12 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-eesa-teal to-primary rounded-full" />
              Core Team Members
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team
                ?.filter((p) => p.role === "member")
                .map((person, idx) => (
                  <div
                    key={person.id}
                    className="group p-8 rounded-3xl bg-background text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="relative inline-block mb-5">
                      <img
                        src={person.image_url}
                        alt={person.name}
                        className="w-24 h-24 mx-auto rounded-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 rounded-full ring-2 ring-primary/0 group-hover:ring-primary/50 transition-all duration-300" />
                    </div>

                    <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {person.name}
                    </h4>

                    <p className="text-primary text-sm mb-3">{person.position}</p>

                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {person.bio}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>


    </Layout>
  );
};

export default About;