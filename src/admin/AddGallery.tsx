import { useState } from "react";
import { supabase } from "../supabase/client";

export default function AddGallery() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async () => {
    if (!file) {
      setError("Please select an image");
      return;
    }
    debugger;

    setLoading(true);
    setError("");

    //  Upload image to storage
    const filePath = `images/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(filePath, file);

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    // 2Get public URL
    const { data } = supabase.storage
      .from("gallery")
      .getPublicUrl(filePath);

    // Save URL in database
    const { error: dbError } = await supabase.from("gallery").insert({
      title,
      image_url: data.publicUrl,
    });

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
    } else {
      alert("Image uploaded successfully");
      setTitle("");
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Add Gallery Image</h2>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Image title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mb-4"
        />

        <button
          onClick={uploadImage}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>
    </div>
  );
}
