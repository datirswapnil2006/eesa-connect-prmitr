import { useQuery } from "@tanstack/react-query";
import { getHomeFeatures } from "@/lib/api";

export default function FeaturesSection() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["home-features"],
    queryFn: getHomeFeatures,
  });

  if (isLoading) return null;

  return (
    <section className="eesa-section bg-slate-50">
      <div className="eesa-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((item) => (
            <div
              key={item.id}
              className="eesa-card p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
