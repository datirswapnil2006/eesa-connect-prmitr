import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  is_published: boolean;
  registration_link: string | null;
};

export default function AddEvent() {
  /* FORM STATE */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");

  /* LIST STATE */
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

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

  const createEvent = async () => {
    if (!title || !eventDate) {
      alert("Title and date required");
      return;
    }

    setLoading(true);

    await supabase.from("events").insert([
      {
        title,
        description,
        event_date: eventDate,
        location,
        registration_link: registrationLink,
        is_published: true,
      },
    ]);

    setLoading(false);

    setTitle("");
    setDescription("");
    setEventDate("");
    setLocation("");
    setRegistrationLink("");

    fetchEvents();
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      {/* CREATE */}
      <div className="bg-white p-8 rounded-xl border">
        <h1 className="text-2xl font-bold mb-6">Create Event</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="date" className="input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input className="input" placeholder="Google Form Registration Link" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} />
        </div>

        <textarea className="input mt-4" rows={4} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <button onClick={createEvent} disabled={loading} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>

      {/* LIST */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Events</h2>
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="bg-white p-4 border rounded-lg">
              <h3 className="font-semibold">{e.title}</h3>
              <p className="text-sm text-slate-500">{new Date(e.event_date).toDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
