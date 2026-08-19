import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { ArrowLeft } from "lucide-react";

export default function AddGallery() {
  const navigate = useNavigate();
  const [type, setType] = useState<"event" | "achievement">("event");

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [driveUrl, setDriveUrl] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async () => {
    if (!file || !eventName || !eventDate || !eventLocation) {
      setError("Please fill all required fields");
      return;
    }

    if (type === "achievement" && !driveUrl.trim()) {
      setError("Drive link is required for Student Achievement");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const selectedType: "event" | "achievement" = type;

      console.log("Saving as type:", selectedType);

      const filePath = `gallery/${Date.now()}-${file.name}`;

      // Upload image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Insert into database
      const { error: dbError } = await supabase
        .from("gallery")
        .insert([
          {
            image_url: data.publicUrl,
            event_name: eventName.trim(),
            event_date: eventDate,
            event_location: eventLocation.trim(),
            drive_url: driveUrl.trim() || null,
            type: selectedType, // 🔥 ONLY dropdown decides section
          },
        ]);

      if (dbError) throw dbError;

      alert("Gallery item added successfully");

      // Reset form
      setEventName("");
      setEventDate("");
      setEventLocation("");
      setDriveUrl("");
      setFile(null);
      setType("event");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs md:text-sm font-semibold text-slate-700 hover:text-primary hover:bg-slate-200 transition-all shadow-2xs group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-semibold">Add Gallery Item</h2>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* TYPE SELECT */}
        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value as "event" | "achievement")
          }
          className="w-full border px-3 py-2 rounded mb-4"
        >
          <option value="event">📸 Event</option>
          <option value="achievement">🏆 Student Achievement</option>
        </select>

        {/* NAME */}
        <input
          placeholder={
            type === "event"
              ? "Event Name"
              : "Student Name / Group Name"
          }
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* DATE */}
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* LOCATION */}
        <input
          placeholder="Location"
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* DRIVE LINK */}
        <input
          placeholder={
            type === "achievement"
              ? "Google Drive Folder Link (Required)"
              : "Google Drive Folder Link (Optional)"
          }
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* IMAGE */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mb-4"
        />

        {/* SUBMIT BUTTON */}
        <button
          onClick={uploadImage}
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:opacity-90 transition"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
