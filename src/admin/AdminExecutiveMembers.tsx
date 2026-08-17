import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getAllExecutiveMembersAdmin,
  getAllForums,
  saveExecutiveMember,
  deleteExecutiveMember,
  toggleExecutiveMemberStatus,
  type ExecutiveMember,
  type ForumItem,
} from "@/lib/api";
import { uploadTeamImage } from "@/lib/uploadImage";

export default function AdminExecutiveMembers() {
  const [members, setMembers] = useState<ExecutiveMember[]>([]);
  const [forums, setForums] = useState<ForumItem[]>([]);
  const [selectedForumIds, setSelectedForumIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    designation: "",
    bio: "",
    photo_url: "",
    display_order: 0,
    academic_year: "2024-25",
    is_active: true,
  });

  // Load members and forums
  const loadData = async () => {
    try {
      setFetching(true);
      const [membersData, forumsData] = await Promise.all([
        getAllExecutiveMembersAdmin(),
        getAllForums(),
      ]);
      setMembers(membersData);
      setForums(forumsData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load executive members or forums.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setImageFile(null);
    setPreview(null);
    setSelectedForumIds([]);
    setForm({
      full_name: "",
      designation: "",
      bio: "",
      photo_url: "",
      display_order: 0,
      academic_year: "2024-25",
      is_active: true,
    });
  };

  const handleForumToggle = (forumId: string) => {
    setSelectedForumIds((prev) =>
      prev.includes(forumId)
        ? prev.filter((id) => id !== forumId)
        : [...prev, forumId]
    );
  };

  const handleEdit = (member: ExecutiveMember) => {
    setEditingId(member.id);
    setForm({
      full_name: member.full_name || "",
      designation: member.designation || "",
      bio: member.bio || "",
      photo_url: member.photo_url || "",
      display_order: member.display_order ?? 0,
      academic_year: member.academic_year || "2024-25",
      is_active: member.is_active ?? true,
    });
    setPreview(member.photo_url || null);

    // Extract assigned forum IDs
    const assignedIds: string[] = [];
    if (member.executive_member_forums) {
      member.executive_member_forums.forEach((emf) => {
        if (emf.forum_id) assignedIds.push(emf.forum_id);
      });
    }
    setSelectedForumIds(assignedIds);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.designation.trim()) {
      setErrorMsg("Full name and designation are required.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      let photoUrl = form.photo_url;
      if (imageFile) {
        photoUrl = await uploadTeamImage(imageFile);
      }

      await saveExecutiveMember(
        {
          id: editingId || undefined,
          full_name: form.full_name.trim(),
          designation: form.designation.trim(),
          bio: form.bio.trim(),
          photo_url: photoUrl,
          display_order: Number(form.display_order) || 0,
          academic_year: form.academic_year || "2024-25",
          is_active: form.is_active,
        },
        selectedForumIds
      );

      setSuccessMsg(
        editingId
          ? "Executive member updated successfully."
          : "Executive member added successfully."
      );
      resetForm();
      await loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save executive member.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await toggleExecutiveMemberStatus(id, newStatus);
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_active: newStatus } : m))
      );
      setSuccessMsg(
        `Member is now ${newStatus ? "visible publicly (Active)" : "hidden from public view"}.`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to update member status.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteExecutiveMember(id);
      setSuccessMsg("Executive member deleted successfully.");
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to delete executive member.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* TOP BAR / BACK LINK */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-primary font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <span className="text-sm font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">
            Admin Module
          </span>
        </div>

        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-slate-900 to-eesa-teal p-8 md:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-eesa-teal" />
                <h1 className="text-3xl font-bold tracking-tight">
                  Executive Members Management
                </h1>
              </div>
              <p className="text-white/80 max-w-2xl text-sm md:text-base">
                Manage EESA executive committee members, assign multiple forums,
                toggle visibility, and reorder display positions.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[140px]">
              <div className="text-3xl font-extrabold text-white">
                {members.length}
              </div>
              <div className="text-xs text-white/75 font-medium uppercase tracking-wider mt-1">
                Total Members
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

        {/* ADD / EDIT FORM */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <div className="border-b px-6 py-5 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {editingId ? <Edit2 className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-primary" />}
              {editingId ? "Edit Executive Member" : "Add New Executive Member"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="e.g. Swapnil Datir"
                  value={form.full_name}
                  required
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="e.g. EESA Coordinator / President / Chairman"
                  value={form.designation}
                  required
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
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
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="2024-25"
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                />
              </div>

              {/* Profile Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Profile Photo
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition shadow-sm">
                    <UploadCloud className="w-4 h-4 text-primary" />
                    <span>Upload Image</span>
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
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-sm"
                      />
                      <span className="text-xs text-slate-500">Image selected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* MULTI-SELECT FORUMS (REQUIREMENT 3 & 5) */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div>
                  <label className="block text-sm font-bold text-slate-900">
                    Assign Forums (Multiple Selection Supported)
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select all forums this executive member belongs to (e.g. Core Electronics, IT Forum, Career Development, Social Media).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {forums.map((forum) => {
                    const isChecked = selectedForumIds.includes(forum.id);
                    return (
                      <button
                        key={forum.id}
                        type="button"
                        onClick={() => handleForumToggle(forum.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-medium transition ${
                          isChecked
                            ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="truncate">{forum.name}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedForumIds.length > 0 && (
                  <div className="pt-2 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>{selectedForumIds.length} forum(s) currently selected</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Short Bio / Description
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-h-[90px]"
                  placeholder="Optional brief description of member roles and responsibilities..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              {/* Active Status Checkbox */}
              <div className="md:col-span-2 flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-semibold text-slate-800 cursor-pointer">
                  Publicly Active (Visible on the public EESA website)
                </label>
              </div>

            </div>

            {/* FORM BUTTONS */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
              >
                {loading
                  ? "Saving Member..."
                  : editingId
                  ? "Update Executive Member"
                  : "Add Executive Member"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* MEMBERS LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Executive Members List ({members.length})
            </h2>
            <div className="text-xs text-slate-500">
              Active members are shown on the public website
            </div>
          </div>

          {fetching ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading executive members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">No Executive Members Added</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Use the form above to add your first executive member and assign them to one or more forums.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => {
                const assignedForums =
                  member.executive_member_forums?.map((emf) => {
                    const forumObj = Array.isArray(emf.forums) ? emf.forums[0] : emf.forums;
                    if (forumObj?.name) return forumObj.name;
                    const match = forums.find((f) => f.id === emf.forum_id);
                    return match ? match.name : "Assigned Forum";
                  }) || [];

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
                      {/* HEADER: STATUS BADGE + ORDER */}
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

                        <span className="text-xs text-slate-500 font-medium">
                          Order: #{member.display_order}
                        </span>
                      </div>

                      {/* PHOTO & NAME */}
                      <div className="flex items-center gap-4 mb-4">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.full_name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                            {member.full_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="overflow-hidden">
                          <h3 className="font-bold text-slate-900 text-base truncate">
                            {member.full_name}
                          </h3>
                          <p className="text-xs font-semibold text-primary truncate mt-0.5">
                            {member.designation}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {member.academic_year || "2024-25"}
                          </p>
                        </div>
                      </div>

                      {/* FORUMS BADGES */}
                      <div className="mb-4 space-y-1.5">
                        <div className="text-xs font-semibold text-slate-600">
                          Assigned Forums ({assignedForums.length}):
                        </div>
                        {assignedForums.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No forums assigned</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedForums.map((fName, i) => (
                              <span
                                key={i}
                                className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {fName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* BIO PREVIEW */}
                      {member.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      {/* TOGGLE VISIBILITY */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member.id, member.is_active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                          member.is_active
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                        }`}
                        title={member.is_active ? "Hide from public view" : "Make visible publicly"}
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
                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() => handleEdit(member)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id, member.full_name)}
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
    </div>
  );
}
