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
        <section className="relative py-10 md:py-14 bg-gradient-to-br from-background via-secondary/30 to-background overflow-hidden border-b border-slate-200">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="eesa-container max-w-4xl text-center relative">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Leadership & Committee
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
              EESA <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-eesa-teal">Executive Members</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Meet the student coordinators and executive committee driving innovation,
              organizing forums, and leading student initiatives at PRMIT&R.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="eesa-container py-6 md:py-8 space-y-6">

          {/* FILTER & SEARCH BAR */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            
            {/* FORUM FILTER PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-1 flex-1">
              <button
                type="button"
                onClick={() => setSelectedForumId("ALL")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                  selectedForumId === "ALL"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Forums</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                    const forumObj = Array.isArray(emf.forums) ? emf.forums[0] : emf.forums;
                    if (forumObj?.name && forumObj.name.toLowerCase() === forum.name.toLowerCase()) return true;
                    return false;
                  })
                ).length;

                return (
                  <button
                    key={forum.id}
                    type="button"
                    onClick={() => setSelectedForumId(forum.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                      isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                    }`}
                  >
                    <span>{forum.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {forumCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH BOX */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs sm:text-sm transition"
              />
            </div>

          </div>

          {/* ACTIVE FORUM DESCRIPTION BANNER */}
          {selectedForumId !== "ALL" && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
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
            <div className="min-h-[200px] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading Executive Members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-md mx-auto">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Members Found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? "No executive members match your search query."
                  : "No active executive members have been assigned to this forum yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredMembers.map((member) => {
                const forumNames = getMemberForumNames(member);

                return (
                  <div
                    key={member.id}
                    className="group relative rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Accent Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-eesa-teal opacity-90 group-hover:h-1.5 transition-all" />

                    <div>
                      {/* PROFILE PHOTO & BASIC INFO */}
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-3">
                          {member.photo_url ? (
                            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-sm">
                              <img
                                src={member.photo_url}
                                alt={member.full_name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 text-primary flex items-center justify-center font-bold text-lg ring-2 ring-primary/20 shadow-sm">
                              {member.full_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          {member.academic_year && (
                            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                              {member.academic_year}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                          {member.full_name}
                        </h3>

                        <p className="text-xs font-semibold text-primary mt-0.5 line-clamp-1">
                          {member.designation}
                        </p>
                      </div>

                      {/* ASSIGNED FORUMS BADGES */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1.5">
                          Assigned Forums
                        </div>
                        {forumNames.length > 0 ? (
                          <div className="flex flex-wrap justify-center gap-1">
                            {forumNames.map((name, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/15"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 text-center italic">
                            Executive Committee
                          </p>
                        )}
                      </div>

                      {/* BIO */}
                      {member.bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed text-center whitespace-pre-line line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3">
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
