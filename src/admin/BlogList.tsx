import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";

export default function BlogList() {
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
      <h1 className="text-2xl font-bold mb-6">Manage Blogs</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            {blog.image_url && (
              <img
                src={blog.image_url}
                className="h-40 w-full object-cover"
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
