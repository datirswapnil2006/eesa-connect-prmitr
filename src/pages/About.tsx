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
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "Working together across disciplines to achieve greater outcomes.",
  },
  {
    icon: BookOpen,
    title: "Learning",
    description:
      "Continuous growth through knowledge sharing and skill development.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Striving for the highest standards in everything we do.",
  },
];

const About = () => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

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
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const whoWeAre = data?.find((i) => i.section_title === "Who We Are");
  const mission = data?.find((i) => i.section_title === "Our Mission");
  const vision = data?.find((i) => i.section_title === "Our Vision");

  return (
    <Layout>
      {/* HERO */}
      <section className="relative py-32 bg-gradient-to-br from-background via-secondary/40 to-background">
        <div className="eesa-container max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            About Us
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8">
            About <span className="text-primary">EESA</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto text-justify whitespace-pre-line">
            {whoWeAre?.content}
          </p>

          <ChevronDown className="w-8 h-8 mx-auto text-primary/50 mt-12 animate-bounce" />
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="eesa-section bg-card">
        <div className="eesa-container grid lg:grid-cols-2 gap-8">
          {[
            { icon: Target, title: "Mission", content: mission?.content },
            { icon: Eye, title: "Vision", content: vision?.content },
          ].map((item, i) => (
            <div key={i} className="eesa-card p-10 hover:shadow-xl transition">
              <item.icon className="w-12 h-12 text-primary mb-6" />
              <h2 className="text-3xl font-bold mb-4">{item.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-justify whitespace-pre-line">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="eesa-section bg-background">
        <div className="eesa-container grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, i) => (
            <div key={i} className="p-8 rounded-3xl bg-card text-center hover:shadow-lg transition">
              <value.icon className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="eesa-section bg-card">
        <div className="eesa-container">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Faculty & Members
          </h2>

          {/* FACULTY */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
            {team
              ?.filter((p) => p.role === "faculty")
              .map((person) => (
                <div
                  key={person.id}
                  onClick={() =>
                    setSelectedMember(
                      selectedMember === person.id ? null : person.id
                    )
                  }
                  className="group p-10 rounded-3xl bg-background text-center cursor-pointer hover:shadow-xl transition"
                >
                  {/* PROFESSIONAL IMAGE */}
                  <div className="mx-auto mb-6 w-36 h-36 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition">
                    <img
                      src={person.image_url}
                      alt={person.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <h4 className="text-xl font-bold">{person.name}</h4>
                  <p className="text-primary text-sm mb-3">
                    {person.position}
                  </p>

                  {selectedMember === person.id && (
                    <p className="text-muted-foreground text-sm leading-relaxed text-justify whitespace-pre-line mt-3">
                      {person.bio}
                    </p>
                  )}
                </div>
              ))}
          </div>

          {/* MEMBERS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team
              ?.filter((p) => p.role === "member")
              .map((person) => (
                <div
                  key={person.id}
                  className="group p-8 rounded-3xl bg-background text-center hover:shadow-lg transition"
                >
                  <div className="mx-auto mb-4 w-28 h-28 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition">
                    <img
                      src={person.image_url}
                      alt={person.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <h4 className="font-semibold">{person.name}</h4>
                  <p className="text-primary text-sm mb-2">
                    {person.position}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed text-justify whitespace-pre-line">
                    {person.bio}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
