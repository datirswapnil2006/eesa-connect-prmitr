import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";

export default function EditHome() {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("home_hero")
      .select("*")
      .single()
      .then(({ data }) => setForm(data));
  }, []);

  const save = async () => {
    setLoading(true);
    await supabase.from("home_hero").update(form).eq("id", form.id);
    setLoading(false);
    alert("Home page updated successfully");
  };

  if (!form) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="eesa-container py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Edit Home Page
          </h1>
          <p className="text-slate-600 mt-2">
            Manage hero section content displayed on the home page.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border shadow-sm p-8 space-y-6">
          {/* Hero Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Hero Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter main heading"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Subtitle / Description
            </label>
            <textarea
              value={form.subtitle}
              onChange={(e) =>
                setForm({ ...form, subtitle: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Short description below the title"
            />
          </div>

          {/* Primary Button */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Primary Button Text
              </label>
              <input
                type="text"
                value={form.primary_button_text}
                onChange={(e) =>
                  setForm({
                    ...form,
                    primary_button_text: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Discover EESA"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Primary Button Link
              </label>
              <input
                type="text"
                value={form.primary_button_link}
                onChange={(e) =>
                  setForm({
                    ...form,
                    primary_button_link: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="/about"
              />
            </div>
          </div>

          {/* Secondary Button */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Secondary Button Text
              </label>
              <input
                type="text"
                value={form.secondary_button_text}
                onChange={(e) =>
                  setForm({
                    ...form,
                    secondary_button_text: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. View Events"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Secondary Button Link
              </label>
              <input
                type="text"
                value={form.secondary_button_link}
                onChange={(e) =>
                  setForm({
                    ...form,
                    secondary_button_link: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="/events"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={save}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
