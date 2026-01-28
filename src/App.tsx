import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* PUBLIC PAGES */
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Forum from "./pages/Forum";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

/* ADMIN PAGES */
import AdminLogin from "./admin/Login";
import AdminDashboard from "./admin/Dashboard";
import BlogList from "./admin/BlogList";
import AddBlog from "./admin/AddBlog";
import AddEvent from "./admin/AddEvent";
import AddGallery from "./admin/AddGallery";
import AddForum from "./admin/AddForum";
import EditHome from "./admin/EditHome";
import EditAbout from "./admin/EditAbout";
import AdminAddTeam from "./admin/AdminAddTeam";
import MembershipSettings from "./admin/MembershipSettings";

/* ADMIN GUARD */
import AdminGuard from "./admin/AdminGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* ADMIN LOGIN */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ADMIN DASHBOARD */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />

          {/* MEMBERSHIP SETTINGS */}
          <Route
            path="/admin/membership"
            element={
              <AdminGuard>
                <MembershipSettings />
              </AdminGuard>
            }
          />

          {/* BLOG MANAGEMENT */}
          <Route
            path="/admin/blogs"
            element={
              <AdminGuard>
                <BlogList />
              </AdminGuard>
            }
          />

          <Route
            path="/admin/add-blog"
            element={
              <AdminGuard>
                <AddBlog />
              </AdminGuard>
            }
          />

          {/* EVENTS */}
          <Route
            path="/admin/add-event"
            element={
              <AdminGuard>
                <AddEvent />
              </AdminGuard>
            }
          />

          {/* GALLERY */}
          <Route
            path="/admin/add-gallery"
            element={
              <AdminGuard>
                <AddGallery />
              </AdminGuard>
            }
          />

          {/* FORUM */}
          <Route
            path="/admin/add-forum"
            element={
              <AdminGuard>
                <AddForum />
              </AdminGuard>
            }
          />

          {/* CMS TEXT PAGES */}
          <Route
            path="/admin/edit-home"
            element={
              <AdminGuard>
                <EditHome />
              </AdminGuard>
            }
          />

          <Route
            path="/admin/edit-about"
            element={
              <AdminGuard>
                <EditAbout />
              </AdminGuard>
            }
          />

          {/* TEAM */}
          <Route
            path="/admin/add-team"
            element={
              <AdminGuard>
                <AdminAddTeam />
              </AdminGuard>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
