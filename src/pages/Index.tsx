import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import LatestBlogsSection from "@/components/home/LatestBlogsSection";
import UpcomingEventsSection from "@/components/home/UpcomingEventsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <LatestBlogsSection />
      <UpcomingEventsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
