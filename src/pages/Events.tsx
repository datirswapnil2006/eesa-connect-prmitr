import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { CalendarDays, ArrowLeft, Clock } from "lucide-react";

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      setEvents(data || []);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <div className="bg-white/90 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-primary transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <CalendarDays className="w-4 h-4" />
            Events & Activities
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 animate-slide-up">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Upcoming Events
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover workshops, seminars, and technical activities organized by
            the Electronics Engineering Students Association.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        {loading && (
          <p className="text-center text-slate-500 text-lg">
            Loading events...
          </p>
        )}

        {!loading && events.length === 0 && (
          <div className="bg-white border rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            No upcoming events at the moment.
          </div>
        )}

        {/* Timeline Style */}
        <div className="space-y-8">
          {events.map((event) => {
            const date = new Date(event.event_date);
            const day = date.getDate();
            const month = date.toLocaleString("en-US", { month: "short" });
            const year = date.getFullYear();

            return (
              <div
                key={event.id}
                className="group relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Accent line */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-eesa-teal rounded-l-3xl" />

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Date */}
                  <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-eesa-teal text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-3xl font-bold">{day}</span>
                    <span className="text-sm uppercase tracking-wide">
                      {month}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                      {event.title}
                    </h2>

                    <p className="text-slate-600 leading-relaxed mb-4">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      {month} {day}, {year}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
