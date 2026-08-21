import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Image,
  FileText,
  Users,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  Home,
  Info,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/supabase/client";
import OptimizedImage from "@/components/common/OptimizedImage";

const DashboardCard = ({
  icon: Icon,
  title,
  description,
  link,
}: {
  icon: any;
  title: string;
  description: string;
  link: string;
}) => (
  <Link
    to={link}
    className="group rounded-xl border bg-white p-6 hover:shadow-lg transition flex gap-4"
  >
    <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
      <Icon className="w-6 h-6" />
    </div>

    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="eesa-container py-6 flex items-center justify-between">

          {/* LEFT SIDE - EESA Logo + Title */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 text-slate-700 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-100"
              title="Back to Website"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* EESA Logo */}
            <OptimizedImage
              src="/eesa-logo.jpg"
              alt="EESA Logo"
              variant="logo"
              containerClassName="h-10 w-auto"
            />

            {/* Dashboard Title */}
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
            </div>
          </div>

          {/* RIGHT SIDE - College Logo + Logout */}
          <div className="flex items-center gap-6">
            {/* College Logo */}
            <OptimizedImage
              src="/college-logo.jpg"
              alt="College Logo"
              variant="logo"
              containerClassName="h-10 w-auto"
            />

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div className="eesa-container py-12 space-y-12">

        {/* WEBSITE CONTENT */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Website Content
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              icon={Home}
              title="Home Page"
              description="Manage hero, features & CTA content"
              link="/admin/edit-home"
            />

            <DashboardCard
              icon={Info}
              title="About Page"
              description="Update mission, vision & team details"
              link="/admin/edit-about"
            />

            <DashboardCard
              icon={FileText}
              title="Blogs"
              description="Create, edit & publish blog posts"
              link="/admin/add-blog"
            />

            <DashboardCard
              icon={CalendarDays}
              title="Events"
              description="Add and manage upcoming events"
              link="/admin/add-event"
            />

            <DashboardCard
              icon={Users}
              title="Membership"
              description="Manage membership form & visibility"
              link="/admin/membership"
            />

            <DashboardCard
              icon={Image}
              title="Gallery"
              description="Upload and organize gallery images"
              link="/admin/add-gallery"
            />

            <DashboardCard
              icon={Image}
              title="Team"
              description="Upload and organize team images"
              link="/admin/add-team"
            />
          </div>
        </div>

        {/* COMMUNITY & COMMITTEE */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Community & Committee
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              icon={GraduationCap}
              title="Alumni Management"
              description="Review applications, approve alumni, manage directory & connections"
              link="/admin/alumni"
            />

            <DashboardCard
              icon={Users}
              title="Executive Members"
              description="Manage executive members, forum assignments & visibility"
              link="/admin/executive-members"
            />

            <DashboardCard
              icon={GraduationCap}
              title="Batch Members"
              description="Manage academic batches, assign specific members, coordinators & roles"
              link="/admin/batch-members"
            />

            <DashboardCard
              icon={MessageSquare}
              title="Forum"
              description="Moderate announcements, discussions & posts"
              link="/admin/add-forum"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
