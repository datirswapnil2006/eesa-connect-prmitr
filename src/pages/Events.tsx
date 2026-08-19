import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/supabase/client";
import {
  CalendarDays,
  MapPin,
  Download,
  Clock,
  ArrowLeft,
} from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PAST_PAGE_SIZE = 12;

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
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [past, setPast] = useState<Event[]>([]);
  const [pastCount, setPastCount] = useState<number | null>(null);
  const [pastPage, setPastPage] = useState(0);
  const [pastHasMore, setPastHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMorePast, setLoadingMorePast] = useState(false);

  // Fetch upcoming events (small dataset, load all)
  const fetchUpcoming = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("event_date", todayString)
      .order("event_date", { ascending: true });

    return (data || []) as Event[];
  };

  // Fetch a page of past events
  const fetchPastPage = async (page: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];

    const from = page * PAST_PAGE_SIZE;
    const to = from + PAST_PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from("events")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .lt("event_date", todayString)
      .order("event_date", { ascending: false })
      .range(from, to);

    return { data: (data || []) as Event[], count };
  };

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [upcomingData, pastResult] = await Promise.all([
        fetchUpcoming(),
        fetchPastPage(0),
      ]);

      setUpcoming(upcomingData);
      setPast(pastResult.data);
      setPastCount(pastResult.count);
      setPastHasMore(pastResult.data.length >= PAST_PAGE_SIZE);
      setPastPage(1);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Load more past events
  const loadMorePast = useCallback(async () => {
    if (loadingMorePast || !pastHasMore) return;
    setLoadingMorePast(true);
    const result = await fetchPastPage(pastPage);
    setPast((prev) => [...prev, ...result.data]);
    setPastHasMore(result.data.length >= PAST_PAGE_SIZE);
    setPastPage((p) => p + 1);
    setLoadingMorePast(false);
  }, [pastPage, pastHasMore, loadingMorePast]);

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
    <div className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs md:text-sm font-semibold text-slate-700 hover:text-primary hover:bg-slate-50 transition-all shadow-2xs group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2.5 text-slate-900">
              <CalendarDays className="w-7 h-7 text-primary" />
              Events
            </h1>
          </div>

          {upcoming.length > 0 && (
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition w-fit"
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
                    <OptimizedImage
                      src={event.image_url}
                      alt={event.title}
                      variant="event"
                      containerClassName="w-full h-56 rounded-lg mb-4"
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
        {!loading && past.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Past Events</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >
                  <OptimizedImage
                    src={event.image_url}
                    alt={event.title}
                    variant="thumbnail"
                    containerClassName="w-full aspect-[16/9]"
                  />

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

            <LoadMoreButton
              onClick={loadMorePast}
              loading={loadingMorePast}
              hasMore={pastHasMore}
              loadedCount={past.length}
              totalCount={pastCount}
              label="Load More Past Events"
            />
          </section>
        )}

      </div>
    </div>
  );
}
