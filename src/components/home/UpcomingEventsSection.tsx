import { ArrowRight, Calendar, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUpcomingEvents } from "@/lib/api";

const typeColors: Record<string, string> = {
  Symposium: "bg-eesa-teal text-white",
  Workshop: "bg-primary text-white",
  Lecture: "bg-eesa-gold text-slate-900",
};

const UpcomingEventsSection = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: getUpcomingEvents,
  });

  if (isLoading) return null;

  // Filter out past events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.event_date);
      return eventDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.event_date).getTime() -
        new Date(b.event_date).getTime()
    );

  return (
    <section className="eesa-section bg-slate-50 border-t border-slate-200">
      <div className="eesa-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Mark Your Calendar
            </span>
            <h2 className="eesa-section-title">Upcoming Events</h2>
            <p className="eesa-section-subtitle">
              Don’t miss exciting opportunities to learn, network, and grow.
            </p>
          </div>

          <Button asChild variant="outline" className="mt-6 md:mt-0 gap-2">
            <Link to="/events">
              View All Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Events */}
        <div className="space-y-6">
          {upcomingEvents.length === 0 && (
            <p className="text-slate-500 text-center">
              No upcoming events at the moment.
            </p>
          )}

          {upcomingEvents.map((event) => {
            const date = new Date(event.event_date);

            return (
              <div
                key={event.id}
                className="eesa-card p-6 border-l-4 border-primary hover:shadow-lg transition flex flex-col lg:flex-row gap-6"
              >
                {/* Date Box */}
                <div className="w-20 h-20 rounded-xl bg-primary text-white flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">
                    {date.getDate()}
                  </span>
                  <span className="text-xs uppercase">
                    {date.toLocaleString("en-US", { month: "short" })}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <span
                    className={`inline-block mb-2 px-3 py-1 rounded-full text-xs font-medium ${
                      typeColors[event.type] || "bg-slate-200"
                    }`}
                  >
                    {event.type}
                  </span>

                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {event.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {date.toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {event.start_time} - {event.end_time}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {event.location}
                    </div>
                  </div>

                  {/* Register Button */}
                  {event.registration_link && (
                    <Button asChild size="sm">
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Register
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
