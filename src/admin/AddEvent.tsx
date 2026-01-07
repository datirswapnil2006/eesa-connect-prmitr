import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  is_published: boolean;
};

export default function AddEvent() {
  /*  FORM STATE */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  /*  LIST STATE  */
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  /*  FETCH EVENTS  */
  const fetchEvents = async () => {
    setListLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (!error) setEvents(data || []);
    setListLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /*  CREATE EVENT  */
  const createEvent = async () => {
    if (!title || !eventDate) {
      alert("Event title and date are required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("events").insert([
      {
        title,
        description,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        location,
        type,
        is_published: true,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Success UI
    setSuccessMsg("Event created successfully");
    setTimeout(() => setSuccessMsg(""), 8080);

    // Reset form
    setTitle("");
    setDescription("");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setType("");

    fetchEvents();
  };

  /*  TOGGLE PUBLISH  */
  const togglePublish = async (event: Event) => {
    await supabase
      .from("events")
      .update({ is_published: !event.is_published })
      .eq("id", event.id);

    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-12">

        {/* CREATE EVENT  */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Create Event
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">Event Title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="label">Event Date</label>
              <input
                type="date"
                className="input"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Start Time</label>
              <input
                className="input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00 AM"
              />
            </div>

            <div>
              <label className="label">End Time</label>
              <input
                className="input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="4:00 PM"
              />
            </div>

            <div>
              <label className="label">Location</label>
              <input
                className="input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Seminar Hall / Lab"
              />
            </div>

            <div>
              <label className="label">Event Type</label>
              <input
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Workshop / Seminar"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Description</label>
            <textarea
              rows={4}
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event..."
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={createEvent}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </div>

        {/*  MANAGE EVENTS */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Manage Events
          </h2>

          {/* SUCCESS MESSAGE */}
          {successMsg && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {successMsg}
            </div>
          )}

          {/* LIST STATE */}
          {listLoading ? (
            <p className="text-slate-400">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-slate-500">No events created yet.</p>
          ) : null}

          <div className="space-y-4">
            {events.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-xl border p-5 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {e.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {new Date(e.event_date).toDateString()} • {e.location}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs font-medium ${
                      e.is_published
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {e.is_published ? "Published" : "Hidden"}
                  </span>
                </div>

                <button
                  onClick={() => togglePublish(e)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-100"
                >
                  {e.is_published ? "Hide" : "Publish"}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
