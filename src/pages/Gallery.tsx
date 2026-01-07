import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import {
  Image as ImageIcon,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
};

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      setItems(data || []);
      setLoading(false);
    };

    fetchGallery();
  }, []);

  const closeSlider = () => setActiveIndex(null);

  const prevImage = () => {
    if (activeIndex === null) return;
    setActiveIndex(activeIndex === 0 ? items.length - 1 : activeIndex - 1);
  };

  const nextImage = () => {
    if (activeIndex === null) return;
    setActiveIndex(activeIndex === items.length - 1 ? 0 : activeIndex + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">

      {/* NAVBAR */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-sky-600 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* HEADER */}
      <section className="relative overflow-hidden bg-white border-b">
        {/* Soft glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_60%)]" />

        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sky-100 text-sky-600 text-sm font-semibold mb-6">
            <ImageIcon className="w-4 h-4" />
            Memories & Moments
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
            Gallery
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A curated glimpse into workshops, events, activities, and memorable
            moments from the Electronics Engineering Students Association.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        {loading && (
          <p className="text-center text-slate-500 text-lg">
            Loading gallery…
          </p>
        )}

        {!loading && items.length === 0 && (
          <div className="bg-white border rounded-2xl p-14 text-center text-slate-500 shadow-sm">
            No gallery images available yet.
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className="group relative cursor-pointer rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300"
            >
              {/* Image */}
              <img
                src={item.image_url}
                alt={item.title}
                className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform">
                <p className="text-white font-semibold text-base tracking-wide">
                  {item.title}
                </p>
              </div>

              {/* Hover ring */}
              <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-sky-400/50 transition-all rounded-3xl" />
            </div>
          ))}
        </div>
      </section>

      {/* MODAL VIEWER */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">

          {/* Close */}
          <button
            onClick={closeSlider}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Prev */}
          <button
            onClick={prevImage}
            className="absolute left-6 text-white/70 hover:text-white transition"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          {/* Image */}
          <div className="max-w-6xl w-full px-6 text-center">
            <img
              src={items[activeIndex].image_url}
              alt={items[activeIndex].title}
              className="max-h-[80vh] mx-auto rounded-3xl object-contain shadow-2xl"
            />
            <p className="text-white/80 text-sm mt-6 tracking-wide">
              {items[activeIndex].title}
            </p>
          </div>

          {/* Next */}
          <button
            onClick={nextImage}
            className="absolute right-6 text-white/70 hover:text-white transition"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        </div>
      )}
    </div>
  );
}
