import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { Pencil } from "lucide-react";

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  registration_link: string | null;
  event_image: string | null;
};

export default function AddEvent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Workshop");
  const [registrationLink, setRegistrationLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  /* FETCH EVENTS */
  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    setEvents(data || []);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* RESET FORM */
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setType("Workshop");
    setRegistrationLink("");
    setImageFile(null);
    setExistingImage(null);
  };

  /* SAVE EVENT */
  const saveEvent = async () => {
    if (!title || !eventDate) {
      alert("Title and Date are required");
      return;
    }

    setLoading(true);

    let imageUrl = existingImage;

    //  Upload image if selected
    if (imageFile) {
      const filePath = `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("event-files") 
        .upload(filePath, imageFile);

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("event-files") 
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const payload = {
      title,
      description,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      location,
      type,
      registration_link: registrationLink || null,
      event_image: imageUrl || null,
      is_published: true,
    };

    const { error } = editingId
      ? await supabase.from("events").update(payload).eq("id", editingId)
      : await supabase.from("events").insert(payload);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(editingId ? "Event updated successfully" : "Event created successfully");
    resetForm();
    fetchEvents();
  };

  /* EDIT EVENT */
  const editEvent = (event: Event) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDescription(event.description || "");
    setEventDate(event.event_date);
    setStartTime(event.start_time || "");
    setEndTime(event.end_time || "");
    setLocation(event.location || "");
    setType(event.type || "Workshop");
    setRegistrationLink(event.registration_link || "");
    setExistingImage(event.event_image || null);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10">

      {/* FORM */}
      <div className="bg-white p-8 rounded-xl border">
        <h1 className="text-2xl font-bold mb-6">
          {editingId ? "Edit Event" : "Add Event"}
        </h1>

        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="date" className="input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          <input className="input" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input className="input" placeholder="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input className="input" placeholder="Event Type" value={type} onChange={(e) => setType(e.target.value)} />
        </div>

        <textarea
          className="input mt-4"
          rows={4}
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="input mt-4"
          placeholder="Google Form Registration Link (optional)"
          value={registrationLink}
          onChange={(e) => setRegistrationLink(e.target.value)}
        />

        {/* IMAGE UPLOAD */}
        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium">
            Event Banner Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
          />

          {existingImage && (
            <img
              src={existingImage}
              alt="Event"
              className="mt-3 h-32 rounded-lg object-cover"
            />
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={saveEvent}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg"
          >
            {loading ? "Saving..." : editingId ? "Update Event" : "Create Event"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* EVENT LIST */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Events</h2>

        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white p-5 border rounded-xl flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm text-slate-500">
                  {new Date(event.event_date).toDateString()} • {event.start_time} - {event.end_time}
                </p>
                <p className="text-sm text-slate-600">{event.location}</p>

                {event.event_image && (
                  <img
                    src={event.event_image}
                    className="mt-2 h-20 rounded object-cover"
                  />
                )}
              </div>

              <button
                onClick={() => editEvent(event)}
                className="flex items-center gap-1 text-primary text-sm"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
