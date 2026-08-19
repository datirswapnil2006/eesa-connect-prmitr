import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Search,
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
  Briefcase,
  Layers,
  HeartHandshake,
  Award,
  Radio,
  Megaphone,
  PlusCircle,
  Calendar,
  Video,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
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
  getAllMentorshipRequestsAdmin,
  updateMentorshipRequestStatus,
  getAllJobsAdmin,
  createJob,
  updateJob,
  deleteJob,
  getAllInternshipsAdmin,
  createInternship,
  updateInternship,
  deleteInternship,
  getAllGuestLecturesAdmin,
  createGuestLecture,
  updateGuestLecture,
  deleteGuestLecture,
  getAllAlumniEventsAdmin,
  createAlumniEvent,
  updateAlumniEvent,
  deleteAlumniEvent,
  type AlumniMentorshipRequest,
  type AlumniJob,
  type AlumniInternship,
  type AlumniGuestLecture,
  type AlumniEvent,
} from "@/lib/alumniEcosystemApi";
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

const GRAD_YEARS = Array.from({ length: 17 }, (_, i) => 2026 - i);

export default function AdminAlumni() {
  // Navigation Section Tabs: alumni, mentorship, jobs, internships, lectures, events, connections
  const [activeSection, setActiveSection] = useState<
    "alumni" | "mentorship" | "jobs" | "internships" | "lectures" | "events" | "connections"
  >("alumni");

  // State: Alumni Profiles
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [alumniFilterStatus, setAlumniFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [alumniSearch, setAlumniSearch] = useState("");

  // State: Mentorship Requests
  const [mentorshipList, setMentorshipList] = useState<AlumniMentorshipRequest[]>([]);

  // State: Jobs
  const [jobsList, setJobsList] = useState<AlumniJob[]>([]);

  // State: Internships
  const [internshipsList, setInternshipsList] = useState<AlumniInternship[]>([]);

  // State: Guest Lectures
  const [lecturesList, setLecturesList] = useState<AlumniGuestLecture[]>([]);

  // State: Alumni Events
  const [eventsList, setEventsList] = useState<AlumniEvent[]>([]);

  // State: Connection Requests
  const [connectionsList, setConnectionsList] = useState<AlumniConnectionRequest[]>([]);

  // Loading
  const [loading, setLoading] = useState(true);

  // Modals State
  // 1. Alumni Edit Modal
  const [editAlumniModalOpen, setEditAlumniModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniProfile | null>(null);
  const [alumniForm, setAlumniForm] = useState({
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
    mentorship_available: false,
    career_guidance_available: false,
    internship_support: false,
    job_referral_support: false,
    status: "pending" as "pending" | "approved" | "rejected",
    is_active: true,
  });

  // 2. Job Modal
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<AlumniJob | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    work_mode: "Hybrid" as "Onsite" | "Hybrid" | "Remote",
    experience: "0-2 years",
    skills: "",
    description: "",
    eligibility: "",
    application_url: "",
    application_deadline: "",
    status: "published" as "draft" | "published" | "closed" | "hidden",
  });

  // 3. Internship Modal
  const [internshipModalOpen, setInternshipModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<AlumniInternship | null>(null);
  const [internshipForm, setInternshipForm] = useState({
    title: "",
    company: "",
    location: "",
    work_mode: "Hybrid" as "Onsite" | "Hybrid" | "Remote",
    duration: "3 Months",
    stipend: "",
    skills: "",
    eligibility: "",
    description: "",
    application_url: "",
    application_deadline: "",
    status: "published" as "draft" | "published" | "closed" | "hidden",
  });

  // 4. Guest Lecture Modal
  const [lectureModalOpen, setLectureModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<AlumniGuestLecture[] | null>(null);
  const [lectureForm, setLectureForm] = useState({
    id: "",
    title: "",
    description: "",
    speaker_alumni_id: "",
    speaker_name: "",
    speaker_designation: "",
    speaker_company: "",
    topic_category: "Technical Talk",
    date: "",
    start_time: "10:00",
    end_time: "12:00",
    venue: "Seminar Hall",
    meeting_url: "",
    registration_url: "",
    status: "upcoming" as "upcoming" | "completed" | "cancelled" | "hidden",
  });

  // 5. Event Modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    id: "",
    title: "",
    description: "",
    event_date: "",
    start_time: "10:00",
    end_time: "13:00",
    venue: "Main Auditorium",
    location: "Campus",
    registration_url: "",
    organizer: "EESA Alumni Cell & Electronics Dept",
    status: "upcoming" as "upcoming" | "completed" | "cancelled" | "hidden",
  });

  // Delete Alert
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => Promise<void>) | null>(null);

  // Load All Admin Data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        alumni,
        requests,
        mentorships,
        jobs,
        internships,
        lectures,
        events,
      ] = await Promise.all([
        getAllAlumniAdmin(),
        getAllConnectionRequestsAdmin(),
        getAllMentorshipRequestsAdmin(),
        getAllJobsAdmin(),
        getAllInternshipsAdmin(),
        getAllGuestLecturesAdmin(),
        getAllAlumniEventsAdmin(),
      ]);

      setAlumniList(alumni);
      setConnectionsList(requests);
      setMentorshipList(mentorships);
      setJobsList(jobs);
      setInternshipsList(internships);
      setLecturesList(lectures);
      setEventsList(events);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load alumni admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Alumni Handlers
  const handleApproveAlumni = async (id: string) => {
    try {
      await updateAlumniStatusAdmin(id, "approved", true);
      toast.success("Alumni profile approved and made publicly visible!");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve alumni");
    }
  };

  const handleRejectAlumni = async (id: string) => {
    try {
      await updateAlumniStatusAdmin(id, "rejected");
      toast.info("Alumni profile marked as rejected.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject alumni");
    }
  };

  const handleToggleActiveAlumni = async (id: string, currentActive: boolean) => {
    try {
      await toggleAlumniActiveAdmin(id, !currentActive);
      toast.success(!currentActive ? "Alumni profile visible." : "Alumni profile hidden.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle visibility");
    }
  };

  const handleSaveAlumniEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlumni) return;

    try {
      await updateAlumniProfileAdmin(editingAlumni.id, {
        full_name: alumniForm.full_name,
        graduation_year: Number(alumniForm.graduation_year),
        academic_year: alumniForm.academic_year,
        department: alumniForm.department,
        company: alumniForm.company,
        designation: alumniForm.designation,
        industry: alumniForm.industry,
        location: alumniForm.location,
        bio: alumniForm.bio,
        skills: alumniForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
        linkedin_url: alumniForm.linkedin_url,
        mentorship_available: alumniForm.mentorship_available,
        career_guidance_available: alumniForm.career_guidance_available,
        internship_support: alumniForm.internship_support,
        job_referral_support: alumniForm.job_referral_support,
        status: alumniForm.status,
        is_active: alumniForm.is_active,
      });

      toast.success("Alumni profile updated!");
      setEditAlumniModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  // Job Save Handler
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArr = jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean);

      if (editingJob) {
        await updateJob(editingJob.id, {
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          work_mode: jobForm.work_mode,
          experience: jobForm.experience,
          skills: skillsArr,
          description: jobForm.description,
          eligibility: jobForm.eligibility || null,
          application_url: jobForm.application_url,
          application_deadline: jobForm.application_deadline || null,
          status: jobForm.status,
        });
        toast.success("Job updated successfully!");
      } else {
        await createJob({
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          work_mode: jobForm.work_mode,
          experience: jobForm.experience,
          skills: skillsArr,
          description: jobForm.description,
          eligibility: jobForm.eligibility || null,
          application_url: jobForm.application_url,
          application_deadline: jobForm.application_deadline || null,
          status: jobForm.status,
          poster_name: "EESA Admin",
        });
        toast.success("Job created successfully!");
      }

      setJobModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save job");
    }
  };

  // Internship Save Handler
  const handleSaveInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArr = internshipForm.skills.split(",").map((s) => s.trim()).filter(Boolean);

      if (editingInternship) {
        await updateInternship(editingInternship.id, {
          title: internshipForm.title,
          company: internshipForm.company,
          location: internshipForm.location,
          work_mode: internshipForm.work_mode,
          duration: internshipForm.duration,
          stipend: internshipForm.stipend || null,
          skills: skillsArr,
          eligibility: internshipForm.eligibility || null,
          description: internshipForm.description,
          application_url: internshipForm.application_url,
          application_deadline: internshipForm.application_deadline || null,
          status: internshipForm.status,
        });
        toast.success("Internship updated successfully!");
      } else {
        await createInternship({
          title: internshipForm.title,
          company: internshipForm.company,
          location: internshipForm.location,
          work_mode: internshipForm.work_mode,
          duration: internshipForm.duration,
          stipend: internshipForm.stipend || null,
          skills: skillsArr,
          eligibility: internshipForm.eligibility || null,
          description: internshipForm.description,
          application_url: internshipForm.application_url,
          application_deadline: internshipForm.application_deadline || null,
          status: internshipForm.status,
          poster_name: "EESA Admin",
        });
        toast.success("Internship created successfully!");
      }

      setInternshipModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save internship");
    }
  };

  // Guest Lecture Save Handler
  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find speaker alumni if selected
      const speaker = alumniList.find((a) => a.id === lectureForm.speaker_alumni_id);

      if (lectureForm.id) {
        await updateGuestLecture(lectureForm.id, {
          title: lectureForm.title,
          description: lectureForm.description,
          speaker_alumni_id: lectureForm.speaker_alumni_id || null,
          speaker_name: speaker ? speaker.full_name : lectureForm.speaker_name,
          speaker_designation: speaker ? speaker.designation : lectureForm.speaker_designation,
          speaker_company: speaker ? speaker.company : lectureForm.speaker_company,
          topic_category: lectureForm.topic_category,
          date: lectureForm.date,
          start_time: lectureForm.start_time,
          end_time: lectureForm.end_time,
          venue: lectureForm.venue,
          meeting_url: lectureForm.meeting_url || null,
          registration_url: lectureForm.registration_url || null,
          status: lectureForm.status,
        });
        toast.success("Guest lecture updated!");
      } else {
        await createGuestLecture({
          title: lectureForm.title,
          description: lectureForm.description,
          speaker_alumni_id: lectureForm.speaker_alumni_id || null,
          speaker_name: speaker ? speaker.full_name : lectureForm.speaker_name,
          speaker_designation: speaker ? speaker.designation : lectureForm.speaker_designation,
          speaker_company: speaker ? speaker.company : lectureForm.speaker_company,
          topic_category: lectureForm.topic_category,
          date: lectureForm.date,
          start_time: lectureForm.start_time,
          end_time: lectureForm.end_time,
          venue: lectureForm.venue,
          meeting_url: lectureForm.meeting_url || null,
          registration_url: lectureForm.registration_url || null,
          status: lectureForm.status,
        });
        toast.success("Guest lecture created!");
      }

      setLectureModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save lecture");
    }
  };

  // Event Save Handler
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (eventForm.id) {
        await updateAlumniEvent(eventForm.id, {
          title: eventForm.title,
          description: eventForm.description,
          event_date: eventForm.event_date,
          start_time: eventForm.start_time,
          end_time: eventForm.end_time,
          venue: eventForm.venue,
          location: eventForm.location || null,
          registration_url: eventForm.registration_url || null,
          organizer: eventForm.organizer,
          status: eventForm.status,
        });
        toast.success("Alumni event updated!");
      } else {
        await createAlumniEvent({
          title: eventForm.title,
          description: eventForm.description,
          event_date: eventForm.event_date,
          start_time: eventForm.start_time,
          end_time: eventForm.end_time,
          venue: eventForm.venue,
          location: eventForm.location || null,
          registration_url: eventForm.registration_url || null,
          organizer: eventForm.organizer,
          status: eventForm.status,
        });
        toast.success("Alumni event created!");
      }

      setEventModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save event");
    }
  };

  // Filtered Alumni for Admin
  const filteredAlumni = alumniList.filter((a) => {
    if (alumniFilterStatus !== "all" && a.status !== alumniFilterStatus) return false;
    if (alumniSearch.trim()) {
      const q = alumniSearch.toLowerCase();
      return (
        a.full_name?.toLowerCase().includes(q) ||
        a.company?.toLowerCase().includes(q) ||
        a.designation?.toLowerCase().includes(q) ||
        a.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingAlumniCount = alumniList.filter((a) => a.status === "pending").length;
  const approvedAlumni = alumniList.filter((a) => a.status === "approved");

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
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
                  Alumni Ecosystem Management
                </h1>
                <p className="text-xs text-slate-500">
                  Moderate Directory, Mentorship, Jobs, Internships, Lectures & Events
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
              <ExternalLink className="w-3.5 h-3.5" /> View Public Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="eesa-container py-8 space-y-6">
        {/* 7-MODULE ADMIN NAVIGATION TABS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap gap-2 shadow-sm">
          <button
            onClick={() => setActiveSection("alumni")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSection === "alumni"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            1. Alumni Profiles ({alumniList.length})
            {pendingAlumniCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {pendingAlumniCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection("mentorship")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSection === "mentorship"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            2. Mentorship ({mentorshipList.length})
          </button>

          <button
            onClick={() => setActiveSection("jobs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSection === "jobs"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            3. Jobs ({jobsList.length})
          </button>

          <button
            onClick={() => setActiveSection("internships")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSection === "internships"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4" />
            4. Internships ({internshipsList.length})
          </button>

          <button
            onClick={() => setActiveSection("lectures")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSection === "lectures"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Radio className="w-4 h-4" />
            5. Guest Lectures ({lecturesList.length})
          </button>

          <button
            onClick={() => setActiveSection("events")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSection === "events"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            6. Events ({eventsList.length})
          </button>

          <button
            onClick={() => setActiveSection("connections")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSection === "connections"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            7. Connections ({connectionsList.length})
          </button>
        </div>

        {/* SECTION 1: ALUMNI PROFILES */}
        {activeSection === "alumni" && (
          <div className="space-y-6">
            {/* Filter Sub-Bar */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAlumniFilterStatus("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    alumniFilterStatus === "pending"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Pending Review ({pendingAlumniCount})
                </button>
                <button
                  onClick={() => setAlumniFilterStatus("approved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    alumniFilterStatus === "approved"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Approved ({alumniList.filter((a) => a.status === "approved").length})
                </button>
                <button
                  onClick={() => setAlumniFilterStatus("rejected")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    alumniFilterStatus === "rejected"
                      ? "bg-rose-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Rejected ({alumniList.filter((a) => a.status === "rejected").length})
                </button>
                <button
                  onClick={() => setAlumniFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    alumniFilterStatus === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  All ({alumniList.length})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search alumni..."
                  value={alumniSearch}
                  onChange={(e) => setAlumniSearch(e.target.value)}
                  className="pl-9 text-xs h-9 rounded-lg"
                />
              </div>
            </div>

            {/* Alumni Grid */}
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading alumni records...</div>
            ) : filteredAlumni.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-xs text-slate-500">
                No alumni profiles in this queue.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((alumni) => (
                  <div
                    key={alumni.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between space-y-4 ${
                      !alumni.is_active ? "opacity-60 border-dashed" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <OptimizedImage
                            src={alumni.profile_photo_url}
                            alt={alumni.full_name}
                            variant="profile"
                            fallbackText={alumni.full_name}
                            containerClassName="w-12 h-12 rounded-xl border shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{alumni.full_name}</h4>
                            <div className="text-xs text-slate-500">
                              Class of {alumni.graduation_year || "N/A"}
                            </div>
                          </div>
                        </div>

                        <Badge
                          className={`capitalize text-[10px] ${
                            alumni.status === "approved"
                              ? "bg-emerald-600 text-white"
                              : alumni.status === "rejected"
                              ? "bg-rose-600 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {alumni.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                        <div className="font-semibold text-slate-800">{alumni.designation || "No role"}</div>
                        <div className="text-slate-500">{alumni.company || "No company"}</div>
                        <div className="text-slate-400">{alumni.department || "Electronics"}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {alumni.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveAlumni(alumni.id)}
                              className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectAlumni(alumni.id)}
                              className="h-7 text-rose-600 text-xs px-2"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {alumni.status === "approved" && (
                          <button
                            onClick={() => handleToggleActiveAlumni(alumni.id, alumni.is_active)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs"
                            title={alumni.is_active ? "Hide profile" : "Unhide profile"}
                          >
                            {alumni.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingAlumni(alumni);
                            setAlumniForm({
                              full_name: alumni.full_name,
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
                              mentorship_available: alumni.mentorship_available,
                              career_guidance_available: alumni.career_guidance_available,
                              internship_support: alumni.internship_support,
                              job_referral_support: alumni.job_referral_support,
                              status: alumni.status,
                              is_active: alumni.is_active,
                            });
                            setEditAlumniModalOpen(true);
                          }}
                          className="h-7 text-slate-700 text-xs px-2"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDeleteAction(() => async () => {
                              await deleteAlumniAdmin(alumni.id);
                              toast.success("Alumni profile deleted.");
                              loadAllData();
                            });
                            setDeleteAlertOpen(true);
                          }}
                          className="h-7 text-rose-600 hover:bg-rose-50 text-xs px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: MENTORSHIP REQUESTS */}
        {activeSection === "mentorship" && (
          <div className="bg-white rounded-2xl border divide-y overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                Student Mentorship Requests ({mentorshipList.length})
              </h3>
            </div>

            {mentorshipList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No mentorship requests submitted yet.
              </div>
            ) : (
              mentorshipList.map((req) => (
                <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{req.student_name || "Student"}</span>
                      {req.student_email && <span className="text-xs text-slate-400">({req.student_email})</span>}
                      <span className="text-xs text-slate-400">➔ to mentor</span>
                      <span className="font-bold text-sm text-teal-700">{req.alumni_profiles?.full_name || "Alumnus"}</span>
                    </div>

                    <div className="inline-block bg-teal-50 text-teal-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      Topic: {req.topic}
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">"{req.message}"</p>
                    <div className="text-[11px] text-slate-400">
                      Mode: {req.preferred_mode} • Submitted: {new Date(req.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="capitalize text-xs">{req.status}</Badge>
                    <select
                      value={req.status}
                      onChange={async (e: any) => {
                        await updateMentorshipRequestStatus(req.id, e.target.value);
                        toast.success("Mentorship status updated!");
                        loadAllData();
                      }}
                      className="h-8 px-2 rounded-lg border text-xs bg-white text-slate-800"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SECTION 3: JOB OPPORTUNITIES */}
        {activeSection === "jobs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Job Opportunities ({jobsList.length})
              </h3>

              <Button
                onClick={() => {
                  setEditingJob(null);
                  setJobForm({
                    title: "",
                    company: "",
                    location: "",
                    work_mode: "Hybrid",
                    experience: "0-2 years",
                    skills: "",
                    description: "",
                    eligibility: "",
                    application_url: "",
                    application_deadline: "",
                    status: "published",
                  });
                  setJobModalOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Add Job
              </Button>
            </div>

            {jobsList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-xs text-slate-500">
                No jobs created yet. Click "Add Job" to publish a new vacancy.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobsList.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl border p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{job.title}</h4>
                        <div className="text-xs font-semibold text-primary">{job.company} • {job.location}</div>
                      </div>
                      <Badge className="capitalize text-[10px]">{job.status}</Badge>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Mode: {job.work_mode} | Exp: {job.experience}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingJob(job);
                            setJobForm({
                              title: job.title,
                              company: job.company,
                              location: job.location,
                              work_mode: job.work_mode,
                              experience: job.experience,
                              skills: (job.skills || []).join(", "),
                              description: job.description,
                              eligibility: job.eligibility || "",
                              application_url: job.application_url,
                              application_deadline: job.application_deadline || "",
                              status: job.status,
                            });
                            setJobModalOpen(true);
                          }}
                          className="h-7 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDeleteAction(() => async () => {
                              await deleteJob(job.id);
                              toast.success("Job deleted.");
                              loadAllData();
                            });
                            setDeleteAlertOpen(true);
                          }}
                          className="h-7 text-rose-600 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: INTERNSHIP OPPORTUNITIES */}
        {activeSection === "internships" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Internship Opportunities ({internshipsList.length})
              </h3>

              <Button
                onClick={() => {
                  setEditingInternship(null);
                  setInternshipForm({
                    title: "",
                    company: "",
                    location: "",
                    work_mode: "Hybrid",
                    duration: "3 Months",
                    stipend: "",
                    skills: "",
                    eligibility: "",
                    description: "",
                    application_url: "",
                    application_deadline: "",
                    status: "published",
                  });
                  setInternshipModalOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Add Internship
              </Button>
            </div>

            {internshipsList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-xs text-slate-500">
                No internships created yet. Click "Add Internship" to publish an opening.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {internshipsList.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                        <div className="text-xs font-semibold text-amber-700">{item.company} • {item.location}</div>
                      </div>
                      <Badge className="capitalize text-[10px]">{item.status}</Badge>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Duration: {item.duration} | Stipend: {item.stipend || "Unpaid"}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingInternship(item);
                            setInternshipForm({
                              title: item.title,
                              company: item.company,
                              location: item.location,
                              work_mode: item.work_mode,
                              duration: item.duration,
                              stipend: item.stipend || "",
                              skills: (item.skills || []).join(", "),
                              eligibility: item.eligibility || "",
                              description: item.description,
                              application_url: item.application_url,
                              application_deadline: item.application_deadline || "",
                              status: item.status,
                            });
                            setInternshipModalOpen(true);
                          }}
                          className="h-7 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDeleteAction(() => async () => {
                              await deleteInternship(item.id);
                              toast.success("Internship deleted.");
                              loadAllData();
                            });
                            setDeleteAlertOpen(true);
                          }}
                          className="h-7 text-rose-600 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: GUEST LECTURES */}
        {activeSection === "lectures" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-600" />
                Alumni Guest Lectures & Expert Talks ({lecturesList.length})
              </h3>

              <Button
                onClick={() => {
                  setLectureForm({
                    id: "",
                    title: "",
                    description: "",
                    speaker_alumni_id: "",
                    speaker_name: "",
                    speaker_designation: "",
                    speaker_company: "",
                    topic_category: "Technical Talk",
                    date: new Date().toISOString().split("T")[0],
                    start_time: "10:00",
                    end_time: "12:00",
                    venue: "Seminar Hall",
                    meeting_url: "",
                    registration_url: "",
                    status: "upcoming",
                  });
                  setLectureModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Create Guest Lecture
              </Button>
            </div>

            {lecturesList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-xs text-slate-500">
                No guest lectures scheduled. Click "Create Guest Lecture" to organize an alumni session.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lecturesList.map((lec) => (
                  <div key={lec.id} className="bg-white rounded-2xl border p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{lec.title}</h4>
                        <div className="text-xs font-semibold text-indigo-600">
                          Speaker: {lec.alumni_profiles?.full_name || lec.speaker_name || "Alumnus"}
                        </div>
                      </div>
                      <Badge className="capitalize text-[10px]">{lec.status}</Badge>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <div>Date: {lec.date} ({lec.start_time} - {lec.end_time})</div>
                      <div>Venue: {lec.venue}</div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Category: {lec.topic_category}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setLectureForm({
                              id: lec.id,
                              title: lec.title,
                              description: lec.description,
                              speaker_alumni_id: lec.speaker_alumni_id || "",
                              speaker_name: lec.speaker_name || "",
                              speaker_designation: lec.speaker_designation || "",
                              speaker_company: lec.speaker_company || "",
                              topic_category: lec.topic_category,
                              date: lec.date,
                              start_time: lec.start_time,
                              end_time: lec.end_time,
                              venue: lec.venue,
                              meeting_url: lec.meeting_url || "",
                              registration_url: lec.registration_url || "",
                              status: lec.status,
                            });
                            setLectureModalOpen(true);
                          }}
                          className="h-7 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDeleteAction(() => async () => {
                              await deleteGuestLecture(lec.id);
                              toast.success("Guest lecture deleted.");
                              loadAllData();
                            });
                            setDeleteAlertOpen(true);
                          }}
                          className="h-7 text-rose-600 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: ALUMNI EVENTS */}
        {activeSection === "events" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-teal-600" />
                Alumni Events & Meets ({eventsList.length})
              </h3>

              <Button
                onClick={() => {
                  setEventForm({
                    id: "",
                    title: "",
                    description: "",
                    event_date: new Date().toISOString().split("T")[0],
                    start_time: "10:00",
                    end_time: "13:00",
                    venue: "Main Auditorium",
                    location: "College Campus",
                    registration_url: "",
                    organizer: "EESA Alumni Cell & Electronics Dept",
                    status: "upcoming",
                  });
                  setEventModalOpen(true);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Create Event
              </Button>
            </div>

            {eventsList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-xs text-slate-500">
                No events created yet. Click "Create Event" to publish a new alumni meet or workshop.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventsList.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                        <div className="text-xs font-semibold text-teal-700">{item.organizer}</div>
                      </div>
                      <Badge className="capitalize text-[10px]">{item.status}</Badge>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <div>Date: {item.event_date} ({item.start_time} - {item.end_time})</div>
                      <div>Venue: {item.venue}</div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{item.location || "On Campus"}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEventForm({
                              id: item.id,
                              title: item.title,
                              description: item.description,
                              event_date: item.event_date,
                              start_time: item.start_time,
                              end_time: item.end_time,
                              venue: item.venue,
                              location: item.location || "",
                              registration_url: item.registration_url || "",
                              organizer: item.organizer,
                              status: item.status,
                            });
                            setEventModalOpen(true);
                          }}
                          className="h-7 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDeleteAction(() => async () => {
                              await deleteAlumniEvent(item.id);
                              toast.success("Event deleted.");
                              loadAllData();
                            });
                            setDeleteAlertOpen(true);
                          }}
                          className="h-7 text-rose-600 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 7: CONNECTIONS */}
        {activeSection === "connections" && (
          <div className="bg-white rounded-2xl border divide-y overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-primary" />
                Student Networking & Connection Requests ({connectionsList.length})
              </h3>
            </div>

            {connectionsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No connection requests submitted yet.
              </div>
            ) : (
              connectionsList.map((req) => (
                <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{req.student_name || "Student"}</span>
                      {req.student_email && <span className="text-xs text-slate-400">({req.student_email})</span>}
                      <span className="text-xs text-slate-400">➔ to alumni</span>
                      <span className="font-bold text-sm text-primary">{req.alumni_profiles?.full_name || "Alumni"}</span>
                    </div>

                    {req.message && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">"{req.message}"</p>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Submitted: {new Date(req.created_at).toLocaleString()}
                    </div>
                  </div>

                  <Badge className="capitalize text-xs">{req.status}</Badge>
                </div>
              ))
            )}
          </div>
        )}

        {/* MODAL: EDIT ALUMNI */}
        <Dialog open={editAlumniModalOpen} onOpenChange={setEditAlumniModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Edit Alumni Profile</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveAlumniEdit} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Full Name</label>
                  <Input
                    required
                    value={alumniForm.full_name}
                    onChange={(e) => setAlumniForm({ ...alumniForm, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Batch</label>
                  <select
                    value={alumniForm.graduation_year}
                    onChange={(e) => setAlumniForm({ ...alumniForm, graduation_year: Number(e.target.value) })}
                    className="w-full h-10 px-2 rounded-lg border bg-white"
                  >
                    {GRAD_YEARS.map((y) => (
                      <option key={y} value={y}>Class of {y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Company</label>
                  <Input
                    value={alumniForm.company}
                    onChange={(e) => setAlumniForm({ ...alumniForm, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Designation</label>
                  <Input
                    value={alumniForm.designation}
                    onChange={(e) => setAlumniForm({ ...alumniForm, designation: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Status</label>
                <select
                  value={alumniForm.status}
                  onChange={(e: any) => setAlumniForm({ ...alumniForm, status: e.target.value })}
                  className="w-full h-10 px-2 rounded-lg border bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditAlumniModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL: JOB CREATE / EDIT */}
        <Dialog open={jobModalOpen} onOpenChange={setJobModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                {editingJob ? "Edit Job Opportunity" : "Create Job Opportunity"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveJob} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Job Title *</label>
                  <Input
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Company *</label>
                  <Input
                    required
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Location</label>
                  <Input
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Work Mode</label>
                  <select
                    value={jobForm.work_mode}
                    onChange={(e: any) => setJobForm({ ...jobForm, work_mode: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg border bg-white"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={jobForm.status}
                    onChange={(e: any) => setJobForm({ ...jobForm, status: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg border bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Skills (comma separated)</label>
                <Input
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description *</label>
                <Textarea
                  required
                  rows={3}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Application URL *</label>
                <Input
                  required
                  type="url"
                  value={jobForm.application_url}
                  onChange={(e) => setJobForm({ ...jobForm, application_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setJobModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white">Save Job</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL: INTERNSHIP CREATE / EDIT */}
        <Dialog open={internshipModalOpen} onOpenChange={setInternshipModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                {editingInternship ? "Edit Internship" : "Create Internship"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveInternship} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Internship Title *</label>
                  <Input
                    required
                    value={internshipForm.title}
                    onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Company *</label>
                  <Input
                    required
                    value={internshipForm.company}
                    onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Duration</label>
                  <Input
                    value={internshipForm.duration}
                    onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Stipend</label>
                  <Input
                    value={internshipForm.stipend}
                    onChange={(e) => setInternshipForm({ ...internshipForm, stipend: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={internshipForm.status}
                    onChange={(e: any) => setInternshipForm({ ...internshipForm, status: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg border bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description *</label>
                <Textarea
                  required
                  rows={3}
                  value={internshipForm.description}
                  onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Application URL *</label>
                <Input
                  required
                  type="url"
                  value={internshipForm.application_url}
                  onChange={(e) => setInternshipForm({ ...internshipForm, application_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setInternshipModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 text-white">Save Internship</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL: GUEST LECTURE CREATE / EDIT */}
        <Dialog open={lectureModalOpen} onOpenChange={setLectureModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                {lectureForm.id ? "Edit Guest Lecture" : "Schedule Guest Lecture"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveLecture} className="space-y-3 py-2 text-xs">
              <div>
                <label className="font-semibold block mb-1">Session Title *</label>
                <Input
                  required
                  value={lectureForm.title}
                  onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Select Speaker (from Approved Alumni)</label>
                <select
                  value={lectureForm.speaker_alumni_id}
                  onChange={(e) => {
                    const sel = approvedAlumni.find((a) => a.id === e.target.value);
                    setLectureForm({
                      ...lectureForm,
                      speaker_alumni_id: e.target.value,
                      speaker_name: sel ? sel.full_name : lectureForm.speaker_name,
                      speaker_designation: sel ? sel.designation || "" : lectureForm.speaker_designation,
                      speaker_company: sel ? sel.company || "" : lectureForm.speaker_company,
                    });
                  }}
                  className="w-full h-10 px-2 rounded-lg border bg-white"
                >
                  <option value="">-- Choose Approved Alumnus or enter below --</option>
                  {approvedAlumni.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} ({a.designation} {a.company && `@ ${a.company}`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Date *</label>
                  <Input
                    required
                    type="date"
                    value={lectureForm.date}
                    onChange={(e) => setLectureForm({ ...lectureForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={lectureForm.start_time}
                    onChange={(e) => setLectureForm({ ...lectureForm, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">End Time</label>
                  <Input
                    type="time"
                    value={lectureForm.end_time}
                    onChange={(e) => setLectureForm({ ...lectureForm, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Venue</label>
                  <Input
                    value={lectureForm.venue}
                    onChange={(e) => setLectureForm({ ...lectureForm, venue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={lectureForm.status}
                    onChange={(e: any) => setLectureForm({ ...lectureForm, status: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg border bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description *</label>
                <Textarea
                  required
                  rows={3}
                  value={lectureForm.description}
                  onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Meeting Link (Zoom / Meet)</label>
                  <Input
                    type="url"
                    value={lectureForm.meeting_url}
                    onChange={(e) => setLectureForm({ ...lectureForm, meeting_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Registration Link</label>
                  <Input
                    type="url"
                    value={lectureForm.registration_url}
                    onChange={(e) => setLectureForm({ ...lectureForm, registration_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setLectureModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 text-white">Save Lecture</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL: EVENT CREATE / EDIT */}
        <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                {eventForm.id ? "Edit Alumni Event" : "Create Alumni Event"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveEvent} className="space-y-3 py-2 text-xs">
              <div>
                <label className="font-semibold block mb-1">Event Title *</label>
                <Input
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Event Date *</label>
                  <Input
                    required
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">End Time</label>
                  <Input
                    type="time"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Venue</label>
                  <Input
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e: any) => setEventForm({ ...eventForm, status: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg border bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description *</label>
                <Textarea
                  required
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Registration Link (Optional)</label>
                <Input
                  type="url"
                  value={eventForm.registration_url}
                  onChange={(e) => setEventForm({ ...eventForm, registration_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEventModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 text-white">Save Event</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRMATION ALERT DIALOG */}
        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This record will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (deleteAction) {
                    await deleteAction();
                  }
                  setDeleteAlertOpen(false);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
