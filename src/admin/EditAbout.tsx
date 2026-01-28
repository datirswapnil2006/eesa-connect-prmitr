import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

type AboutRow = {
  id: string;
  section_title: string;
  content: string;
};

export default function EditAbout() {
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
        <h1 className="text-2xl font-bold mb-6">Edit About Page</h1>

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
