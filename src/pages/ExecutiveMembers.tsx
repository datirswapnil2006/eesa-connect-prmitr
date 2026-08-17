import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import {
  Users,
  Sparkles,
  Layers,
  Search,
} from "lucide-react";
import {
  getActiveExecutiveMembers,
  getAllForums,
  type ExecutiveMember,
  type ForumItem,
} from "@/lib/api";

export default function ExecutiveMembers() {
  const [members, setMembers] = useState<ExecutiveMember[]>([]);
  const [forums, setForums] = useState<ForumItem[]>([]);
  const [selectedForumId, setSelectedForumId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [membersData, forumsData] = await Promise.all([
          getActiveExecutiveMembers(),
          getAllForums(),
        ]);
        setMembers(membersData);
        setForums(forumsData);
      } catch (err) {
        console.error("Error loading executive members:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter members by selected forum and search query
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.full_name?.toLowerCase().includes(q);
        const matchesDesignation = member.designation?.toLowerCase().includes(q);
        const matchesBio = member.bio?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesignation && !matchesBio) {
          return false;
        }
      }

      // 2. Forum Filter
      if (selectedForumId === "ALL") {
        return true;
      }

      // Check if member is assigned to selectedForumId
      const assignedForums = member.executive_member_forums || [];
      return assignedForums.some((emf) => {
        if (emf.forum_id === selectedForumId) return true;
        // Check by forum name/category match
        const matchingForum = forums.find((f) => f.id === selectedForumId);
        if (matchingForum) {
          const forumObj = Array.isArray(emf.forums) ? emf.forums[0] : emf.forums;
          if (forumObj?.name && forumObj.name.toLowerCase() === matchingForum.name.toLowerCase()) {
            return true;
          }
          if (forumObj?.category && forumObj.category.toLowerCase() === matchingForum.name.toLowerCase()) {
            return true;
          }
        }
        return false;
      });
    });
  }, [members, selectedForumId, searchQuery, forums]);

  // Helper to extract forum names for a member
  const getMemberForumNames = (member: ExecutiveMember): string[] => {
    if (!member.executive_member_forums || member.executive_member_forums.length === 0) {
      return [];
    }
    return member.executive_member_forums
      .map((emf) => {
        const forumObj = Array.isArray(emf.forums) ? emf.forums[0] : emf.forums;
        if (forumObj?.name) return forumObj.name;
        const match = forums.find((f) => f.id === emf.forum_id);
        return match ? match.name : null;
      })
      .filter((name): name is string => Boolean(name));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">

        {/* HERO SECTION */}
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-background via-secondary/30 to-background overflow-hidden border-b border-slate-200">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="eesa-container max-w-5xl text-center relative">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Leadership & Committee
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              EESA <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-eesa-teal">Executive Members</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Meet the student coordinators and executive committee driving innovation,
              organizing forums, and leading student initiatives at PRMIT&R.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="eesa-container py-12 md:py-16 space-y-10">

          {/* FILTER & SEARCH BAR */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
            
            {/* FORUM FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedForumId("ALL")}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                  selectedForumId === "ALL"
                    ? "bg-primary text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All Forums</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  selectedForumId === "ALL" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {members.length}
                </span>
              </button>

              {forums.map((forum) => {
                const isSelected = selectedForumId === forum.id;
                // Calculate count for this forum
                const forumCount = members.filter((m) =>
                  m.executive_member_forums?.some((emf) => {
                    if (emf.forum_id === forum.id) return true;
                    if (emf.forums?.name && emf.forums.name.toLowerCase() === forum.name.toLowerCase()) return true;
                    return false;
                  })
                ).length;

                return (
                  <button
                    key={forum.id}
                    type="button"
                    onClick={() => setSelectedForumId(forum.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                      isSelected
                        ? "bg-primary text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{forum.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {forumCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH BOX */}
            <div className="relative w-full lg:w-72 flex-shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition"
              />
            </div>

          </div>

          {/* ACTIVE FORUM DESCRIPTION BANNER */}
          {selectedForumId !== "ALL" && (
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {forums.find((f) => f.id === selectedForumId)?.name || "Selected Forum"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Showing all executive coordinators and members assigned to this forum.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedForumId("ALL")}
                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* MEMBERS GRID */}
          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading Executive Members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-lg mx-auto">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Members Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No executive members match your search query."
                  : "No active executive members have been assigned to this forum yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMembers.map((member) => {
                const forumNames = getMemberForumNames(member);

                return (
                  <div
                    key={member.id}
                    className="group relative rounded-3xl bg-white border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Accent Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-eesa-teal opacity-90 group-hover:h-2 transition-all" />

                    <div>
                      {/* PROFILE PHOTO & BASIC INFO */}
                      <div className="flex flex-col items-center text-center mb-6">
                        <div className="relative mb-5">
                          {member.photo_url ? (
                            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-md">
                              <img
                                src={member.photo_url}
                                alt={member.full_name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ) : (
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 text-primary flex items-center justify-center font-extrabold text-2xl ring-4 ring-primary/20 shadow-md">
                              {member.full_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          {member.academic_year && (
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                              {member.academic_year}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {member.full_name}
                        </h3>

                        <p className="text-sm font-semibold text-primary mt-1">
                          {member.designation}
                        </p>
                      </div>

                      {/* ASSIGNED FORUMS BADGES (SECTION 7 REQUIREMENT) */}
                      <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                          Assigned Forums
                        </div>
                        {forumNames.length > 0 ? (
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {forumNames.map((name, idx) => (
                              <span
                                key={idx}
                                className="text-xs font-medium px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 text-center italic">
                            Executive Committee
                          </p>
                        )}
                      </div>

                      {/* BIO */}
                      {member.bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed text-center whitespace-pre-line line-clamp-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {member.bio}
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

      </div>
    </Layout>
  );
}
