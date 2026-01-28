import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { CalendarDays, ArrowLeft, Clock, X } from "lucide-react";

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  registration_link: string | null;
};

export default function Events() {
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [past, setPast] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: true });

      const now = new Date();
      const upcomingEvents: Event[] = [];
      const pastEvents: Event[] = [];

      data?.forEach((event) => {
        new Date(event.event_date) >= now
          ? upcomingEvents.push(event)
          : pastEvents.push(event);
      });

      setUpcoming(upcomingEvents);
      setPast(pastEvents);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* NAVBAR */}
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

      {/* HEADER */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <CalendarDays className="w-4 h-4" />
            Events & Activities
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Upcoming Events
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover workshops, seminars, and technical activities organized by EESA.
          </p>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        {loading && (
          <p className="text-center text-slate-500">Loading events...</p>
        )}

        {!loading && upcoming.length === 0 && (
          <div className="bg-white border rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            No upcoming events at the moment.
          </div>
        )}

        <div className="space-y-8">
          {upcoming.map((event) => {
            const date = new Date(event.event_date);
            const day = date.getDate();
            const month = date.toLocaleString("en-US", { month: "short" });
            const year = date.getFullYear();

            return (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="cursor-pointer group relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-eesa-teal rounded-l-3xl" />

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-eesa-teal text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-3xl font-bold">{day}</span>
                    <span className="text-sm uppercase">{month}</span>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                      {event.title}
                    </h2>

                    <p className="text-slate-600 mb-4">
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

        {/* PAST EVENTS */}
        {past.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Past Events
            </h2>

            <div className="space-y-4">
              {past.map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-100 border rounded-xl p-5"
                >
                  <h3 className="font-semibold text-slate-800">
                    {event.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {new Date(event.event_date).toDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* POPUP MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-2">
              {selectedEvent.title}
            </h2>

            <p className="text-slate-600 mb-4">
              {selectedEvent.description}
            </p>

            <p className="text-sm text-slate-500 mb-6">
              {new Date(selectedEvent.event_date).toDateString()} •{" "}
              {selectedEvent.location}
            </p>

            {selectedEvent.registration_link && (
              <a
                href={selectedEvent.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
              >
                Register Now
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
