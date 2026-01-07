import { useState } from "react";
import { supabase } from "../supabase/client";

export default function AddForum() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("IT");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);

    const { error } = await supabase.from("forums").insert({
      title,
      content,
      category,
    });

    setLoading(false);

    if (error) {
      alert("Failed to add announcement");
      console.error(error);
    } else {
      alert("Announcement posted");
      setTitle("");
      setContent("");
      setCategory("IT");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">
          Add Forum Announcement
        </h2>

        {/* Category */}
        <label className="block text-sm font-medium mb-1">
          Forum Category
        </label>
        <select
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="IT">IT Forum</option>
          <option value="Core Electronics">Core Electronics Forum</option>
          <option value="Career Development">Career Development Forum</option>
        </select>

        {/* Title */}
        <input
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="Announcement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Content */}
        <textarea
          className="w-full border rounded-lg px-3 py-2 mb-6"
          placeholder="Announcement Content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Button */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg"
        >
          {loading ? "Posting..." : "Post Announcement"}
        </button>
      </div>
    </div>
  );
}
