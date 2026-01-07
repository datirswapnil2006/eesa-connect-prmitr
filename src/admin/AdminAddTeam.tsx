import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { uploadTeamImage } from "@/lib/uploadImage";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  position: string;
  bio: string;
  image_url: string;
};

export default function AdminAddTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    role: "faculty",
    position: "",
    bio: "",
    image_url: "",
  });

  const fetchTeam = async () => {
    const { data } = await supabase.from("about_team").select("*");
    if (data) setTeam(data);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setImageFile(null);
    setPreview(null);
    setForm({
      name: "",
      role: "faculty",
      position: "",
      bio: "",
      image_url: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      let imageUrl = form.image_url;
      if (imageFile) imageUrl = await uploadTeamImage(imageFile);

      if (editingId) {
        await supabase
          .from("about_team")
          .update({ ...form, image_url: imageUrl })
          .eq("id", editingId);

        setSuccess("Team member updated successfully.");
      } else {
        await supabase.from("about_team").insert([
          { ...form, image_url: imageUrl },
        ]);

        setSuccess("Team member added successfully.");
      }

      resetForm();
      fetchTeam();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (person: TeamMember) => {
    setEditingId(person.id);
    setForm(person);
    setPreview(person.image_url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    await supabase.from("about_team").delete().eq("id", id);
    fetchTeam();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-eesa-teal p-10 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative">
          <h1 className="text-3xl font-bold">
            Team Management
          </h1>
          <p className="text-white/90 mt-2">
            Add, edit and manage faculty & team members
          </p>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="rounded-xl border border-green-300 bg-green-100 px-5 py-3 text-green-800 font-medium">
          {success}
        </div>
      )}

      {/* FORM */}
      <div className="relative rounded-3xl border bg-gradient-to-br from-white to-primary/5 shadow-lg">
        <div className="border-b px-8 py-6 bg-primary/5 rounded-t-3xl">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Team Member" : "Add New Team Member"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8"
        >
          <div>
            <label className="label">Full Name</label>
            <input
              className="input focus:ring-primary"
              value={form.name}
              required
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Role</label>
            <select
              className="input focus:ring-primary"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="faculty">Faculty</option>
              <option value="member">Member</option>
            </select>
          </div>

          <div>
            <label className="label">Position</label>
            <input
              className="input focus:ring-primary"
              value={form.position}
              required
              onChange={(e) =>
                setForm({ ...form, position: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          {preview && (
            <div className="md:col-span-2 flex items-center gap-4">
              <img
                src={preview}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary"
              />
              <span className="text-sm text-slate-500">
                Image preview
              </span>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="label">Short Bio</label>
            <textarea
              className="input min-h-[100px] focus:ring-primary"
              value={form.bio}
              onChange={(e) =>
                setForm({ ...form, bio: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8"
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Member"
                  : "Add Member"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TEAM LIST */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-slate-900">
          Current Team Members
        </h2>

        {team.length === 0 ? (
          <p className="text-slate-500">
            No team members added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => handleEdit(person)}
                className="group relative w-full text-left rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {/* Accent Top Bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-eesa-teal rounded-t-3xl" />

                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={person.image_url}
                    alt={person.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                  />

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {person.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {person.position}
                    </p>
                  </div>
                </div>

                {/* Role Badge */}
                <span
                  className={`inline-block mb-4 text-xs px-3 py-1 rounded-full font-medium ${person.role === "faculty"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-emerald-100 text-emerald-700"
                    }`}
                >
                  {person.role}
                </span>

                {/* Actions */}
                <div
                  className="flex gap-4 text-sm"
                  onClick={(e) => e.stopPropagation()} // prevent card click
                >
                  <button
                    onClick={() => handleEdit(person)}
                    className="text-primary font-medium hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(person.id)}
                    className="text-rose-600 font-medium hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
