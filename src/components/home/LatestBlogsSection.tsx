import { ArrowRight, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getLatestBlogs } from "@/lib/api";

const LatestBlogsSection = () => {
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["latest-blogs"],
    queryFn: getLatestBlogs,
  });

  if (isLoading) return null;

  return (
    <section className="eesa-section bg-white border-t border-slate-200">
      <div className="eesa-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Latest Insights
            </span>
            <h2 className="eesa-section-title">From Our Blog</h2>
            <p className="eesa-section-subtitle">
              Stay updated with the latest trends, tutorials, and news in electronics engineering.
            </p>
          </div>

          <Button asChild variant="outline" className="mt-6 md:mt-0 gap-2">
            <Link to="/blog">
              View All Posts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Blog Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="eesa-card h-full flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={blog.image_url}
                alt={blog.title}
                className="h-48 w-full object-cover"
              />

              <div className="p-6 flex flex-col flex-1">
                <span className="mb-2 inline-block text-xs font-medium text-primary">
                  {blog.category}
                </span>

                <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {blog.description}
                </p>

                <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {blog.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestBlogsSection;
