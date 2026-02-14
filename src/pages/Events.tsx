import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import {
  CalendarDays,
  MapPin,
  Download,
  Clock,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  registration_link: string | null;
  image_url: string | null; 
};

export default function Events() {
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [past, setPast] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvents: Event[] = [];
      const pastEvents: Event[] = [];

      events?.forEach((event) => {
        const eventDate = new Date(event.event_date);
        eventDate.setHours(0, 0, 0, 0);

        eventDate >= today
          ? upcomingEvents.push(event)
          : pastEvents.push(event);
      });

      setUpcoming(upcomingEvents);
      setPast(pastEvents.reverse()); // show latest past first
      setLoading(false);
    };

    fetchData();
  }, []);

  /* DOWNLOAD UPCOMING EVENTS */
  const downloadExcel = () => {
    if (upcoming.length === 0) {
      alert("No upcoming events available");
      return;
    }

    const sheetData = upcoming.map((e) => ({
      Title: e.title,
      Date: new Date(e.event_date).toDateString(),
      Time: `${e.start_time} - ${e.end_time}`,
      Location: e.location,
      Registration: e.registration_link || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Upcoming Events");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "EESA_Upcoming_Events.xlsx"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary" />
            Events
          </h1>

          {upcoming.length > 0 && (
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
            >
              <Download className="w-4 h-4" />
              Download Upcoming
            </button>
          )}
        </div>

        {/* UPCOMING EVENTS */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>

          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : upcoming.length === 0 ? (
            <p className="text-slate-500">
              No upcoming events. Please check past events below.
            </p>
          ) : (
            <div className="space-y-6">
              {upcoming.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border rounded-xl p-6 shadow-sm"
                >
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-56 object-cover rounded-lg mb-4"
                    />
                  )}

                  <h3 className="text-xl font-semibold">
                    {event.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-2">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(event.event_date).toDateString()}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.start_time} - {event.end_time}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                  </div>

                  {event.registration_link && (
                    <a
                      href={event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-primary underline text-sm"
                    >
                      Register Now
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PAST EVENTS */}
        {past.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Past Events</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >
                  {event.image_url ? (
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/9] bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                      No Image Available
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {new Date(event.event_date).toDateString()}
                    </p>
                    <p className="text-sm text-slate-500">
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
