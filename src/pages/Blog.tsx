import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { BookOpen, ArrowLeft, Calendar, Clock, User, ChevronRight, Loader2, Search, Filter } from "lucide-react";

type Blog = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  author?: string;
  read_time?: number;
  category?: string;
};

export default function Blog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        const blogsWithDefaults = (data || []).map(blog => ({
          ...blog,
          author: blog.author || "EESA Team",
          read_time: blog.read_time || Math.ceil(blog.content.length / 1000) * 3, // ~3 min per 1000 chars
          category: blog.category || "General"
        }));
        setBlogs(blogsWithDefaults);
        setFilteredBlogs(blogsWithDefaults);
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  // Filter blogs based on search and category
  useEffect(() => {
    let result = blogs;
    
    if (searchQuery) {
      result = result.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      result = result.filter(blog => blog.category === selectedCategory);
    }
    
    setFilteredBlogs(result);
  }, [searchQuery, selectedCategory, blogs]);

  const categories = Array.from(new Set(blogs.map(blog => blog.category)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-slate-700 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/5">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <BookOpen className="w-4 h-4" />
            Insights & Updates
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 animate-slide-up">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              EESA Blog
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-100">
            Discover the latest announcements, technical insights, and student activities from the Electronics Engineering Students Association.
          </p>

          {/* Search on mobile */}
          <div className="max-w-md mx-auto mb-8 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? "bg-primary text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Articles
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-slate-600 animate-pulse">Loading articles...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-dashed rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                No articles found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery || selectedCategory 
                  ? "Try adjusting your search or filter criteria."
                  : "No blogs published yet. Check back soon!"}
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog, index) => {
            const isExpanded = expandedId === blog.id;

            return (
              <article
                key={blog.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-primary/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Header with Gradient */}
                <div className="h-2 bg-gradient-to-r from-primary via-primary/60 to-primary/30" />
                
                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
                    {blog.category}
                  </span>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h2>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Recently'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{blog.read_time} min read</span>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="relative">
                    <p
                      className={`text-slate-700 leading-relaxed transition-all duration-300 ${
                        !isExpanded ? "line-clamp-3" : ""
                      }`}
                    >
                      {blog.content}
                    </p>
                    
                    {/* Gradient overlay for collapsed state */}
                    {!isExpanded && blog.content.length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center justify-between pt-6 border-t">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : blog.id)}
                      className="group/btn inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      {isExpanded ? "Show less" : "Continue reading"}
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : 'group-hover/btn:translate-x-1'}`} />
                    </button>
                    
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Stats */}
        {!loading && blogs.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl">
                <div className="text-3xl font-bold text-primary mb-2">{blogs.length}</div>
                <div className="text-sm text-slate-600">Total Articles</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-slate-600">Categories</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl">
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round(blogs.reduce((acc, blog) => acc + (blog.read_time || 0), 0) / 60)}
                </div>
                <div className="text-sm text-slate-600">Hours of Content</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {new Date(Math.max(...blogs.map(b => new Date(b.created_at || 0).getTime()))).getFullYear()}
                </div>
                <div className="text-sm text-slate-600">Latest Update</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-600">
            © {new Date().getFullYear()} EESA Blog. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Powered by Electronics Engineering Students Association
          </p>
        </div>
      </footer>
    </div>
  );
}