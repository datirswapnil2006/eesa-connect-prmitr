import { useState } from "react";
import { supabase } from "../supabase/client";

export default function AddGallery() {
  const [type, setType] = useState<"event" | "achievement">("event");

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [driveUrl, setDriveUrl] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async () => {
    // Basic Validation
    if (!file || !eventName || !eventDate || !eventLocation) {
      setError("Please fill all required fields");
      return;
    }

    // Drive mandatory only for achievement
    if (type === "achievement" && !driveUrl.trim()) {
      setError("Drive link is required for Student Achievement");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const filePath = `gallery/${Date.now()}-${file.name}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      // Insert into database
      const { error: dbError } = await supabase.from("gallery").insert({
        image_url: data.publicUrl,
        event_name: eventName,
        event_date: eventDate,
        event_location: eventLocation,
        drive_url: driveUrl.trim() || null,
        type,
      });

      if (dbError) throw dbError;

      alert("Gallery item added successfully ✅");

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
        <h2 className="text-2xl font-semibold mb-6">Add Gallery Item</h2>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* TYPE SELECT */}
        <select
          value={type}
          onChange={(e) => {
            const selectedType = e.target.value as "event" | "achievement";
            setType(selectedType);

            // Optional: clear drive link if switching to event
            if (selectedType === "event") {
              setDriveUrl("");
            }
          }}
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
