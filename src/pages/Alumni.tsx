import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  MapPin,
  Linkedin,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  UserPlus,
  Send,
  ExternalLink,
  ShieldCheck,
  Building2,
  Layers,
  RotateCcw,
  Award,
  HeartHandshake,
  Users,
  Video,
  Calendar,
  Compass,
  Megaphone,
  Radio,
  Share2,
  PlusCircle,
  Info,
  CalendarDays,
  DollarSign,
  ChevronRight,
  Phone,
  Mail,
  UserCheck,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/supabase/client";
import {
  getPublicAlumni,
  getMyAlumniProfile,
  upsertAlumniProfile,
  sendAlumniConnectionRequest,
  getMySentRequests,
  getMyReceivedRequests,
  updateConnectionRequestStatus,
  uploadAlumniPhoto,
  type AlumniProfile,
  type AlumniConnectionRequest,
} from "@/lib/alumniApi";
import {
  sendMentorshipRequest,
  getMySentMentorshipRequests,
  getMyReceivedMentorshipRequests,
  updateMentorshipRequestStatus,
  getPublicJobs,
  getPublicInternships,
  getPublicGuestLectures,
  getPublicAlumniEvents,
  createJob,
  createInternship,
  MENTORSHIP_TOPICS,
  INTERACTION_MODES,
  type AlumniMentorshipRequest,
  type AlumniJob,
  type AlumniInternship,
  type AlumniGuestLecture,
  type AlumniEvent,
} from "@/lib/alumniEcosystemApi";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const DEPARTMENTS = [
  "Computer Science",
  "Mechanical",
  "Electronics",
  "Civil",
  "Information Technology",
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

const GRAD_YEARS = Array.from({ length: 2050 - 1987 + 1 }, (_, i) => 2050 - i);

export default function Alumni() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "directory";
  const [activeEcosystemTab, setActiveEcosystemTab] = useState<string>(initialTab);

  // Synchronize URL query parameter with active tab
  const handleTabChange = (tab: string) => {
    setActiveEcosystemTab(tab);
    setSearchParams({ tab });
  };

  // State: Alumni Directory
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loadingAlumni, setLoadingAlumni] = useState(true);

  // State: Ecosystem Datasets
  const [jobsList, setJobsList] = useState<AlumniJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [internshipsList, setInternshipsList] = useState<AlumniInternship[]>([]);
  const [loadingInternships, setLoadingInternships] = useState(false);

  const [guestLecturesList, setGuestLecturesList] = useState<AlumniGuestLecture[]>([]);
  const [loadingLectures, setLoadingLectures] = useState(false);

  const [alumniEventsList, setAlumniEventsList] = useState<AlumniEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Mentorship Tab Specific State
  const [mentorshipTopicFilter, setMentorshipTopicFilter] = useState("all");
  const [mentorshipModalOpen, setMentorshipModalOpen] = useState(false);
  const [mentorTarget, setMentorTarget] = useState<AlumniProfile | null>(null);
  const [mentorshipTopic, setMentorshipTopic] = useState(MENTORSHIP_TOPICS[0]);
  const [mentorshipMode, setMentorshipMode] = useState(INTERACTION_MODES[0]);
  const [mentorshipMessage, setMentorshipMessage] = useState("");
  const [sendingMentorship, setSendingMentorship] = useState(false);

  // User Auth & Profiles
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authIsSignUp, setAuthIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Alumni Self-Registration / Edit State
  const [myProfile, setMyProfile] = useState<AlumniProfile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    graduation_year: 2024,
    academic_year: "2023-24",
    department: "Electronics & Telecommunication",
    company: "",
    designation: "",
    industry: "Software Engineering & Cloud",
    location: "Pune / Bangalore / Mumbai",
    bio: "",
    skills: "",
    linkedin_url: "",
    mentorship_available: true,
    career_guidance_available: true,
    internship_support: false,
    job_referral_support: false,
  });

  // User Requests Tracking (Networking & Mentorship)
  const [mySentRequests, setMySentRequests] = useState<AlumniConnectionRequest[]>([]);
  const [myReceivedRequests, setMyReceivedRequests] = useState<AlumniConnectionRequest[]>([]);
  const [mySentMentorships, setMySentMentorships] = useState<AlumniMentorshipRequest[]>([]);
  const [myReceivedMentorships, setMyReceivedMentorships] = useState<AlumniMentorshipRequest[]>([]);

  // Directory Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [filterMentorship, setFilterMentorship] = useState(false);
  const [filterCareer, setFilterCareer] = useState(false);
  const [filterInternship, setFilterInternship] = useState(false);
  const [filterJobReferral, setFilterJobReferral] = useState(false);

  // Job Filters & Modal
  const [jobSearch, setJobSearch] = useState("");
  const [jobWorkMode, setJobWorkMode] = useState("all");
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
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
  });

  // Internship Filters & Modal
  const [internshipSearch, setInternshipSearch] = useState("");
  const [internshipWorkMode, setInternshipWorkMode] = useState("all");
  const [postInternshipModalOpen, setPostInternshipModalOpen] = useState(false);
  const [savingInternship, setSavingInternship] = useState(false);
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
  });

  // Detail Modal
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Connection Request Modal
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [targetAlumni, setTargetAlumni] = useState<AlumniProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // Load Directory
  const loadDirectory = async () => {
    try {
      setLoadingAlumni(true);
      const data = await getPublicAlumni({
        search,
        department: selectedDept,
        graduation_year: selectedYear === "all" ? null : selectedYear,
        industry: selectedIndustry,
        mentorship_available: filterMentorship || undefined,
        career_guidance_available: filterCareer || undefined,
        internship_support: filterInternship || undefined,
        job_referral_support: filterJobReferral || undefined,
      });
      setAlumniList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load alumni directory");
    } finally {
      setLoadingAlumni(false);
    }
  };

  // Load Jobs
  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      const data = await getPublicJobs({
        search: jobSearch,
        work_mode: jobWorkMode,
      });
      setJobsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load Internships
  const loadInternships = async () => {
    try {
      setLoadingInternships(true);
      const data = await getPublicInternships({
        search: internshipSearch,
        work_mode: internshipWorkMode,
      });
      setInternshipsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInternships(false);
    }
  };

  // Load Guest Lectures
  const loadGuestLectures = async () => {
    try {
      setLoadingLectures(true);
      const data = await getPublicGuestLectures();
      setGuestLecturesList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLectures(false);
    }
  };

  // Load Alumni Events
  const loadAlumniEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await getPublicAlumniEvents();
      setAlumniEventsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, [
    search,
    selectedDept,
    selectedYear,
    selectedIndustry,
    filterMentorship,
    filterCareer,
    filterInternship,
    filterJobReferral,
  ]);

  useEffect(() => {
    if (activeEcosystemTab === "jobs") {
      loadJobs();
    } else if (activeEcosystemTab === "internships") {
      loadInternships();
    } else if (activeEcosystemTab === "lectures") {
      loadGuestLectures();
    } else if (activeEcosystemTab === "events") {
      loadAlumniEvents();
    }
  }, [activeEcosystemTab, jobSearch, jobWorkMode, internshipSearch, internshipWorkMode]);

  // Auth & Session Tracking
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        loadUserData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setMyProfile(null);
        setMySentRequests([]);
        setMyReceivedRequests([]);
        setMySentMentorships([]);
        setMyReceivedMentorships([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const [profile, sentReqs, sentMent] = await Promise.all([
        getMyAlumniProfile(userId),
        getMySentRequests(userId),
        getMySentMentorshipRequests(userId),
      ]);

      if (profile) {
        setMyProfile(profile);
        setProfileForm({
          full_name: profile.full_name || "",
          graduation_year: profile.graduation_year || 2024,
          academic_year: profile.academic_year || "2023-24",
          department: profile.department || "Electronics & Telecommunication",
          company: profile.company || "",
          designation: profile.designation || "",
          industry: profile.industry || "Software Engineering & Cloud",
          location: profile.location || "",
          bio: profile.bio || "",
          skills: (profile.skills || []).join(", "),
          linkedin_url: profile.linkedin_url || "",
          mentorship_available: profile.mentorship_available,
          career_guidance_available: profile.career_guidance_available,
          internship_support: profile.internship_support,
          job_referral_support: profile.job_referral_support,
        });
        setPhotoPreview(profile.profile_photo_url || null);

        const [receivedReqs, receivedMent] = await Promise.all([
          getMyReceivedRequests(profile.id),
          getMyReceivedMentorshipRequests(profile.id),
        ]);
        setMyReceivedRequests(receivedReqs);
        setMyReceivedMentorships(receivedMent);
      }

      setMySentRequests(sentReqs);
      setMySentMentorships(sentMent);
    } catch (err) {
      console.error(err);
    }
  };

  // Auth Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setAuthLoading(true);
      if (authIsSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authFullName || "EESA Member" },
          },
        });
        if (error) throw error;
        toast.success("Account created successfully!");
        if (data.user) {
          setCurrentUser(data.user);
          loadUserData(data.user.id);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        if (data.user) {
          setCurrentUser(data.user);
          loadUserData(data.user.id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setMyProfile(null);
    toast.success("Logged out successfully");
  };

  // Save Alumni Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in first");
      return;
    }
    if (!profileForm.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    try {
      setSavingProfile(true);
      let photoUrl = myProfile?.profile_photo_url || "";

      if (photoFile) {
        photoUrl = await uploadAlumniPhoto(photoFile);
      }

      const skillsList = profileForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const saved = await upsertAlumniProfile({
        id: myProfile?.id,
        user_id: currentUser.id,
        full_name: profileForm.full_name,
        graduation_year: Number(profileForm.graduation_year),
        academic_year: profileForm.academic_year,
        department: profileForm.department,
        company: profileForm.company,
        designation: profileForm.designation,
        industry: profileForm.industry,
        location: profileForm.location,
        bio: profileForm.bio,
        skills: skillsList,
        profile_photo_url: photoUrl,
        linkedin_url: profileForm.linkedin_url,
        mentorship_available: profileForm.mentorship_available,
        career_guidance_available: profileForm.career_guidance_available,
        internship_support: profileForm.internship_support,
        job_referral_support: profileForm.job_referral_support,
        status: "pending",
        is_active: true,
      });

      setMyProfile(saved);
      toast.success(
        "Alumni profile submitted! It is now pending admin approval before appearing in the public directory."
      );
      loadDirectory();
    } catch (err: any) {
      toast.error(err.message || "Failed to save alumni profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Send Connection Request
  const handleSendConnection = async () => {
    if (!currentUser) {
      setPortalOpen(true);
      toast.info("Please sign in to connect with alumni.");
      return;
    }
    if (!targetAlumni) return;

    if (currentUser.id === targetAlumni.user_id) {
      toast.error("You cannot send a connection request to your own profile.");
      return;
    }

    try {
      setSendingRequest(true);
      await sendAlumniConnectionRequest(
        currentUser.id,
        targetAlumni.id,
        connectMessage,
        currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0],
        currentUser.email
      );

      toast.success(`Connection request sent to ${targetAlumni.full_name}!`);
      setConnectModalOpen(false);
      setConnectMessage("");
      loadUserData(currentUser.id);
    } catch (err: any) {
      if (err.message?.includes("duplicate") || err.code === "23505") {
        toast.error("You have already sent a connection request to this alumni.");
      } else {
        toast.error(err.message || "Failed to send connection request.");
      }
    } finally {
      setSendingRequest(false);
    }
  };

  // Send Mentorship Request
  const handleSendMentorship = async () => {
    if (!currentUser) {
      setPortalOpen(true);
      toast.info("Please sign in or create an account to request mentorship.");
      return;
    }
    if (!mentorTarget) return;

    if (currentUser.id === mentorTarget.user_id) {
      toast.error("You cannot request mentorship from yourself.");
      return;
    }

    if (!mentorshipMessage.trim()) {
      toast.error("Please provide a note explaining what you'd like guidance on.");
      return;
    }

    try {
      setSendingMentorship(true);
      await sendMentorshipRequest({
        studentId: currentUser.id,
        alumniId: mentorTarget.id,
        topic: mentorshipTopic,
        message: mentorshipMessage,
        preferredMode: mentorshipMode,
        studentName:
          currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0],
        studentEmail: currentUser.email,
      });

      toast.success(
        `Mentorship request sent to ${mentorTarget.full_name}! They will review your note.`
      );
      setMentorshipModalOpen(false);
      setMentorshipMessage("");
      loadUserData(currentUser.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to send mentorship request.");
    } finally {
      setSendingMentorship(false);
    }
  };

  // Submit Job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in first.");
      return;
    }
    if (!jobForm.title.trim() || !jobForm.company.trim() || !jobForm.application_url.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setSavingJob(true);
      const skillsArray = jobForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createJob({
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location || "Remote / Hybrid",
        work_mode: jobForm.work_mode,
        experience: jobForm.experience,
        skills: skillsArray,
        description: jobForm.description,
        eligibility: jobForm.eligibility || null,
        application_url: jobForm.application_url,
        application_deadline: jobForm.application_deadline || null,
        posted_by_alumni_id: myProfile?.id || null,
        posted_by_user_id: currentUser.id,
        poster_name: myProfile?.full_name || currentUser.user_metadata?.full_name || "Alumnus",
        status: "published",
      });

      toast.success("Job opportunity posted successfully!");
      setPostJobModalOpen(false);
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
      });
      loadJobs();
    } catch (err: any) {
      toast.error(err.message || "Failed to post job.");
    } finally {
      setSavingJob(false);
    }
  };

  // Submit Internship
  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in first.");
      return;
    }
    if (!internshipForm.title.trim() || !internshipForm.company.trim() || !internshipForm.application_url.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setSavingInternship(true);
      const skillsArray = internshipForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createInternship({
        title: internshipForm.title,
        company: internshipForm.company,
        location: internshipForm.location || "Remote / Hybrid",
        work_mode: internshipForm.work_mode,
        duration: internshipForm.duration,
        stipend: internshipForm.stipend || null,
        skills: skillsArray,
        eligibility: internshipForm.eligibility || null,
        description: internshipForm.description,
        application_url: internshipForm.application_url,
        application_deadline: internshipForm.application_deadline || null,
        posted_by_alumni_id: myProfile?.id || null,
        posted_by_user_id: currentUser.id,
        poster_name: myProfile?.full_name || currentUser.user_metadata?.full_name || "Alumnus",
        status: "published",
      });

      toast.success("Internship opportunity posted successfully!");
      setPostInternshipModalOpen(false);
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
      });
      loadInternships();
    } catch (err: any) {
      toast.error(err.message || "Failed to post internship.");
    } finally {
      setSavingInternship(false);
    }
  };

  // Filter Mentors
  const mentorsList = alumniList.filter((a) => a.mentorship_available || a.career_guidance_available);

  const clearFilters = () => {
    setSearch("");
    setSelectedDept("all");
    setSelectedYear("all");
    setSelectedIndustry("all");
    setFilterMentorship(false);
    setFilterCareer(false);
    setFilterInternship(false);
    setFilterJobReferral(false);
  };

  const hasActiveFilters =
    search ||
    selectedDept !== "all" ||
    selectedYear !== "all" ||
    selectedIndustry !== "all" ||
    filterMentorship ||
    filterCareer ||
    filterInternship ||
    filterJobReferral;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-slate-50 to-slate-50 py-6 md:py-9 border-b border-slate-200">
          <div className="eesa-container relative z-10">
            <div className="max-w-4xl mx-auto mb-2 flex justify-start">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200 text-xs md:text-sm font-semibold text-slate-700 hover:text-primary hover:bg-white transition-all shadow-2xs group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                PRMIT&R Department of Electronics Engineering
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                EESA{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-600 to-teal-500">
                  Alumni Connect
                </span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Connect • Learn • Mentor • Grow. Engage with esteemed PRMIT&R electronics alumni across global tech, VLSI, embedded systems, and core industries.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <Button
                  size="sm"
                  onClick={() => setPortalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 text-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {myProfile ? "My Alumni Profile / Dashboard" : "Alumni Registration / Portal"}
                </Button>

                {currentUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTabChange("networking")}
                    className="bg-white hover:bg-slate-100 text-slate-800 font-semibold px-4 py-2 rounded-lg border-slate-300 shadow-sm text-xs"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    My Requests ({mySentRequests.length + mySentMentorships.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 7-PILLAR INTERACTIVE ECOSYSTEM NAVIGATION */}
        <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="eesa-container py-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => handleTabChange("directory")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeEcosystemTab === "directory"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                1. Alumni Directory
              </button>

              <button
                onClick={() => handleTabChange("mentorship")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeEcosystemTab === "mentorship"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                2. Mentorship
              </button>

              <button
                onClick={() => handleTabChange("jobs")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeEcosystemTab === "jobs"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                3. Jobs
              </button>

              <button
                onClick={() => handleTabChange("internships")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeEcosystemTab === "internships"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                4. Internships
              </button>

              <button
                onClick={() => handleTabChange("lectures")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeEcosystemTab === "lectures"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                5. Guest Lectures
              </button>

              <button
                onClick={() => handleTabChange("events")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeEcosystemTab === "events"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                6. Alumni Events
              </button>

              <button
                onClick={() => handleTabChange("networking")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeEcosystemTab === "networking"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                7. Professional Networking
              </button>
            </div>
          </div>
        </section>

        {/* ==========================================================
            MODULE 1: ALUMNI DIRECTORY
            ========================================================== */}
        {activeEcosystemTab === "directory" && (
          <section className="eesa-container py-10 space-y-8 animate-fade-in">
            {/* SEARCH & FILTERS BAR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search alumni by name, company, designation, skills (e.g. VLSI, Python, Embedded), location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 py-3 h-12 text-base rounded-xl border-slate-200 focus:border-primary"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Grid Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800"
                  >
                    <option value="all">All Departments</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Graduation Batch
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) =>
                      setSelectedYear(
                        e.target.value === "all" ? "all" : Number(e.target.value)
                      )
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800"
                  >
                    <option value="all">All Batches</option>
                    {GRAD_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        Class of {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Industry / Domain
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800"
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

              {/* Filter Chips */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Support Areas:
                  </span>

                  <button
                    onClick={() => setFilterMentorship(!filterMentorship)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      filterMentorship
                        ? "bg-primary text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" /> Mentorship Available
                  </button>

                  <button
                    onClick={() => setFilterCareer(!filterCareer)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      filterCareer
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Career Guidance
                  </button>

                  <button
                    onClick={() => setFilterInternship(!filterInternship)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      filterInternship
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" /> Internship Referrals
                  </button>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* RESULTS COUNT */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Verified PRMIT&R Alumni
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {alumniList.length} Active
                </span>
              </h2>
            </div>

            {/* DIRECTORY GRID */}
            {loadingAlumni ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-500 text-sm">Loading verified alumni...</p>
              </div>
            ) : alumniList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Alumni Profiles Found
                </h3>
                <p className="text-sm text-slate-600">
                  {hasActiveFilters
                    ? "Try resetting your search query or filters to discover more alumni."
                    : "No approved alumni profiles are active in the directory at the moment."}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alumniList.map((alumni) => (
                  <div
                    key={alumni.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-primary to-teal-500" />

                    <div className="p-6 space-y-4 flex-1">
                      {/* Identity */}
                      <div className="flex items-start gap-4">
                        <OptimizedImage
                          src={alumni.profile_photo_url}
                          alt={alumni.full_name}
                          variant="profile"
                          fallbackText={alumni.full_name}
                          containerClassName="w-16 h-16 rounded-2xl border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-primary transition-colors">
                              {alumni.full_name}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                          </div>

                          {alumni.graduation_year && (
                            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                              <GraduationCap className="w-3.5 h-3.5 text-primary" />
                              Batch of {alumni.graduation_year}
                            </div>
                          )}

                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {alumni.department || "Electronics Engg"}
                          </div>
                        </div>
                      </div>

                      {/* Role & Company */}
                      {(alumni.designation || alumni.company) && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                          {alumni.designation && (
                            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="truncate">{alumni.designation}</span>
                            </div>
                          )}
                          {alumni.company && (
                            <div className="text-xs font-medium text-slate-600 flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{alumni.company}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {alumni.mentorship_available && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-medium">
                            Mentorship Available
                          </Badge>
                        )}
                        {alumni.career_guidance_available && (
                          <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px] font-medium">
                            Career Guidance
                          </Badge>
                        )}
                        {alumni.internship_support && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-medium">
                            Internship Referrals
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAlumni(alumni);
                          setDetailModalOpen(true);
                        }}
                        className="text-xs text-slate-700 font-semibold"
                      >
                        View Profile
                      </Button>

                      <div className="flex items-center gap-2">
                        {alumni.mentorship_available && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setMentorTarget(alumni);
                              setMentorshipModalOpen(true);
                            }}
                            className="h-8 bg-teal-600 hover:bg-teal-700 text-white text-xs px-2.5"
                          >
                            <GraduationCap className="w-3.5 h-3.5 mr-1" /> Mentor
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => {
                            setTargetAlumni(alumni);
                            setConnectModalOpen(true);
                          }}
                          className="h-8 bg-primary hover:bg-primary/90 text-white text-xs px-2.5"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==========================================================
            MODULE 2: MENTORSHIP
            ========================================================== */}
        {activeEcosystemTab === "mentorship" && (
          <section className="eesa-container py-10 space-y-8 animate-fade-in">
            {/* Mentorship Header Banner */}
            <div className="bg-gradient-to-r from-teal-600 via-primary to-indigo-700 text-white rounded-2xl p-8 shadow-md">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
                  <GraduationCap className="w-4 h-4" /> 1-on-1 Alumni Mentorship Program
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                  Accelerate Your Career with Industry Mentors
                </h2>
                <p className="text-teal-100 text-sm md:text-base leading-relaxed">
                  Request 1:1 guidance on Placement Preparation, VLSI Design, Software Engineering, Higher Studies, and Mock Technical Interviews from verified PRMIT&R electronics alumni.
                </p>
              </div>
            </div>

            {/* Mentors Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Available Alumni Mentors
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold">
                    {mentorsList.length} Mentors Available
                  </span>
                </h3>
              </div>

              {loadingAlumni ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500 text-sm">Finding mentors...</p>
                </div>
              ) : mentorsList.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
                  <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-900">No Mentors Currently Available</h4>
                  <p className="text-xs text-slate-500">
                    Are you an alumnus? Enable "Available for Mentorship" in your profile to guide current students.
                  </p>
                  <Button onClick={() => setPortalOpen(true)} className="bg-primary text-white">
                    Join as Mentor
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentorsList.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <OptimizedImage
                            src={mentor.profile_photo_url}
                            alt={mentor.full_name}
                            variant="profile"
                            fallbackText={mentor.full_name}
                            containerClassName="w-14 h-14 rounded-2xl border shadow-sm shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-base truncate">
                              {mentor.full_name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {mentor.designation} {mentor.company && `@ ${mentor.company}`}
                            </p>
                            <span className="text-[11px] text-teal-600 font-semibold block mt-0.5">
                              Class of {mentor.graduation_year || "Alumni"}
                            </span>
                          </div>
                        </div>

                        {mentor.bio && (
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl">
                            "{mentor.bio}"
                          </p>
                        )}

                        {mentor.skills && mentor.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {mentor.skills.slice(0, 4).map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => {
                          setMentorTarget(mentor);
                          setMentorshipModalOpen(true);
                        }}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 rounded-xl"
                      >
                        <GraduationCap className="w-4 h-4 mr-1.5" /> Request Mentorship
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==========================================================
            MODULE 3: JOB OPPORTUNITIES
            ========================================================== */}
        {activeEcosystemTab === "jobs" && (
          <section className="eesa-container py-10 space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-primary" />
                  Alumni Job Opportunities
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Exclusive corporate referrals & openings posted by PRMIT&R electronics alumni & admin
                </p>
              </div>

              <Button
                onClick={() => {
                  if (!currentUser) {
                    setPortalOpen(true);
                    toast.info("Please sign in as an alumnus or admin to post jobs.");
                    return;
                  }
                  setPostJobModalOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Post Job Opportunity
              </Button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search jobs by title, company, skills..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="pl-10 text-xs rounded-xl"
                />
              </div>

              <select
                value={jobWorkMode}
                onChange={(e) => setJobWorkMode(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
              >
                <option value="all">All Work Modes</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Jobs List */}
            {loadingJobs ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-500 text-sm">Loading job openings...</p>
              </div>
            ) : jobsList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-3">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No opportunities available at the moment.
                </h3>
                <p className="text-xs text-slate-500">
                  Check back soon or ask alumni directly in the directory for referral inquiries.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobsList.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-primary/40 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg leading-snug">
                            {job.title}
                          </h3>
                          <div className="text-sm font-semibold text-primary flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-4 h-4" /> {job.company}
                          </div>
                        </div>

                        <Badge
                          className={`text-xs capitalize ${
                            job.work_mode === "Remote"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : job.work_mode === "Hybrid"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {job.work_mode}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Exp: {job.experience}
                        </div>
                        {job.application_deadline && (
                          <div className="flex items-center gap-1 text-rose-600 font-medium">
                            <CalendarDays className="w-3.5 h-3.5" /> Deadline: {job.application_deadline}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-[11px] text-slate-400">
                        {job.poster_name ? `Posted by ${job.poster_name}` : "Alumni Referral"}
                      </div>

                      <a
                        href={job.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                      >
                        Apply / View <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==========================================================
            MODULE 4: INTERNSHIP OPPORTUNITIES
            ========================================================== */}
        {activeEcosystemTab === "internships" && (
          <section className="eesa-container py-10 space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-600" />
                  Alumni Internship Opportunities
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Hands-on industry internships for electronics & tech students
                </p>
              </div>

              <Button
                onClick={() => {
                  if (!currentUser) {
                    setPortalOpen(true);
                    toast.info("Please sign in as an alumnus or admin to post internships.");
                    return;
                  }
                  setPostInternshipModalOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Post Internship
              </Button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search internships by title, company, skills..."
                  value={internshipSearch}
                  onChange={(e) => setInternshipSearch(e.target.value)}
                  className="pl-10 text-xs rounded-xl"
                />
              </div>

              <select
                value={internshipWorkMode}
                onChange={(e) => setInternshipWorkMode(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
              >
                <option value="all">All Work Modes</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Internships List */}
            {loadingInternships ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-500 text-sm">Loading internships...</p>
              </div>
            ) : internshipsList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-3">
                <Award className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No internships available at the moment.
                </h3>
                <p className="text-xs text-slate-500">
                  New student internships will appear here as soon as approved by alumni and admin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {internshipsList.map((internship) => (
                  <div
                    key={internship.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg leading-snug">
                            {internship.title}
                          </h3>
                          <div className="text-sm font-semibold text-amber-700 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-4 h-4" /> {internship.company}
                          </div>
                        </div>

                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
                          {internship.work_mode}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {internship.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration: {internship.duration}
                        </div>
                        {internship.stipend && (
                          <div className="flex items-center gap-1 font-semibold text-emerald-700">
                            <DollarSign className="w-3.5 h-3.5" /> {internship.stipend}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {internship.description}
                      </p>

                      {internship.skills && internship.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {internship.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-[11px] text-slate-400">
                        {internship.poster_name ? `Posted by ${internship.poster_name}` : "Alumni Offering"}
                      </div>

                      <a
                        href={internship.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                      >
                        Apply Now <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==========================================================
            MODULE 5: GUEST LECTURES
            ========================================================== */}
        {activeEcosystemTab === "lectures" && (
          <section className="eesa-container py-10 space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-6 h-6 text-indigo-600" />
                Alumni-Led Guest Lectures & Expert Talks
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Technical masterclasses, industry insights, and career guidance sessions delivered by PRMIT&R electronics alumni
              </p>
            </div>

            {loadingLectures ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-500 text-sm">Loading guest lectures...</p>
              </div>
            ) : guestLecturesList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-3">
                <Radio className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No upcoming guest lectures scheduled yet.
                </h3>
                <p className="text-xs text-slate-500">
                  Stay tuned! Upcoming alumni technical talks and workshops will be published here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guestLecturesList.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                          {lecture.topic_category}
                        </Badge>
                        <Badge
                          className={`text-[10px] font-bold uppercase ${
                            lecture.status === "upcoming"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-400 text-white"
                          }`}
                        >
                          {lecture.status}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg leading-snug">
                        {lecture.title}
                      </h3>

                      {/* Speaker Profile info */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-center gap-3">
                        <OptimizedImage
                          src={lecture.alumni_profiles?.profile_photo_url}
                          alt={lecture.alumni_profiles?.full_name || lecture.speaker_name || "Speaker"}
                          variant="profile"
                          fallbackText={lecture.alumni_profiles?.full_name || lecture.speaker_name || "S"}
                          containerClassName="w-12 h-12 rounded-xl border shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Distinguished Speaker
                          </div>
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {lecture.alumni_profiles?.full_name || lecture.speaker_name || "Alumnus Speaker"}
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {lecture.alumni_profiles?.designation || lecture.speaker_designation}
                            {(lecture.alumni_profiles?.company || lecture.speaker_company) &&
                              ` • ${lecture.alumni_profiles?.company || lecture.speaker_company}`}
                          </div>
                        </div>
                      </div>

                      {/* Date / Time / Venue */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium">{lecture.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span>
                            {lecture.start_time} - {lecture.end_time}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                          <span>{lecture.venue}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {lecture.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      {lecture.registration_url && (
                        <a
                          href={lecture.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl text-center transition"
                        >
                          Register for Session
                        </a>
                      )}
                      {lecture.meeting_url && (
                        <a
                          href={lecture.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Video className="w-4 h-4" /> Join Online
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==========================================================
            MODULE 6: ALUMNI EVENTS
            ========================================================== */}
        {activeEcosystemTab === "events" && (
          <section className="eesa-container py-10 space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-teal-600" />
                Alumni Events, Meets & Reunions
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Official EESA alumni meets, networking gatherings, and department reunions
              </p>
            </div>

            {loadingEvents ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-500 text-sm">Loading alumni events...</p>
              </div>
            ) : alumniEventsList.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-3">
                <Megaphone className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No upcoming alumni events at the moment.
                </h3>
                <p className="text-xs text-slate-500">
                  Event announcements and reunion notices will be published here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {alumniEventsList.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
                          {event.organizer}
                        </Badge>
                        <Badge
                          className={`text-[10px] font-bold uppercase ${
                            event.status === "upcoming"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-400 text-white"
                          }`}
                        >
                          {event.status}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg leading-snug">
                        {event.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-teal-600" />
                          <span className="font-medium">{event.event_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span>
                            {event.start_time} - {event.end_time}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-4 h-4 text-teal-600" />
                          <span>{event.venue} {event.location && `(${event.location})`}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {event.registration_url && (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2.5 rounded-xl text-center transition"
                      >
                        Register for Event
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==========================================================
            MODULE 7: PROFESSIONAL NETWORKING & MY CONNECTIONS
            ========================================================== */}
        {activeEcosystemTab === "networking" && (
          <section className="eesa-container py-10 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-6 h-6 text-primary" />
                  Professional Networking Hub
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Track your 1:1 connection requests and mentorship conversations
                </p>
              </div>

              {!currentUser && (
                <Button onClick={() => setPortalOpen(true)} className="bg-primary text-white text-xs">
                  Sign In to View Requests
                </Button>
              )}
            </div>

            {!currentUser ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
                <HeartHandshake className="w-12 h-12 text-primary mx-auto" />
                <h3 className="font-bold text-slate-900">Sign In to Access Networking</h3>
                <p className="text-xs text-slate-500">
                  Authenticate to track your sent and received connection and mentorship requests.
                </p>
                <Button onClick={() => setPortalOpen(true)} className="bg-primary text-white">
                  Sign In / Register
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="sent" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl">
                  <TabsTrigger value="sent" className="text-xs font-bold">
                    Sent Connections ({mySentRequests.length})
                  </TabsTrigger>
                  {myProfile && (
                    <TabsTrigger value="received" className="text-xs font-bold">
                      Received Requests ({myReceivedRequests.length})
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="mentorship_sent" className="text-xs font-bold">
                    Sent Mentorship ({mySentMentorships.length})
                  </TabsTrigger>
                  {myProfile && (
                    <TabsTrigger value="mentorship_received" className="text-xs font-bold">
                      Received Mentorship ({myReceivedMentorships.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Sent Connection Requests */}
                <TabsContent value="sent">
                  <div className="bg-white rounded-2xl border divide-y overflow-hidden">
                    {mySentRequests.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        You have not sent any connection requests yet. Explore the Alumni Directory to connect!
                      </div>
                    ) : (
                      mySentRequests.map((req) => (
                        <div key={req.id} className="p-5 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="font-bold text-sm text-slate-900">
                              Connection to {req.alumni_profiles?.full_name || "Alumni"}
                            </div>
                            {req.message && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                                "{req.message}"
                              </p>
                            )}
                            <span className="text-[11px] text-slate-400 block">
                              Sent on {new Date(req.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              className={`capitalize text-xs ${
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

                            {req.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  await updateConnectionRequestStatus(req.id, "cancelled");
                                  toast.info("Request cancelled.");
                                  loadUserData(currentUser.id);
                                }}
                                className="text-xs text-rose-600 hover:bg-rose-50 h-7"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Received Requests (Alumni View) */}
                {myProfile && (
                  <TabsContent value="received">
                    <div className="bg-white rounded-2xl border divide-y overflow-hidden">
                      {myReceivedRequests.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                          No received connection requests yet.
                        </div>
                      ) : (
                        myReceivedRequests.map((req) => (
                          <div key={req.id} className="p-5 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="font-bold text-sm text-slate-900">
                                {req.student_name || "PRMIT&R Student"}
                              </div>
                              {req.message && (
                                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                                  "{req.message}"
                                </p>
                              )}
                              <span className="text-[11px] text-slate-400 block">
                                Received on {new Date(req.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {req.status === "pending" ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      await updateConnectionRequestStatus(req.id, "accepted");
                                      toast.success("Request accepted!");
                                      loadUserData(currentUser.id);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      await updateConnectionRequestStatus(req.id, "rejected");
                                      toast.info("Request declined.");
                                      loadUserData(currentUser.id);
                                    }}
                                    className="text-rose-600 hover:bg-rose-50 text-xs h-8"
                                  >
                                    Decline
                                  </Button>
                                </>
                              ) : (
                                <Badge className="capitalize text-xs">{req.status}</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Sent Mentorship */}
                <TabsContent value="mentorship_sent">
                  <div className="bg-white rounded-2xl border divide-y overflow-hidden">
                    {mySentMentorships.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        No mentorship requests sent yet.
                      </div>
                    ) : (
                      mySentMentorships.map((req) => (
                        <div key={req.id} className="p-5 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                Mentorship from {req.alumni_profiles?.full_name || "Mentor"}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {req.topic}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                              "{req.message}"
                            </p>
                            <div className="text-[11px] text-slate-400">
                              Preferred Mode: {req.preferred_mode || "Video Call"} • Sent: {new Date(req.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          <Badge
                            className={`capitalize text-xs ${
                              req.status === "accepted"
                                ? "bg-emerald-600 text-white"
                                : req.status === "rejected"
                                ? "bg-rose-600 text-white"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            {req.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Received Mentorship */}
                {myProfile && (
                  <TabsContent value="mentorship_received">
                    <div className="bg-white rounded-2xl border divide-y overflow-hidden">
                      {myReceivedMentorships.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                          No mentorship requests received yet.
                        </div>
                      ) : (
                        myReceivedMentorships.map((req) => (
                          <div key={req.id} className="p-5 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {req.student_name || "Student"}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                  Topic: {req.topic}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                                "{req.message}"
                              </p>
                              <div className="text-[11px] text-slate-400">
                                Mode: {req.preferred_mode} • {req.student_email && `Email: ${req.student_email}`}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {req.status === "pending" ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      await updateMentorshipRequestStatus(req.id, "accepted");
                                      toast.success("Mentorship request accepted!");
                                      loadUserData(currentUser.id);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      await updateMentorshipRequestStatus(req.id, "rejected");
                                      toast.info("Mentorship request declined.");
                                      loadUserData(currentUser.id);
                                    }}
                                    className="text-rose-600 hover:bg-rose-50 text-xs h-8"
                                  >
                                    Decline
                                  </Button>
                                </>
                              ) : (
                                <Badge className="capitalize text-xs">{req.status}</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            )}
          </section>
        )}

        {/* MODAL: MENTORSHIP REQUEST */}
        <Dialog open={mentorshipModalOpen} onOpenChange={setMentorshipModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                Request Mentorship
              </DialogTitle>
              <DialogDescription>
                Send a 1:1 guidance request to{" "}
                <span className="font-semibold text-slate-800">
                  {mentorTarget?.full_name}
                </span>{" "}
                ({mentorTarget?.designation || "Alumnus"}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area / Topic you need guidance on *
                </label>
                <select
                  value={mentorshipTopic}
                  onChange={(e) => setMentorshipTopic(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                >
                  {MENTORSHIP_TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Interaction Mode
                </label>
                <select
                  value={mentorshipMode}
                  onChange={(e) => setMentorshipMode(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                >
                  {INTERACTION_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Message & Questions *
                </label>
                <Textarea
                  placeholder="Introduce yourself, your current semester, and what specific questions you'd like to ask..."
                  value={mentorshipMessage}
                  onChange={(e) => setMentorshipMessage(e.target.value)}
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setMentorshipModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMentorship}
                  disabled={sendingMentorship}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                >
                  {sendingMentorship ? "Sending..." : "Send Mentorship Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: CONNECTION REQUEST */}
        <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <Send className="w-5 h-5 text-primary" />
                Connect with {targetAlumni?.full_name}
              </DialogTitle>
              <DialogDescription>
                Send a personalized note to introduce yourself and establish a connection.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Introduction Note
                </label>
                <Textarea
                  placeholder="Hello! I am a student at PRMIT&R electronics department interested in your work at..."
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setConnectModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendConnection}
                  disabled={sendingRequest}
                  className="bg-primary hover:bg-primary/90 text-white text-xs"
                >
                  {sendingRequest ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: POST JOB */}
        <Dialog open={postJobModalOpen} onOpenChange={setPostJobModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <Briefcase className="w-5 h-5 text-primary" />
                Post a Job Opportunity
              </DialogTitle>
              <DialogDescription>
                Publish a job referral or vacancy for electronics students and alumni.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateJob} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Software Engineer / VLSI Engineer"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Intel, TCS, Nvidia"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Pune, Bangalore, Remote"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Mode
                  </label>
                  <select
                    value={jobForm.work_mode}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        work_mode: e.target.value as "Onsite" | "Hybrid" | "Remote",
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience Required
                  </label>
                  <Input
                    placeholder="e.g. 0-2 years, Fresher"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deadline (Optional)
                  </label>
                  <Input
                    type="date"
                    value={jobForm.application_deadline}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, application_deadline: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skills (comma separated)
                </label>
                <Input
                  placeholder="e.g. Python, Verilog, C++, React"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description *
                </label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Job roles, responsibilities, and team overview..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Link or Career URL *
                </label>
                <Input
                  required
                  type="url"
                  placeholder="https://company.com/careers/job123"
                  value={jobForm.application_url}
                  onChange={(e) => setJobForm({ ...jobForm, application_url: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPostJobModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingJob}
                  className="bg-primary hover:bg-primary/90 text-white text-xs"
                >
                  {savingJob ? "Posting..." : "Publish Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL: POST INTERNSHIP */}
        <Dialog open={postInternshipModalOpen} onOpenChange={setPostInternshipModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <Award className="w-5 h-5 text-amber-600" />
                Post an Internship
              </DialogTitle>
              <DialogDescription>
                Offer an internship position to PRMIT&R electronics engineering students.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateInternship} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internship Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Embedded Systems Intern"
                    value={internshipForm.title}
                    onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Bosch, Texas Instruments"
                    value={internshipForm.company}
                    onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location
                  </label>
                  <Input
                    placeholder="e.g. Pune, Remote"
                    value={internshipForm.location}
                    onChange={(e) => setInternshipForm({ ...internshipForm, location: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration
                  </label>
                  <Input
                    placeholder="e.g. 3 Months, 6 Months"
                    value={internshipForm.duration}
                    onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stipend (Optional)
                  </label>
                  <Input
                    placeholder="e.g. ₹15,000/mo"
                    value={internshipForm.stipend}
                    onChange={(e) => setInternshipForm({ ...internshipForm, stipend: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skills (comma separated)
                </label>
                <Input
                  placeholder="e.g. STM32, C, PCB Design, IoT"
                  value={internshipForm.skills}
                  onChange={(e) => setInternshipForm({ ...internshipForm, skills: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Internship project, responsibilities, and learnings..."
                  value={internshipForm.description}
                  onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application URL *
                </label>
                <Input
                  required
                  type="url"
                  placeholder="https://company.com/apply-internship"
                  value={internshipForm.application_url}
                  onChange={(e) => setInternshipForm({ ...internshipForm, application_url: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPostInternshipModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingInternship}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                >
                  {savingInternship ? "Posting..." : "Publish Internship"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL: PROFILE DETAILS */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            {selectedAlumni && (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <OptimizedImage
                    src={selectedAlumni.profile_photo_url}
                    alt={selectedAlumni.full_name}
                    variant="profile"
                    fallbackText={selectedAlumni.full_name}
                    containerClassName="w-16 h-16 rounded-2xl border shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedAlumni.full_name}
                    </h3>
                    <div className="text-xs font-semibold text-slate-500">
                      Batch of {selectedAlumni.graduation_year || "N/A"} •{" "}
                      {selectedAlumni.department || "Electronics"}
                    </div>
                    {selectedAlumni.linkedin_url && (
                      <a
                        href={selectedAlumni.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1 hover:underline"
                      >
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>

                {(selectedAlumni.designation || selectedAlumni.company) && (
                  <div className="bg-slate-50 rounded-xl p-3.5 text-xs space-y-1">
                    <div className="font-semibold text-slate-800">
                      {selectedAlumni.designation} {selectedAlumni.company && `@ ${selectedAlumni.company}`}
                    </div>
                    {selectedAlumni.location && (
                      <div className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {selectedAlumni.location}
                      </div>
                    )}
                  </div>
                )}

                {selectedAlumni.bio && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      About / Background
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                      {selectedAlumni.bio}
                    </p>
                  </div>
                )}

                {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Expertise & Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAlumni.skills.map((s, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  {selectedAlumni.mentorship_available && (
                    <Button
                      onClick={() => {
                        setDetailModalOpen(false);
                        setMentorTarget(selectedAlumni);
                        setMentorshipModalOpen(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                    >
                      <GraduationCap className="w-4 h-4 mr-1" /> Request Mentorship
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setDetailModalOpen(false);
                      setTargetAlumni(selectedAlumni);
                      setConnectModalOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white text-xs"
                  >
                    <Send className="w-4 h-4 mr-1" /> Send Connection
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL: AUTH / ALUMNI PORTAL */}
        <Dialog open={portalOpen} onOpenChange={setPortalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <Sparkles className="w-5 h-5 text-primary" />
                {currentUser ? "Alumni Profile & Settings" : "Member & Alumni Portal"}
              </DialogTitle>
              <DialogDescription>
                {currentUser
                  ? `Signed in as ${currentUser.email}. Manage your alumni presence.`
                  : "Sign in or create an account to access mentorship, connections, and directory registration."}
              </DialogDescription>
            </DialogHeader>

            {!currentUser ? (
              <form onSubmit={handleAuth} className="space-y-4 py-2">
                {authIsSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <Input
                      placeholder="e.g. Amit Patil"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="student@example.com / alumni@domain.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                >
                  {authLoading
                    ? "Processing..."
                    : authIsSignUp
                    ? "Create Account"
                    : "Sign In"}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthIsSignUp(!authIsSignUp)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    {authIsSignUp
                      ? "Already have an account? Sign In"
                      : "New here? Create an Account to register as Alumni"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Current Account
                    </div>
                    <div className="text-xs text-slate-500">{currentUser.email}</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-xs text-rose-600 hover:bg-rose-50 h-8"
                  >
                    Sign Out
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={profileForm.full_name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, full_name: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Graduation Batch
                    </label>
                    <select
                      value={profileForm.graduation_year}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          graduation_year: Number(e.target.value),
                        })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                    >
                      {GRAD_YEARS.map((y) => (
                        <option key={y} value={y}>
                          Class of {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company / Organization
                    </label>
                    <Input
                      placeholder="e.g. Qualcomm, Google"
                      value={profileForm.company}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, company: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation / Role
                    </label>
                    <Input
                      placeholder="e.g. Senior Hardware Engineer"
                      value={profileForm.designation}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, designation: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Skills (comma separated)
                  </label>
                  <Input
                    placeholder="e.g. VLSI, FPGA, Python, Embedded C"
                    value={profileForm.skills}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, skills: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={profileForm.linkedin_url}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, linkedin_url: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bio / Summary
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Brief overview of your career journey..."
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>

                {/* Mentorship checkboxes */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-xs font-bold text-slate-700">
                    Community Participation
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.mentorship_available}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          mentorship_available: e.target.checked,
                        })
                      }
                      className="rounded text-primary focus:ring-primary"
                    />
                    Available for 1:1 Student Mentorship
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.career_guidance_available}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          career_guidance_available: e.target.checked,
                        })
                      }
                      className="rounded text-teal-600 focus:ring-teal-600"
                    />
                    Available for Career Guidance & Resume Reviews
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPortalOpen(false)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                  >
                    {savingProfile ? "Saving..." : "Submit Profile for Approval"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
