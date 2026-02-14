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
  const [activeAchievement, setActiveAchievement] =
    useState<GalleryItem | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);

      const { data: events } = await supabase
        .from("gallery")
        .select("*")
        .eq("type", "event")
        .order("created_at", { ascending: false });

      const { data: achievementsData } = await supabase
        .from("gallery")
        .select("*")
        .eq("type", "achievement")
        .order("created_at", { ascending: false });

      setEventPhotos(events || []);
      setAchievements(achievementsData || []);
      setLoading(false);
    };

    fetchGallery();
  }, []);

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
                  onClick={() => setActiveAchievement(item)}
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

      {/* EVENT MODAL (UNCHANGED) */}
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
                  <a
                    href={eventPhotos[activeIndex].drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
                  >
                    View More Photos
                  </a>
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

      {/* ACHIEVEMENT MODAL */}
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
                  <a
                    href={activeAchievement.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
                  >
                    View More Details
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
