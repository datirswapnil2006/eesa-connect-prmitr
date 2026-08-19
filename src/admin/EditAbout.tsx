import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft } from "lucide-react";

type AboutRow = {
  id: string;
  section_title: string;
  content: string;
};

export default function EditAbout() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<AboutRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    const { data, error } = await supabase
      .from("about_page")
      .select("*")
      .order("section_title");

    if (!error) setSections(data || []);
  };

  const saveSection = async (id: string, content: string) => {
    setLoading(true);

    const { error } = await supabase
      .from("about_page")
      .update({ content })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert("Failed to save changes");
    } else {
      alert("Saved successfully");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="eesa-container py-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-700 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-100 bg-white border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold">Edit About Page</h1>
        </div>

        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white border rounded-xl p-6 mb-8 space-y-4"
          >
            <h2 className="font-semibold text-lg">
              {section.section_title}
            </h2>

            {/* TEXT EDITOR */}
            <textarea
              value={section.content}
              onChange={(e) =>
                setSections((prev) =>
                  prev.map((s) =>
                    s.id === section.id
                      ? { ...s, content: e.target.value }
                      : s
                  )
                )
              }
              rows={6}
              className="w-full border rounded-lg p-3 text-sm"
            />

            {/* LIVE PREVIEW (JUSTIFIED) */}
            <div className="border rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-700 text-justify leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>

            <Button
              onClick={() => saveSection(section.id, section.content)}
              className="gap-2"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
