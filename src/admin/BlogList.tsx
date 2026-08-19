import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase/client";
import { ArrowLeft } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setBlogs(data || []));
  }, []);

  const togglePublish = async (blog: any) => {
    await supabase
      .from("blogs")
      .update({ is_published: !blog.is_published })
      .eq("id", blog.id);

    setBlogs((prev) =>
      prev.map((b) =>
        b.id === blog.id ? { ...b, is_published: !b.is_published } : b
      )
    );
  };

  return (
    <div className="eesa-container py-10">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-700 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-2xl font-bold">Manage Blogs</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            {blog.image_url && (
              <OptimizedImage
                src={blog.image_url}
                alt={blog.title}
                variant="thumbnail"
                containerClassName="h-40 w-full"
              />
            )}

            <div className="p-4 space-y-2">
              <h3 className="font-semibold">{blog.title}</h3>
              <p className="text-sm text-gray-500">{blog.category}</p>

              <div className="flex justify-between items-center pt-2">
                <span
                  className={`text-sm ${
                    blog.is_published
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {blog.is_published ? "Published" : "Hidden"}
                </span>

                <button
                  onClick={() => togglePublish(blog)}
                  className="btn-outline text-sm"
                >
                  {blog.is_published ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
