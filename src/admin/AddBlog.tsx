import { useState } from "react";
import { supabase } from "@/supabase/client";
import { uploadBlogImage } from "@/lib/uploadImage";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function AddBlog() {
  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  // Image states
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Handle image select
  const handleImage = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Publish blog
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl: string | null = null;

      // Upload image to Supabase storage
      if (image) {
        const fileName = `${Date.now()}-${image.name}`;

        const { error: uploadError } = await supabase.storage
          .from("blog-images") // BUCKET NAME
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      //  Insert blog into database
      const { error } = await supabase.from("blogs").insert({
        title,
        author,
        category,
        content,
        image_url: imageUrl,
        is_published: true,
      });

      if (error) throw error;

      alert(" Blog published successfully!");

      // Reset form
      setTitle("");
      setAuthor("");
      setCategory("");
      setContent("");
      setImage(null);
      setPreview(null);

    } catch (error) {
      console.error(error);
      alert("Failed to publish blog");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4">

        {/* Page Title & Back */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-700 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Create Blog
          </h1>
        </div>

        {/* FORM START */}
        <form
          onSubmit={handlePublish}
          className="bg-white rounded-2xl shadow-sm border p-8 space-y-8"
        >

          {/* Blog Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Blog Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="mt-1 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Author
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="mt-1 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Events / IoT / Career"
                className="mt-1 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Blog Content */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Blog Content
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content..."
              className="mt-1 w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Blog Thumbnail Image
            </label>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-100">
                <Upload className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleImage(e.target.files[0])
                  }
                />
              </label>

              {preview ? (
                <OptimizedImage
                  src={preview}
                  alt="Preview"
                  variant="thumbnail"
                  containerClassName="h-20 w-32 rounded-lg border"
                />
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <ImageIcon className="w-5 h-5" />
                  No image selected
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              className="px-6 py-2 rounded-lg border text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              Publish Blog
            </button>
          </div>

        </form>
        {/* FORM END */}

      </div>
    </div>
  );
}
