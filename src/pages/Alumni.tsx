import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Building2,
  Cpu,
  Layers,
  RotateCcw,
  BookOpen,
  Award,
  HeartHandshake,
  Mail,
  Lock,
  LogOut,
  Upload,
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

// Graduation batch range (e.g., 2010 to 2026)
const GRAD_YEARS = Array.from({ length: 17 }, (_, i) => 2026 - i);

export default function Alumni() {
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [filterMentorship, setFilterMentorship] = useState(false);
  const [filterCareer, setFilterCareer] = useState(false);
  const [filterInternship, setFilterInternship] = useState(false);
  const [filterJobReferral, setFilterJobReferral] = useState(false);

  // Modals & Selected Profile
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Connect Request Modal
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [targetAlumni, setTargetAlumni] = useState<AlumniProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // User Auth & Portal State
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

  // Requests Tracking
  const [mySentRequests, setMySentRequests] = useState<AlumniConnectionRequest[]>([]);
  const [myReceivedRequests, setMyReceivedRequests] = useState<AlumniConnectionRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Load public approved directory
  const loadDirectory = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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

  // Check current session
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      setLoadingRequests(true);
      const [profile, sent] = await Promise.all([
        getMyAlumniProfile(userId),
        getMySentRequests(userId),
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

        // Load received requests
        const received = await getMyReceivedRequests(profile.id);
        setMyReceivedRequests(received);
      }
      setMySentRequests(sent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Quick Auth
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

  // Submit Alumni Registration / Profile Update
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
        status: "pending", // Always pending for review upon creation/update
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
      toast.info("Please sign in or create an account to connect with alumni.");
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

      toast.success(
        `Connection request sent to ${targetAlumni.full_name}! They will receive your note.`
      );
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

  // Respond to request
  const handleRequestResponse = async (
    reqId: string,
    status: "accepted" | "rejected" | "cancelled"
  ) => {
    try {
      await updateConnectionRequestStatus(reqId, status);
      toast.success(`Request marked as ${status}`);
      if (currentUser) {
        loadUserData(currentUser.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update request");
    }
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-slate-50 to-slate-50 py-16 md:py-24 border-b border-slate-200">
          <div className="eesa-container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide border border-primary/20 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                PRMIT&R Department of Electronics Engineering
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                EESA{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-600 to-teal-500">
                  Alumni Connect
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Bridge the gap between campus and industry. Discover esteemed PRMIT&R
                electronics alumni across global tech, semiconductor, and core sectors.
                Reach out for mentorship, career advice, and referrals.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => setPortalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  {myProfile ? "My Alumni / Portal" : "Join as Alumni / Student Portal"}
                </Button>

                {currentUser && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPortalOpen(true)}
                    className="bg-white hover:bg-slate-100 text-slate-800 font-semibold px-6 py-3 rounded-xl border-slate-300 shadow-sm"
                  >
                    <HeartHandshake className="w-5 h-5 mr-2 text-primary" />
                    My Connections ({mySentRequests.length + myReceivedRequests.length})
                  </Button>
                )}
              </div>

              {/* COMMUNITY STATS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto">
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {alumniList.length}+
                  </div>
                  <div className="text-xs md:text-sm text-slate-600 font-medium">
                    Approved Alumni
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-teal-600">
                    100%
                  </div>
                  <div className="text-xs md:text-sm text-slate-600 font-medium">
                    Admin Verified
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-indigo-600">
                    25+
                  </div>
                  <div className="text-xs md:text-sm text-slate-600 font-medium">
                    Top Companies
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                    1:1
                  </div>
                  <div className="text-xs md:text-sm text-slate-600 font-medium">
                    Mentorship Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DIRECTORY FILTERS & LIST */}
        <section className="eesa-container py-12">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-10 space-y-6">
            {/* Top Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search alumni by name, company, designation, skills (e.g. VLSI, Python, Embedded), location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 h-12 text-base rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
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

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Graduation Batch */}
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
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Batches</option>
                  {GRAD_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      Class of {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Industry / Domain
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
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

            {/* Availability Filter Chips */}
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
                  <GraduationCap className="w-3.5 h-3.5" />
                  Mentorship
                </button>

                <button
                  onClick={() => setFilterCareer(!filterCareer)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    filterCareer
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Career Guidance
                </button>

                <button
                  onClick={() => setFilterInternship(!filterInternship)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    filterInternship
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Internship Support
                </button>

                <button
                  onClick={() => setFilterJobReferral(!filterJobReferral)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    filterJobReferral
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Job Referrals
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Verified Alumni Directory
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {alumniList.length} Available
              </span>
            </h2>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm">Loading alumni directory...</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && alumniList.length === 0 && (
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
                  : "Be the first proud PRMIT&R electronics alumnus to register on the platform!"}
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() => setPortalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Register Profile Now
                </Button>
              )}
            </div>
          )}

          {/* ALUMNI CARDS GRID */}
          {!loading && alumniList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumniList.map((alumni) => (
                <div
                  key={alumni.id}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Top Accent */}
                  <div className="h-2 bg-gradient-to-r from-primary to-teal-500" />

                  <div className="p-6 space-y-5 flex-1">
                    {/* Header: Photo & Identity */}
                    <div className="flex items-start gap-4">
                      {alumni.profile_photo_url ? (
                        <img
                          src={alumni.profile_photo_url}
                          alt={alumni.full_name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 text-primary font-bold text-xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
                          {alumni.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                      )}

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
                            Batch of {alumni.graduation_year}{" "}
                            {alumni.academic_year && `(${alumni.academic_year})`}
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
                        {alumni.location && (
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{alumni.location}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bio preview */}
                    {alumni.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {alumni.bio}
                      </p>
                    )}

                    {/* Skills pills */}
                    {alumni.skills && alumni.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {alumni.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {alumni.skills.length > 4 && (
                          <span className="text-[11px] font-semibold text-slate-400 px-1.5 py-0.5">
                            +{alumni.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Support Offering Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {alumni.mentorship_available && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20"
                        >
                          ✓ Mentorship
                        </Badge>
                      )}
                      {alumni.career_guidance_available && (
                        <Badge
                          variant="secondary"
                          className="bg-teal-50 text-teal-700 text-[10px] font-semibold hover:bg-teal-100"
                        >
                          ✓ Guidance
                        </Badge>
                      )}
                      {alumni.internship_support && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-50 text-amber-700 text-[10px] font-semibold hover:bg-amber-100"
                        >
                          ✓ Internships
                        </Badge>
                      )}
                      {alumni.job_referral_support && (
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold hover:bg-indigo-100"
                        >
                          ✓ Referrals
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setSelectedAlumni(alumni);
                        setDetailModalOpen(true);
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                    >
                      View Profile <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {alumni.linkedin_url && (
                        <a
                          href={alumni.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/40 transition shadow-sm"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}

                      <Button
                        size="sm"
                        onClick={() => {
                          setTargetAlumni(alumni);
                          setConnectModalOpen(true);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* DETAIL MODAL */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 overflow-hidden border">
          {selectedAlumni && (
            <div>
              {/* Modal Banner */}
              <div className="bg-gradient-to-r from-primary via-cyan-600 to-teal-500 p-6 text-white relative">
                <div className="flex items-center gap-4">
                  {selectedAlumni.profile_photo_url ? (
                    <img
                      src={selectedAlumni.profile_photo_url}
                      alt={selectedAlumni.full_name}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white/40 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur font-bold text-2xl flex items-center justify-center border-4 border-white/40 shadow-lg text-white">
                      {selectedAlumni.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{selectedAlumni.full_name}</h2>
                      <ShieldCheck className="w-5 h-5 text-white/90" />
                    </div>
                    <p className="text-white/80 text-sm font-medium">
                      {selectedAlumni.designation}{" "}
                      {selectedAlumni.company && `@ ${selectedAlumni.company}`}
                    </p>
                    <p className="text-xs text-white/70">
                      PRMIT&R Class of {selectedAlumni.graduation_year} •{" "}
                      {selectedAlumni.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Industry</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {selectedAlumni.industry || "Technology"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Location</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {selectedAlumni.location || "India"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Academic Year</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {selectedAlumni.academic_year || "PRMIT&R"}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedAlumni.bio && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      About & Journey
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-100">
                      {selectedAlumni.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Expertise & Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlumni.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support Offered */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Mentorship & Support Available
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                        selectedAlumni.mentorship_available
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-slate-50 border-slate-100 text-slate-400 line-through"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" /> 1-on-1 Mentorship
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                        selectedAlumni.career_guidance_available
                          ? "bg-teal-50 border-teal-200 text-teal-700"
                          : "bg-slate-50 border-slate-100 text-slate-400 line-through"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" /> Career Guidance
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                        selectedAlumni.internship_support
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-slate-50 border-slate-100 text-slate-400 line-through"
                      }`}
                    >
                      <Award className="w-4 h-4" /> Internship Support
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                        selectedAlumni.job_referral_support
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-slate-50 border-slate-100 text-slate-400 line-through"
                      }`}
                    >
                      <Layers className="w-4 h-4" /> Job Referrals
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                {selectedAlumni.linkedin_url ? (
                  <a
                    href={selectedAlumni.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <Linkedin className="w-4 h-4" /> View LinkedIn Profile
                  </a>
                ) : (
                  <div />
                )}

                <Button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setTargetAlumni(selectedAlumni);
                    setConnectModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  <Send className="w-4 h-4 mr-2" /> Request Connection
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONNECT REQUEST MODAL */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6 border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Connect with {targetAlumni?.full_name}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Send a personalized note introducing yourself, your branch/year, and what
              guidance or support you are seeking.
            </DialogDescription>
          </DialogHeader>

          {!currentUser ? (
            <div className="py-6 text-center space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm">
                Please sign in with your student account to send connection requests to
                alumni.
              </div>
              <Button
                onClick={() => {
                  setConnectModalOpen(false);
                  setPortalOpen(true);
                }}
                className="w-full bg-primary text-white font-semibold"
              >
                Sign In / Sign Up
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center">
                  {targetAlumni?.full_name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {targetAlumni?.full_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {targetAlumni?.designation} @ {targetAlumni?.company}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Personal Note / Message
                </label>
                <Textarea
                  rows={4}
                  placeholder="Hi! I am a 3rd year EXTC student at PRMIT&R interested in VLSI/Embedded systems. I would love some advice on project topics and industry preparation..."
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-primary text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Keep your message professional, concise, and respectful.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setConnectModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={sendingRequest || !connectMessage.trim()}
                  onClick={handleSendConnection}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  {sendingRequest ? "Sending Request..." : "Send Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ALUMNI / STUDENT PORTAL DIALOG */}
      <Dialog open={portalOpen} onOpenChange={setPortalOpen}>
        <DialogContent className="max-w-3xl bg-white rounded-2xl p-0 overflow-hidden border shadow-2xl">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">EESA Alumni & Student Portal</h3>
                <p className="text-xs text-slate-400">
                  Manage your alumni registration, approvals, and connection requests
                </p>
              </div>
            </div>

            {currentUser && (
              <button
                onClick={handleSignOut}
                className="text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            )}
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {!currentUser ? (
              /* AUTH FORM */
              <div className="max-w-md mx-auto space-y-6 py-4">
                <div className="text-center space-y-1">
                  <h4 className="text-lg font-bold text-slate-900">
                    {authIsSignUp ? "Create Your Account" : "Sign In to EESA Portal"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Students & Alumni can sign in to request connections or manage
                    profiles.
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authIsSignUp && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        className="rounded-lg"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg"
                  >
                    {authLoading
                      ? "Please wait..."
                      : authIsSignUp
                      ? "Create Account"
                      : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAuthIsSignUp(!authIsSignUp)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      {authIsSignUp
                        ? "Already have an account? Sign in here"
                        : "Don't have an account? Sign up here"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* LOGGED IN PORTAL TABS */
              <Tabs defaultValue={myProfile ? "profile" : "register"} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="profile" className="rounded-lg text-xs font-semibold">
                    Alumni Profile
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="rounded-lg text-xs font-semibold">
                    My Sent Requests ({mySentRequests.length})
                  </TabsTrigger>
                  <TabsTrigger value="received" className="rounded-lg text-xs font-semibold">
                    Received Requests ({myReceivedRequests.length})
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: ALUMNI PROFILE MANAGEMENT */}
                <TabsContent value="profile" className="space-y-6">
                  {/* Status Banner */}
                  {myProfile ? (
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        myProfile.status === "approved"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : myProfile.status === "rejected"
                          ? "bg-rose-50 border-rose-200 text-rose-900"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {myProfile.status === "approved" && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                        {myProfile.status === "pending" && (
                          <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                        )}
                        {myProfile.status === "rejected" && (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}

                        <div>
                          <div className="font-bold text-sm capitalize">
                            Status: {myProfile.status}
                          </div>
                          <div className="text-xs opacity-80">
                            {myProfile.status === "approved"
                              ? "Your profile is active and publicly visible in the Alumni Directory."
                              : myProfile.status === "rejected"
                              ? "Your profile was rejected by admin. You can update your details below and request approval again."
                              : "Your profile is undergoing admin verification before becoming publicly visible."}
                          </div>
                        </div>
                      </div>

                      <Badge
                        className={`capitalize font-bold text-xs ${
                          myProfile.status === "approved"
                            ? "bg-emerald-600 text-white"
                            : myProfile.status === "rejected"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {myProfile.status}
                      </Badge>
                    </div>
                  ) : (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-slate-800 text-sm">
                      ✨ <strong>Welcome!</strong> Are you a PRMIT&R alumnus? Fill out
                      the form below to register your profile. An administrator will
                      verify it for public listing.
                    </div>
                  )}

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <Input
                          required
                          value={profileForm.full_name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, full_name: e.target.value })
                          }
                          placeholder="e.g. Swara Kulkarni"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Graduation Year (Batch) *
                        </label>
                        <select
                          value={profileForm.graduation_year}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              graduation_year: Number(e.target.value),
                            })
                          }
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
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
                          value={profileForm.academic_year}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              academic_year: e.target.value,
                            })
                          }
                          placeholder="e.g. 2023-24"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Department
                        </label>
                        <select
                          value={profileForm.department}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              department: e.target.value,
                            })
                          }
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
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
                          Current Company / Organization
                        </label>
                        <Input
                          value={profileForm.company}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, company: e.target.value })
                          }
                          placeholder="e.g. Qualcomm / Intel / Microsoft"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Job Title / Designation
                        </label>
                        <Input
                          value={profileForm.designation}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              designation: e.target.value,
                            })
                          }
                          placeholder="e.g. Senior Silicon Engineer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Industry / Domain
                        </label>
                        <select
                          value={profileForm.industry}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              industry: e.target.value,
                            })
                          }
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
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
                          Current Location / City
                        </label>
                        <Input
                          value={profileForm.location}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, location: e.target.value })
                          }
                          placeholder="e.g. Pune, Maharashtra / San Jose, USA"
                        />
                      </div>
                    </div>

                    {/* LinkedIn URL */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        LinkedIn Profile URL
                      </label>
                      <Input
                        value={profileForm.linkedin_url}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            linkedin_url: e.target.value,
                          })
                        }
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Profile Photo
                      </label>
                      <div className="flex items-center gap-4">
                        {photoPreview && (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-14 h-14 rounded-xl object-cover border"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPhotoFile(file);
                              setPhotoPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Skills & Technologies (comma separated)
                      </label>
                      <Input
                        value={profileForm.skills}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, skills: e.target.value })
                        }
                        placeholder="e.g. Verilog, Embedded C, Python, FPGA, ROS, IoT"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Professional Bio / Journey
                      </label>
                      <Textarea
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, bio: e.target.value })
                        }
                        placeholder="Brief overview of your experience, current projects, and how you would like to help students..."
                      />
                    </div>

                    {/* Support Availability Checkboxes */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        I am willing to support PRMIT&R students with:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                        <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-slate-50 cursor-pointer">
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
                          1-on-1 Mentorship
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileForm.career_guidance_available}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                career_guidance_available: e.target.checked,
                              })
                            }
                            className="rounded text-primary focus:ring-primary"
                          />
                          Career Guidance & Reviews
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileForm.internship_support}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                internship_support: e.target.checked,
                              })
                            }
                            className="rounded text-primary focus:ring-primary"
                          />
                          Internship Opportunities
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileForm.job_referral_support}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                job_referral_support: e.target.checked,
                              })
                            }
                            className="rounded text-primary focus:ring-primary"
                          />
                          Job Referrals
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-xl shadow-sm mt-4"
                    >
                      {savingProfile
                        ? "Saving & Submitting for Approval..."
                        : myProfile
                        ? "Update & Request Approval"
                        : "Submit Alumni Profile for Approval"}
                    </Button>
                  </form>
                </TabsContent>

                {/* TAB 2: SENT REQUESTS */}
                <TabsContent value="sent" className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Connection requests you have sent to alumni.
                  </div>

                  {mySentRequests.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      You haven't sent any connection requests yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mySentRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-slate-900">
                              {req.alumni_profiles?.full_name || "Alumni Member"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {req.alumni_profiles?.designation} @{" "}
                              {req.alumni_profiles?.company}
                            </div>
                            {req.message && (
                              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border mt-1.5">
                                "{req.message}"
                              </p>
                            )}
                            <div className="text-[10px] text-slate-400">
                              Sent on {new Date(req.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              className={`capitalize font-bold text-xs ${
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
                                onClick={() =>
                                  handleRequestResponse(req.id, "cancelled")
                                }
                                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 3: RECEIVED REQUESTS */}
                <TabsContent value="received" className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Connection requests sent to your alumni profile by students.
                  </div>

                  {myReceivedRequests.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      No incoming connection requests yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myReceivedRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                {req.student_name || "PRMIT&R Student"}
                              </div>
                              {req.student_email && (
                                <div className="text-xs text-slate-500">
                                  {req.student_email}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Requested on{" "}
                                {new Date(req.created_at).toLocaleDateString()}
                              </div>
                            </div>

                            <Badge
                              className={`capitalize font-bold text-xs ${
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

                          {req.message && (
                            <div className="bg-white p-3 rounded-lg border text-xs text-slate-700 leading-relaxed">
                              "{req.message}"
                            </div>
                          )}

                          {req.status === "pending" && (
                            <div className="flex items-center justify-end gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRequestResponse(req.id, "rejected")
                                }
                                className="text-xs text-rose-600 hover:bg-rose-50"
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleRequestResponse(req.id, "accepted")
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                Accept & Connect
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
