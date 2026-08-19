import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ShieldCheck,
  Building2,
  MapPin,
  ExternalLink,
  Linkedin,
  Award,
  Briefcase,
  Layers,
  HeartHandshake,
  UserCheck,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  getAllAlumniAdmin,
  updateAlumniStatusAdmin,
  toggleAlumniActiveAdmin,
  updateAlumniProfileAdmin,
  deleteAlumniAdmin,
  getAllConnectionRequestsAdmin,
  type AlumniProfile,
  type AlumniConnectionRequest,
} from "@/lib/alumniApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DEPARTMENTS = [
  "Electronics & Telecommunication",
  "Core Electronics",
  "Computer Science & Engineering",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & Data Science",
];

const INDUSTRIES = [
  "Semiconductors & VLSI",
  "Embedded Systems & IoT",
  "Software Engineering & Cloud",
  "Telecom & 5G/Networking",
  "Automotive & EV",
  "Robotics & Automation",
  "IT Services & Consulting",
  "Finance & FinTech",
  "Research & Higher Academia",
  "Hardware & Power Electronics",
];

const GRAD_YEARS = Array.from({ length: 17 }, (_, i) => 2026 - i);

export default function AdminAlumni() {
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<AlumniConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: pending, approved, rejected, all, requests
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all" | "requests">("pending");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [filterCompany, setFilterCompany] = useState("");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniProfile | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    graduation_year: 2024,
    academic_year: "2023-24",
    department: "Electronics & Telecommunication",
    company: "",
    designation: "",
    industry: "Software Engineering & Cloud",
    location: "",
    bio: "",
    skills: "",
    linkedin_url: "",
    profile_photo_url: "",
    mentorship_available: false,
    career_guidance_available: false,
    internship_support: false,
    job_referral_support: false,
    status: "pending" as "pending" | "approved" | "rejected",
    is_active: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Alert State
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [alumni, requests] = await Promise.all([
        getAllAlumniAdmin(),
        getAllConnectionRequestsAdmin(),
      ]);
      setAlumniList(alumni);
      setConnectionRequests(requests);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load alumni admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Action: Approve Alumni
  const handleApprove = async (id: string) => {
    try {
      await updateAlumniStatusAdmin(id, "approved", true);
      toast.success("Alumni profile approved and made publicly visible!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve alumni");
    }
  };

  // Quick Action: Reject Alumni
  const handleReject = async (id: string) => {
    try {
      await updateAlumniStatusAdmin(id, "rejected");
      toast.info("Alumni profile marked as rejected.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject alumni");
    }
  };

  // Quick Action: Toggle Active / Hide
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleAlumniActiveAdmin(id, !currentActive);
      toast.success(
        !currentActive
          ? "Alumni profile is now visible in the directory."
          : "Alumni profile is now hidden from the directory."
      );
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle visibility");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (alumni: AlumniProfile) => {
    setEditingAlumni(alumni);
    setEditForm({
      full_name: alumni.full_name || "",
      graduation_year: alumni.graduation_year || 2024,
      academic_year: alumni.academic_year || "2023-24",
      department: alumni.department || "Electronics & Telecommunication",
      company: alumni.company || "",
      designation: alumni.designation || "",
      industry: alumni.industry || "Software Engineering & Cloud",
      location: alumni.location || "",
      bio: alumni.bio || "",
      skills: (alumni.skills || []).join(", "),
      linkedin_url: alumni.linkedin_url || "",
      profile_photo_url: alumni.profile_photo_url || "",
      mentorship_available: alumni.mentorship_available,
      career_guidance_available: alumni.career_guidance_available,
      internship_support: alumni.internship_support,
      job_referral_support: alumni.job_referral_support,
      status: alumni.status,
      is_active: alumni.is_active,
    });
    setEditModalOpen(true);
  };

  // Save Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlumni) return;

    try {
      setSavingEdit(true);
      await updateAlumniProfileAdmin(editingAlumni.id, {
        full_name: editForm.full_name,
        graduation_year: Number(editForm.graduation_year),
        academic_year: editForm.academic_year,
        department: editForm.department,
        company: editForm.company,
        designation: editForm.designation,
        industry: editForm.industry,
        location: editForm.location,
        bio: editForm.bio,
        skills: editForm.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        linkedin_url: editForm.linkedin_url,
        profile_photo_url: editForm.profile_photo_url,
        mentorship_available: editForm.mentorship_available,
        career_guidance_available: editForm.career_guidance_available,
        internship_support: editForm.internship_support,
        job_referral_support: editForm.job_referral_support,
        status: editForm.status,
        is_active: editForm.is_active,
      });

      toast.success("Alumni profile updated successfully!");
      setEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update alumni");
    } finally {
      setSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAlumniAdmin(deletingId);
      toast.success("Alumni profile permanently deleted.");
      setDeleteAlertOpen(false);
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete alumni");
    }
  };

  // Filtered List
  const filteredAlumni = alumniList.filter((a) => {
    if (activeTab === "pending" && a.status !== "pending") return false;
    if (activeTab === "approved" && a.status !== "approved") return false;
    if (activeTab === "rejected" && a.status !== "rejected") return false;

    if (filterDept !== "all" && a.department !== filterDept) return false;
    if (filterYear !== "all" && a.graduation_year !== filterYear) return false;
    if (filterIndustry !== "all" && a.industry !== filterIndustry) return false;
    if (filterCompany && !a.company?.toLowerCase().includes(filterCompany.toLowerCase())) return false;

    if (search.trim()) {
      const term = search.toLowerCase();
      const match =
        a.full_name?.toLowerCase().includes(term) ||
        a.company?.toLowerCase().includes(term) ||
        a.designation?.toLowerCase().includes(term) ||
        a.location?.toLowerCase().includes(term) ||
        a.skills?.some((s) => s.toLowerCase().includes(term));
      if (!match) return false;
    }

    return true;
  });

  const pendingCount = alumniList.filter((a) => a.status === "pending").length;
  const approvedCount = alumniList.filter((a) => a.status === "approved").length;
  const rejectedCount = alumniList.filter((a) => a.status === "rejected").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="eesa-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Alumni Management
                </h1>
                <p className="text-xs text-slate-500">
                  Approve, moderate, edit, and manage PRMIT&R electronics alumni
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/alumni"
              target="_blank"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 bg-primary/10 px-3 py-2 rounded-lg"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Directory
            </Link>
          </div>
        </div>
      </div>

      <div className="eesa-container py-8 space-y-8">
        {/* KPI STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab("pending")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-lg scale-[1.02] border-amber-500"
                : "bg-white text-slate-800 border-slate-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Pending Approval
              </span>
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold">{pendingCount}</div>
            <p className="text-xs mt-1 opacity-80">Requires admin review</p>
          </div>

          <div
            onClick={() => setActiveTab("approved")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white shadow-lg scale-[1.02] border-emerald-600"
                : "bg-white text-slate-800 border-slate-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Approved & Active
              </span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold">{approvedCount}</div>
            <p className="text-xs mt-1 opacity-80">Publicly visible</p>
          </div>

          <div
            onClick={() => setActiveTab("rejected")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeTab === "rejected"
                ? "bg-rose-600 text-white shadow-lg scale-[1.02] border-rose-600"
                : "bg-white text-slate-800 border-slate-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Rejected Profiles
              </span>
              <XCircle className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold">{rejectedCount}</div>
            <p className="text-xs mt-1 opacity-80">Requires correction</p>
          </div>

          <div
            onClick={() => setActiveTab("requests")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeTab === "requests"
                ? "bg-primary text-white shadow-lg scale-[1.02] border-primary"
                : "bg-white text-slate-800 border-slate-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Connection Requests
              </span>
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold">{connectionRequests.length}</div>
            <p className="text-xs mt-1 opacity-80">Student mentorship inquiries</p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap gap-2 shadow-sm">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-4 h-4" /> Pending Approvals ({pendingCount})
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Approved Alumni ({approvedCount})
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "rejected"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <XCircle className="w-4 h-4" /> Rejected ({rejectedCount})
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" /> All Alumni ({alumniList.length})
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "requests"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <HeartHandshake className="w-4 h-4" /> Connection Requests (
            {connectionRequests.length})
          </button>
        </div>

        {/* TAB: CONNECTION REQUESTS OVERVIEW */}
        {activeTab === "requests" ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary" />
                Student Mentorship & Connection Requests
              </h3>
              <Badge variant="outline">{connectionRequests.length} Total</Badge>
            </div>

            {connectionRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No connection requests submitted yet.
              </div>
            ) : (
              <div className="divide-y">
                {connectionRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-6 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {req.student_name || "PRMIT&R Student"}
                        </span>
                        {req.student_email && (
                          <span className="text-xs text-slate-500">
                            ({req.student_email})
                          </span>
                        )}
                        <span className="text-xs text-slate-400">➔ to alumni:</span>
                        <span className="font-semibold text-primary text-sm">
                          {req.alumni_profiles?.full_name || "Alumni"}
                        </span>
                      </div>

                      {req.message && (
                        <p className="text-xs text-slate-700 bg-slate-100 p-3 rounded-lg border">
                          "{req.message}"
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400">
                        Submitted on {new Date(req.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Badge
                        className={`capitalize text-xs font-bold ${
                          req.status === "accepted"
                            ? "bg-emerald-600 text-white"
                            : req.status === "rejected"
                            ? "bg-rose-600 text-white"
                            : req.status === "cancelled"
                            ? "bg-slate-400 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB: ALUMNI PROFILES MANAGEMENT */
          <div className="space-y-6">
            {/* MULTI-FILTER BAR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, company, skills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 text-xs rounded-xl h-10"
                  />
                </div>

                {/* Dept */}
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Batch */}
                <select
                  value={filterYear}
                  onChange={(e) =>
                    setFilterYear(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                >
                  <option value="all">All Batches</option>
                  {GRAD_YEARS.map((y) => (
                    <option key={y} value={y}>
                      Class of {y}
                    </option>
                  ))}
                </select>

                {/* Industry */}
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                >
                  <option value="all">All Industries</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ALUMNI CARDS / LIST */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-500 text-sm">Loading alumni records...</p>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-slate-500 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-base text-slate-800">
                  No alumni records found in this queue.
                </div>
                <p className="text-xs">
                  Try clearing search filters or switching tabs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((alumni) => (
                  <div
                    key={alumni.id}
                    className={`bg-white rounded-2xl border transition-all flex flex-col justify-between shadow-sm overflow-hidden ${
                      !alumni.is_active
                        ? "opacity-60 border-dashed border-slate-300"
                        : alumni.status === "pending"
                        ? "border-amber-300 ring-1 ring-amber-200"
                        : "border-slate-200 hover:shadow-lg"
                    }`}
                  >
                    {/* Status Top Strip */}
                    <div
                      className={`h-1.5 ${
                        alumni.status === "approved"
                          ? "bg-emerald-500"
                          : alumni.status === "rejected"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                    />

                    <div className="p-5 space-y-4 flex-1">
                      {/* Identity & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {alumni.profile_photo_url ? (
                            <img
                              src={alumni.profile_photo_url}
                              alt={alumni.full_name}
                              className="w-12 h-12 rounded-xl object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-base">
                              {alumni.full_name[0]}
                            </div>
                          )}

                          <div>
                            <h4 className="font-bold text-slate-900 text-base leading-tight">
                              {alumni.full_name}
                            </h4>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <GraduationCap className="w-3.5 h-3.5 text-primary" />
                              Class of {alumni.graduation_year || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            className={`capitalize text-[10px] font-bold ${
                              alumni.status === "approved"
                                ? "bg-emerald-600 text-white"
                                : alumni.status === "rejected"
                                ? "bg-rose-600 text-white"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            {alumni.status}
                          </Badge>

                          {!alumni.is_active && (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Work & Dept */}
                      <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-slate-100">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {alumni.designation || "Role not specified"}
                          </span>
                        </div>
                        {alumni.company && (
                          <div className="text-slate-600 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{alumni.company}</span>
                          </div>
                        )}
                        <div className="text-slate-500 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {alumni.department || "Electronics"}
                          </span>
                        </div>
                      </div>

                      {/* Bio preview */}
                      {alumni.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {alumni.bio}
                        </p>
                      )}

                      {/* Skills */}
                      {alumni.skills && alumni.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {alumni.skills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                          {alumni.skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 px-1">
                              +{alumni.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {alumni.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(alumni.id)}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(alumni.id)}
                              className="h-8 text-rose-600 hover:bg-rose-50 text-xs px-2.5"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}

                        {alumni.status === "approved" && (
                          <button
                            onClick={() =>
                              handleToggleActive(alumni.id, alumni.is_active)
                            }
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                              alumni.is_active
                                ? "text-slate-600 hover:bg-slate-200"
                                : "text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                            }`}
                            title={alumni.is_active ? "Hide Profile" : "Unhide Profile"}
                          >
                            {alumni.is_active ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {alumni.status === "rejected" && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(alumni.id)}
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Now
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(alumni)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingId(alumni.id);
                            setDeleteAlertOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl p-6 border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Alumni Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Modify alumni details, approval status, and visibility settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  className="rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Year (Batch)
                </label>
                <select
                  value={editForm.graduation_year}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      graduation_year: Number(e.target.value),
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  {GRAD_YEARS.map((y) => (
                    <option key={y} value={y}>
                      Class of {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Year
                </label>
                <Input
                  value={editForm.academic_year}
                  onChange={(e) =>
                    setEditForm({ ...editForm, academic_year: e.target.value })
                  }
                  className="rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <Input
                  value={editForm.company}
                  onChange={(e) =>
                    setEditForm({ ...editForm, company: e.target.value })
                  }
                  className="rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Designation
                </label>
                <Input
                  value={editForm.designation}
                  onChange={(e) =>
                    setEditForm({ ...editForm, designation: e.target.value })
                  }
                  className="rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Domain
                </label>
                <select
                  value={editForm.industry}
                  onChange={(e) =>
                    setEditForm({ ...editForm, industry: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <Input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Approval Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e: any) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Directory Visibility (is_active)
                </label>
                <select
                  value={editForm.is_active ? "true" : "false"}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      is_active: e.target.value === "true",
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <option value="true">Visible (Active)</option>
                  <option value="false">Hidden (Inactive)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Profile URL
              </label>
              <Input
                value={editForm.linkedin_url}
                onChange={(e) =>
                  setEditForm({ ...editForm, linkedin_url: e.target.value })
                }
                className="rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Profile Photo URL
              </label>
              <Input
                value={editForm.profile_photo_url}
                onChange={(e) =>
                  setEditForm({ ...editForm, profile_photo_url: e.target.value })
                }
                className="rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skills (comma separated)
              </label>
              <Input
                value={editForm.skills}
                onChange={(e) =>
                  setEditForm({ ...editForm, skills: e.target.value })
                }
                className="rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bio / Summary
              </label>
              <Textarea
                rows={3}
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                className="rounded-lg text-xs"
              />
            </div>

            {/* Support Offerings Checkboxes */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Support Options Enabled
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.mentorship_available}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        mentorship_available: e.target.checked,
                      })
                    }
                  />
                  Mentorship
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.career_guidance_available}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        career_guidance_available: e.target.checked,
                      })
                    }
                  />
                  Career Guidance
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.internship_support}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        internship_support: e.target.checked,
                      })
                    }
                  />
                  Internships
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.job_referral_support}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        job_referral_support: e.target.checked,
                      })
                    }
                  />
                  Job Referrals
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingEdit}
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                {savingEdit ? "Saving Changes..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT DIALOG */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="bg-white rounded-2xl border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Alumni Profile
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-sm">
              Are you sure you want to permanently delete this alumni profile?
              This action cannot be undone and will remove all associated connection
              requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
