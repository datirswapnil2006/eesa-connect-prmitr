import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

type Event = {
  id: string;
  title: string;
  event_date: string;
  location: string;
};

export default function AddGallery() {
  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* FETCH EVENTS */
  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,event_date,location")
      .order("event_date", { ascending: false })
      .then(({ data }) => setEvents(data || []));
  }, []);

  /* HANDLE EVENT CHANGE */
  const handleEventChange = (id: string) => {
    setEventId(id);
    const ev = events.find((e) => e.id === id) || null;
    setSelectedEvent(ev);
  };

  /* UPLOAD IMAGE */
  const uploadImage = async () => {
    if (!file || !eventId || !selectedEvent) {
      setError("Image and Event are required");
      return;
    }

    setLoading(true);
    setError("");

    const filePath = `gallery/${Date.now()}-${file.name}`;

    /* UPLOAD TO STORAGE */
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(filePath, file);

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("gallery")
      .getPublicUrl(filePath);

    /* SAVE TO DB */
    const { error: dbError } = await supabase.from("gallery").insert({
      title,
      image_url: data.publicUrl,
      event_id: eventId,
      event_date: selectedEvent.event_date,
      event_location: selectedEvent.location,
    });

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
    } else {
      alert("Image uploaded successfully");
      setTitle("");
      setEventId("");
      setSelectedEvent(null);
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Add Gallery Image</h2>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* IMAGE TITLE */}
        <input
          placeholder="Image Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* EVENT SELECT */}
        <select
          value={eventId}
          onChange={(e) => handleEventChange(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="">Select Event</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>

        {/* AUTO EVENT INFO */}
        {selectedEvent && (
          <div className="mb-4 text-sm text-slate-600 space-y-1">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedEvent.event_date).toDateString()}
            </p>
            <p>
              <strong>Location:</strong> {selectedEvent.location}
            </p>
          </div>
        )}

        {/* FILE */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mb-4"
        />

        <button
          onClick={uploadImage}
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>
    </div>
  );
}
