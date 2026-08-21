import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Mail,
  Linkedin,
  Github,
  Calendar,
} from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  getAllBatchesAdmin,
  saveBatch,
  deleteBatch,
  toggleBatchStatus,
  getAllBatchMembersAdmin,
  saveBatchMember,
  deleteBatchMember,
  toggleBatchMemberStatus,
  type BatchItem,
  type BatchMember,
} from "@/lib/api";
import { uploadTeamImage } from "@/lib/uploadImage";

export default function AdminBatchMembers() {
  const [activeTab, setActiveTab] = useState<"members" | "batches">("members");

  // State for Batches
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchForm, setBatchForm] = useState({
    name: "",
    academic_year: "2024-25",
    display_order: 0,
    is_active: true,
  });

  // State for Members
  const [members, setMembers] = useState<BatchMember[]>([]);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    batch_id: "",
    full_name: "",
    designation: "",
    photo_url: "",
    bio: "",
    email: "",
    linkedin_url: "",
    github_url: "",
    display_order: 0,
    is_active: true,
  });

  // Filter & Search states
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [filterBatchId, setFilterBatchId] = useState("ALL");

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadAllData = async () => {
    try {
      setFetching(true);
      const [batchesData, membersData] = await Promise.all([
        getAllBatchesAdmin(),
        getAllBatchMembersAdmin(),
      ]);
      setBatches(batchesData);
      setMembers(membersData);
      if (batchesData.length > 0 && !memberForm.batch_id) {
        setMemberForm((prev) => ({ ...prev, batch_id: batchesData[0].id }));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load batches or batch members.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  /* ==========================================================
     BATCH ACTIONS
     ========================================================== */

  const resetBatchForm = () => {
    setEditingBatchId(null);
    setBatchForm({
      name: "",
      academic_year: "2024-25",
      display_order: batches.length + 1,
      is_active: true,
    });
  };

  const handleEditBatch = (batch: BatchItem) => {
    setEditingBatchId(batch.id);
    setBatchForm({
      name: batch.name,
      academic_year: batch.academic_year,
      display_order: batch.display_order ?? 0,
      is_active: batch.is_active ?? true,
    });
    setActiveTab("batches");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.name.trim() || !batchForm.academic_year.trim()) {
      setErrorMsg("Batch name and academic year are required.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await saveBatch({
        id: editingBatchId || undefined,
        name: batchForm.name.trim(),
        academic_year: batchForm.academic_year.trim(),
        display_order: Number(batchForm.display_order) || 0,
        is_active: batchForm.is_active,
      });

      setSuccessMsg(
        editingBatchId
          ? "Batch updated successfully."
          : "New batch created successfully."
      );
      resetBatchForm();
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBatch = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await toggleBatchStatus(id, newStatus);
      setBatches((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_active: newStatus } : b))
      );
      setSuccessMsg(`Batch status changed to ${newStatus ? "Active" : "Hidden"}.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to update batch status.");
    }
  };

  const handleDeleteBatch = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete batch "${name}"? All members in this batch will also be deleted!`)) {
      return;
    }
    try {
      await deleteBatch(id);
      setSuccessMsg("Batch deleted successfully.");
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to delete batch.");
    }
  };

  /* ==========================================================
     MEMBER ACTIONS
     ========================================================== */

  const resetMemberForm = () => {
    setEditingMemberId(null);
    setImageFile(null);
    setPreview(null);
    setMemberForm({
      batch_id: batches[0]?.id || "",
      full_name: "",
      designation: "",
      photo_url: "",
      bio: "",
      email: "",
      linkedin_url: "",
      github_url: "",
      display_order: 0,
      is_active: true,
    });
  };

  const handleEditMember = (member: BatchMember) => {
    setEditingMemberId(member.id);
    setMemberForm({
      batch_id: member.batch_id,
      full_name: member.full_name || "",
      designation: member.designation || "",
      photo_url: member.photo_url || "",
      bio: member.bio || "",
      email: member.email || "",
      linkedin_url: member.linkedin_url || "",
      github_url: member.github_url || "",
      display_order: member.display_order ?? 0,
      is_active: member.is_active ?? true,
    });
    setPreview(member.photo_url || null);
    setActiveTab("members");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.full_name.trim() || !memberForm.designation.trim() || !memberForm.batch_id) {
      setErrorMsg("Full name, designation, and batch assignment are required.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      let photoUrl = memberForm.photo_url;
      if (imageFile) {
        photoUrl = await uploadTeamImage(imageFile);
      }

      await saveBatchMember({
        id: editingMemberId || undefined,
        batch_id: memberForm.batch_id,
        full_name: memberForm.full_name.trim(),
        designation: memberForm.designation.trim(),
        photo_url: photoUrl,
        bio: memberForm.bio.trim(),
        email: memberForm.email.trim(),
        linkedin_url: memberForm.linkedin_url.trim(),
        github_url: memberForm.github_url.trim(),
        display_order: Number(memberForm.display_order) || 0,
        is_active: memberForm.is_active,
      });

      setSuccessMsg(
        editingMemberId
          ? "Batch member updated successfully."
          : "Batch member added successfully."
      );
      resetMemberForm();
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save batch member.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMember = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await toggleBatchMemberStatus(id, newStatus);
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_active: newStatus } : m))
      );
      setSuccessMsg(`Member is now ${newStatus ? "Visible (Active)" : "Hidden"}.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to update member status.");
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from this batch?`)) return;
    try {
      await deleteBatchMember(id);
      setSuccessMsg("Batch member deleted successfully.");
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to delete member.");
    }
  };

  // Filtered members for admin table/cards
  const filteredAdminMembers = members.filter((member) => {
    if (filterBatchId !== "ALL" && member.batch_id !== filterBatchId) {
      return false;
    }
    if (adminSearchQuery.trim()) {
      const q = adminSearchQuery.toLowerCase();
      const matchName = member.full_name?.toLowerCase().includes(q);
      const matchRole = member.designation?.toLowerCase().includes(q);
      const matchEmail = member.email?.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TOP BAR / BACK LINK */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-primary font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <span className="text-sm font-semibold px-3.5 py-1 bg-primary/10 text-primary rounded-full">
            Batch & Member Management
          </span>
        </div>

        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-slate-900 to-eesa-teal p-8 md:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-8 h-8 text-eesa-teal" />
                <h1 className="text-3xl font-bold tracking-tight">
                  Batch & Specific Persons Management
                </h1>
              </div>
              <p className="text-white/80 max-w-2xl text-sm md:text-base">
                Create and manage specific academic batches (e.g. Batch 2024-25) and assign dedicated students, representatives, and coordinators with profile photos and details.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <div className="text-2xl font-extrabold text-white">
                  {batches.length}
                </div>
                <div className="text-[11px] text-white/75 font-medium uppercase tracking-wider mt-0.5">
                  Batches
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <div className="text-2xl font-extrabold text-white">
                  {members.length}
                </div>
                <div className="text-[11px] text-white/75 font-medium uppercase tracking-wider mt-0.5">
                  Members
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK MESSAGES */}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium text-sm">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-800 flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="font-medium text-sm">{errorMsg}</span>
          </div>
        )}

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
              activeTab === "members"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Batch Members ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("batches")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
              activeTab === "batches"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Batches ({batches.length})</span>
          </button>
        </div>

        {/* ==========================================================
            TAB 1: BATCH MEMBERS MANAGEMENT
            ========================================================== */}
        {activeTab === "members" && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* ADD / EDIT MEMBER FORM */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
              <div className="border-b px-6 py-5 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {editingMemberId ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                  {editingMemberId ? "Edit Batch Member" : "Add New Person to a Batch"}
                </h2>
                {editingMemberId && (
                  <button
                    type="button"
                    onClick={resetMemberForm}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleMemberSubmit} className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Batch Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Assign to Batch <span className="text-rose-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
                      value={memberForm.batch_id}
                      required
                      onChange={(e) => setMemberForm({ ...memberForm, batch_id: e.target.value })}
                    >
                      <option value="" disabled>Select a Batch</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name} ({batch.academic_year})
                        </option>
                      ))}
                    </select>
                    {batches.length === 0 && (
                      <p className="text-xs text-rose-500 mt-1">
                        No batches found. Please switch to the "Manage Batches" tab to create one first.
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="e.g. John Doe"
                      value={memberForm.full_name}
                      required
                      onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                    />
                  </div>

                  {/* Designation / Role */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Designation / Role in Batch <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="e.g. Batch Representative / Coordinator / Tech Lead"
                      value={memberForm.designation}
                      required
                      onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })}
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Display Order (Lower numbers appear first)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="0"
                      value={memberForm.display_order}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, display_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="student@eesa-prmitr.edu.in"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      LinkedIn Profile URL (Optional)
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="https://linkedin.com/in/username"
                      value={memberForm.linkedin_url}
                      onChange={(e) => setMemberForm({ ...memberForm, linkedin_url: e.target.value })}
                    />
                  </div>

                  {/* GitHub */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      GitHub Profile URL (Optional)
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="https://github.com/username"
                      value={memberForm.github_url}
                      onChange={(e) => setMemberForm({ ...memberForm, github_url: e.target.value })}
                    />
                  </div>

                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Profile Photo
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition shadow-sm">
                        <UploadCloud className="w-4 h-4 text-primary" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              setPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                      {preview && (
                        <div className="flex items-center gap-3">
                          <OptimizedImage
                            src={preview}
                            alt="Preview"
                            variant="profile"
                            containerClassName="w-12 h-12 rounded-full border-2 border-primary shadow-sm"
                          />
                          <span className="text-xs text-slate-500">Image selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Short Bio / Role Description
                    </label>
                    <textarea
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-h-[80px]"
                      placeholder="Brief note on duties or interests..."
                      value={memberForm.bio}
                      onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="md:col-span-2 flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="memberActiveToggle"
                      checked={memberForm.is_active}
                      onChange={(e) => setMemberForm({ ...memberForm, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="memberActiveToggle" className="text-sm font-semibold text-slate-800 cursor-pointer">
                      Visible on Public Website (Active)
                    </label>
                  </div>

                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading || batches.length === 0}
                    className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                  >
                    {loading
                      ? "Saving Member..."
                      : editingMemberId
                      ? "Update Batch Member"
                      : "Add Person to Batch"}
                  </button>

                  {editingMemberId && (
                    <button
                      type="button"
                      onClick={resetMemberForm}
                      className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* MEMBERS LIST & FILTER SECTION */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Batch Members ({filteredAdminMembers.length})
                </h2>

                {/* Filter by Batch & Search */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    value={filterBatchId}
                    onChange={(e) => setFilterBatchId(e.target.value)}
                  >
                    <option value="ALL">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search member..."
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className="pl-9 pr-7 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {adminSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setAdminSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {fetching ? (
                <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm">Loading members...</p>
                </div>
              ) : filteredAdminMembers.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-800 mb-1">No Members Found</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    {adminSearchQuery || filterBatchId !== "ALL"
                      ? "Try changing your search query or batch filter."
                      : "Use the form above to add your first member to a batch."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAdminMembers.map((member) => {
                    const batchName =
                      member.batches?.name ||
                      batches.find((b) => b.id === member.batch_id)?.name ||
                      "Batch";

                    return (
                      <div
                        key={member.id}
                        className={`group relative rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                          member.is_active
                            ? "border-slate-200"
                            : "border-amber-200 bg-amber-50/20 opacity-90"
                        }`}
                      >
                        {/* TOP ACCENT STRIP */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl ${
                            member.is_active
                              ? "bg-gradient-to-r from-primary to-eesa-teal"
                              : "bg-amber-400"
                          }`}
                        />

                        <div>
                          {/* BADGES */}
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                                member.is_active
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  member.is_active ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              {member.is_active ? "Active (Public)" : "Hidden"}
                            </span>

                            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                              {batchName}
                            </span>
                          </div>

                          {/* PHOTO & NAME */}
                          <div className="flex items-center gap-4 mb-3">
                            <OptimizedImage
                              src={member.photo_url}
                              alt={member.full_name}
                              variant="profile"
                              fallbackText={member.full_name}
                              containerClassName="w-14 h-14 rounded-2xl border-2 border-primary/20 shadow-sm shrink-0"
                            />

                            <div className="overflow-hidden">
                              <h3 className="font-bold text-slate-900 text-base truncate">
                                {member.full_name}
                              </h3>
                              <p className="text-xs font-semibold text-primary truncate mt-0.5">
                                {member.designation}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Order: #{member.display_order}
                              </p>
                            </div>
                          </div>

                          {/* BIO PREVIEW */}
                          {member.bio && (
                            <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {member.bio}
                            </p>
                          )}

                          {/* SOCIAL ICONS */}
                          <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                            {member.email && (
                              <span title={`Email: ${member.email}`}>
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                              </span>
                            )}
                            {member.linkedin_url && <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />}
                            {member.github_url && <Github className="w-3.5 h-3.5 text-slate-800" />}
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleMember(member.id, member.is_active)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                              member.is_active
                                ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                            }`}
                          >
                            {member.is_active ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Show</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditMember(member)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member.id, member.full_name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100 transition"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================================
            TAB 2: BATCHES MANAGEMENT
            ========================================================== */}
        {activeTab === "batches" && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* ADD / EDIT BATCH FORM */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
              <div className="border-b px-6 py-5 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {editingBatchId ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                  {editingBatchId ? "Edit Batch" : "Create New Batch"}
                </h2>
                {editingBatchId && (
                  <button
                    type="button"
                    onClick={resetBatchForm}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleBatchSubmit} className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Batch Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Batch Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="e.g. Batch 2024-25"
                      value={batchForm.name}
                      required
                      onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                    />
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Academic Year <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="e.g. 2024-25"
                      value={batchForm.academic_year}
                      required
                      onChange={(e) => setBatchForm({ ...batchForm, academic_year: e.target.value })}
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Display Order (1 = Top)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      placeholder="1"
                      value={batchForm.display_order}
                      onChange={(e) =>
                        setBatchForm({ ...batchForm, display_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  {/* Active Status */}
                  <div className="md:col-span-3 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="batchActiveToggle"
                      checked={batchForm.is_active}
                      onChange={(e) => setBatchForm({ ...batchForm, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="batchActiveToggle" className="text-sm font-semibold text-slate-800 cursor-pointer">
                      Active Batch (Visible in filter tabs on public website)
                    </label>
                  </div>

                </div>

                {/* BUTTONS */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingBatchId
                      ? "Update Batch"
                      : "Create Batch"}
                  </button>

                  {editingBatchId && (
                    <button
                      type="button"
                      onClick={resetBatchForm}
                      className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* BATCHES LIST */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                All Batches ({batches.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {batches.map((batch) => {
                  const memberCount = members.filter((m) => m.batch_id === batch.id).length;

                  return (
                    <div
                      key={batch.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              batch.is_active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                batch.is_active ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            {batch.is_active ? "Active" : "Hidden"}
                          </span>

                          <span className="text-xs text-slate-500">
                            Order: #{batch.display_order}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                          {batch.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Academic Year: <span className="font-semibold text-slate-700">{batch.academic_year}</span>
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span>Assigned Members:</span>
                          <span className="font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded-full">
                            {memberCount}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleBatch(batch.id, batch.is_active)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold transition"
                        >
                          {batch.is_active ? "Hide" : "Activate"}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditBatch(batch)}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBatch(batch.id, batch.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
