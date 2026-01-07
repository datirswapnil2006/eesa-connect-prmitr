import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { MessageSquare, ArrowLeft } from "lucide-react";

type ForumPost = {
  id: string;
  title: string;
  content: string;
  category: string;
};

export default function Forum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("forums")
        .select("*")
        .order("created_at", { ascending: false });

      setPosts(data || []);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-700 hover:text-primary transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <MessageSquare className="w-4 h-4" />
            Community Updates
          </div>


         <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 animate-slide-up">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Forum Announcements
            </span>
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed about important updates, announcements, and
            discussions within the Electronics Engineering Students Association.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {loading && (
          <p className="text-center text-slate-500">
            Loading announcements...
          </p>
        )}

        {!loading && posts.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
            No forum announcements available at the moment.
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border rounded-2xl p-6 hover:shadow-md transition"
            >
              {/* Category */}
              <span className="inline-block mb-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {post.category}
              </span>

              {/* Title */}
              <h2 className="text-xl font-semibold text-slate-900">
                {post.title}
              </h2>

              {/* Content */}
              <p className="text-slate-700 leading-relaxed mt-3 whitespace-pre-line">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
