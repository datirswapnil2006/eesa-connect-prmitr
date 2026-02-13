import { useState } from "react";
import { supabase } from "../supabase/client";

export default function AddForum() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("IT");
  const [isOpening, setIsOpening] = useState(false);
  const [applyLink, setApplyLink] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill all required fields");
      return;
    }

    if (isOpening && !applyLink.trim()) {
      alert("Please enter Google Form link");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("forums").insert([
        {
          title: title.trim(),
          content: content.trim(),
          category,
          apply_link: isOpening ? applyLink.trim() : null,
        },
      ]);

      if (error) throw error;

      alert("Announcement posted successfully ");

      setTitle("");
      setContent("");
      setCategory("IT");
      setIsOpening(false);
      setApplyLink("");
    } catch (err) {
      console.error(err);
      alert("Failed to post announcement");
    } finally {
      setLoading(false);
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
          <option value="Career Development">
            Career Development Forum
          </option>
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
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="Announcement Content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Opening Checkbox */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={isOpening}
            onChange={() => setIsOpening(!isOpening)}
            className="w-4 h-4"
          />
          <label className="text-sm font-medium">
            This is an Opening (Enable Applications)
          </label>
        </div>

        {/* Google Form Link (Only if Opening) */}
        {isOpening && (
          <input
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="Paste Google Form Apply Link"
            value={applyLink}
            onChange={(e) => setApplyLink(e.target.value)}
          />
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition"
        >
          {loading ? "Posting..." : "Post Announcement"}
        </button>
      </div>
    </div>
  );
}
