import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import {
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
} from "lucide-react";
import { getGalleryThumbnail } from "@/lib/imageUtils";
import LoadMoreButton from "@/components/common/LoadMoreButton";

const PAGE_SIZE = 12;

type GalleryItem = {
  id: string;
  image_url: string;
  event_name: string;
  event_date: string | null;
  event_location: string | null;
  drive_url: string | null;
  type: "event" | "achievement";
};

export default function Gallery() {
  // Event photos state
  const [eventPhotos, setEventPhotos] = useState<GalleryItem[]>([]);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [eventPage, setEventPage] = useState(0);
  const [eventHasMore, setEventHasMore] = useState(true);

  // Achievements state
  const [achievements, setAchievements] = useState<GalleryItem[]>([]);
  const [achieveCount, setAchieveCount] = useState<number | null>(null);
  const [achievePage, setAchievePage] = useState(0);
  const [achieveHasMore, setAchieveHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);
  const [loadingMoreAchieve, setLoadingMoreAchieve] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeAchievement, setActiveAchievement] =
    useState<GalleryItem | null>(null);

  const navigate = useNavigate();

  // Fetch a page of gallery items
  const fetchGalleryPage = async (
    type: "event" | "achievement",
    page: number
  ) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from("gallery")
      .select("*", { count: "exact" })
      .eq("type", type)
      .order("created_at", { ascending: false })
      .range(from, to);

    return { data: (data || []) as GalleryItem[], count };
  };

  // Initial load
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);

      const [eventsResult, achieveResult] = await Promise.all([
        fetchGalleryPage("event", 0),
        fetchGalleryPage("achievement", 0),
      ]);

      setEventPhotos(eventsResult.data);
      setEventCount(eventsResult.count);
      setEventHasMore(eventsResult.data.length >= PAGE_SIZE);
      setEventPage(1);

      setAchievements(achieveResult.data);
      setAchieveCount(achieveResult.count);
      setAchieveHasMore(achieveResult.data.length >= PAGE_SIZE);
      setAchievePage(1);

      setLoading(false);
    };

    fetchInitial();
  }, []);

  // Load more event photos
  const loadMoreEvents = useCallback(async () => {
    if (loadingMoreEvents || !eventHasMore) return;
    setLoadingMoreEvents(true);
    const result = await fetchGalleryPage("event", eventPage);
    setEventPhotos((prev) => [...prev, ...result.data]);
    setEventHasMore(result.data.length >= PAGE_SIZE);
    setEventPage((p) => p + 1);
    setLoadingMoreEvents(false);
  }, [eventPage, eventHasMore, loadingMoreEvents]);

  // Load more achievements
  const loadMoreAchievements = useCallback(async () => {
    if (loadingMoreAchieve || !achieveHasMore) return;
    setLoadingMoreAchieve(true);
    const result = await fetchGalleryPage("achievement", achievePage);
    setAchievements((prev) => [...prev, ...result.data]);
    setAchieveHasMore(result.data.length >= PAGE_SIZE);
    setAchievePage((p) => p + 1);
    setLoadingMoreAchieve(false);
  }, [achievePage, achieveHasMore, loadingMoreAchieve]);

  const closeEventSlider = () => setActiveIndex(null);
  const closeAchievement = () => setActiveAchievement(null);

  const prevImage = () =>
    setActiveIndex((prev) =>
      prev === null
        ? null
        : prev === 0
        ? eventPhotos.length - 1
        : prev - 1
    );

  const nextImage = () =>
    setActiveIndex((prev) =>
      prev === null
        ? null
        : prev === eventPhotos.length - 1
        ? 0
        : prev + 1
    );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-primary font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-16 space-y-20">

        {loading && (
          <p className="text-center text-slate-500">
            Loading gallery…
          </p>
        )}

        {/* EVENT PHOTOS */}
        {!loading && eventPhotos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">
              📸 Event Photos
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {eventPhotos.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className="cursor-pointer rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-xl transition"
                >
                  <img
                    src={getGalleryThumbnail(item.image_url)}
                    alt={item.event_name}
                    loading="lazy"
                    decoding="async"
                    className="h-72 w-full object-cover"
                  />
                </div>
              ))}
            </div>

            <LoadMoreButton
              onClick={loadMoreEvents}
              loading={loadingMoreEvents}
              hasMore={eventHasMore}
              loadedCount={eventPhotos.length}
              totalCount={eventCount}
              label="Load More Photos"
            />
          </div>
        )}

        {/* STUDENT ACHIEVEMENTS */}
        {!loading && achievements.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">
              🏆 Student Achievements
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {achievements.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveAchievement(item);
                  }}
                  className="cursor-pointer rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-xl transition"
                >
                  <img
                    src={getGalleryThumbnail(item.image_url)}
                    alt={item.event_name}
                    loading="lazy"
                    decoding="async"
                    className="h-72 w-full object-cover"
                  />
                </div>
              ))}
            </div>

            <LoadMoreButton
              onClick={loadMoreAchievements}
              loading={loadingMoreAchieve}
              hasMore={achieveHasMore}
              loadedCount={achievements.length}
              totalCount={achieveCount}
              label="Load More Achievements"
            />
          </div>
        )}

      </section>

      {/* EVENT MODAL — uses full resolution */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeEventSlider}
            className="absolute top-6 right-6 text-white/80 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-6 text-white/70 hover:text-white"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div className="relative max-w-6xl w-full px-6">
            <img
              src={eventPhotos[activeIndex].image_url}
              className="max-h-[80vh] w-full object-contain rounded-xl mx-auto"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {eventPhotos[activeIndex].event_name}
                </h3>

                {eventPhotos[activeIndex].event_date && (
                  <div className="flex items-center gap-2 text-white/90 mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(
                      eventPhotos[activeIndex].event_date!
                    ).toDateString()}
                  </div>
                )}

                {eventPhotos[activeIndex].event_location && (
                  <div className="flex items-center gap-2 text-white/90 mb-5">
                    <MapPin className="w-4 h-4" />
                    {eventPhotos[activeIndex].event_location}
                  </div>
                )}

                {eventPhotos[activeIndex].drive_url && (
                  <button
                    onClick={() =>
                      window.open(
                        eventPhotos[activeIndex].drive_url!,
                        "_blank"
                      )
                    }
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
                  >
                    View More Photos
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={nextImage}
            className="absolute right-6 text-white/70 hover:text-white"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}

      {/* ACHIEVEMENT MODAL — uses full resolution */}
      {activeAchievement && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeAchievement}
            className="absolute top-6 right-6 text-white/80 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-6xl w-full px-6">
            <img
              src={activeAchievement.image_url}
              className="max-h-[80vh] w-full object-contain rounded-xl mx-auto"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {activeAchievement.event_name}
                </h3>

                {activeAchievement.event_date && (
                  <div className="flex items-center gap-2 text-white/90 mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(
                      activeAchievement.event_date
                    ).toDateString()}
                  </div>
                )}

                {activeAchievement.event_location && (
                  <div className="flex items-center gap-2 text-white/90 mb-5">
                    <MapPin className="w-4 h-4" />
                    {activeAchievement.event_location}
                  </div>
                )}

                {activeAchievement.drive_url && (
                  <button
                    onClick={() =>
                      window.open(
                        activeAchievement.drive_url!,
                        "_blank"
                      )
                    }
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
                  >
                    View More Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
