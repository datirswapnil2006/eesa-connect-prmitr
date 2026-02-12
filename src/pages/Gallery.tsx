import { useEffect, useState } from "react";
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
  const [eventPhotos, setEventPhotos] = useState<GalleryItem[]>([]);
  const [achievements, setAchievements] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);

      // Fetch only Events
      const { data: events, error: eventError } = await supabase
        .from("gallery")
        .select("*")
        .eq("type", "event")
        .order("created_at", { ascending: false });

      // Fetch only Achievements
      const { data: achievementsData, error: achievementError } =
        await supabase
          .from("gallery")
          .select("*")
          .eq("type", "achievement")
          .order("created_at", { ascending: false });

      if (eventError || achievementError) {
        console.error(eventError || achievementError);
        setLoading(false);
        return;
      }

      setEventPhotos(events || []);
      setAchievements(achievementsData || []);
      setLoading(false);
    };

    fetchGallery();
  }, []);

  const closeSlider = () => setActiveIndex(null);

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
                    src={item.image_url}
                    alt={item.event_name}
                    className="h-72 w-full object-cover"
                  />
                </div>
              ))}
            </div>
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
                  onClick={() =>
                    window.open(item.drive_url!, "_blank")
                  }
                  className="cursor-pointer rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-xl transition"
                >
                  <img
                    src={item.image_url}
                    alt={item.event_name}
                    className="h-72 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* EVENT MODAL */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeSlider}
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

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-lg font-semibold text-white">
                {eventPhotos[activeIndex].event_name}
              </h3>

              <div className="flex gap-6 mt-2 text-sm text-white/80 flex-wrap">
                {eventPhotos[activeIndex].event_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(
                      eventPhotos[activeIndex].event_date!
                    ).toDateString()}
                  </span>
                )}

                {eventPhotos[activeIndex].event_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {eventPhotos[activeIndex].event_location}
                  </span>
                )}
              </div>

              {/* Optional Drive Link for Events */}
              {eventPhotos[activeIndex].drive_url && (
                <a
                  href={eventPhotos[activeIndex].drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-white text-black px-4 py-2 rounded"
                >
                  View More Photos
                </a>
              )}
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
    </div>
  );
}
