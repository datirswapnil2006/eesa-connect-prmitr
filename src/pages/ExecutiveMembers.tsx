import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import {
  Users,
  Sparkles,
  Layers,
  Search,
  X,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  getActiveExecutiveMembers,
  getAllForums,
  type ExecutiveMember,
  type ForumItem,
} from "@/lib/api";

export default function ExecutiveMembers() {
  const navigate = useNavigate();
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
      <div className="bg-slate-50/60 pb-16">

        {/* HERO SECTION - COMPACT & PROFESSIONAL */}
        <section className="relative py-6 sm:py-8 md:py-10 bg-gradient-to-b from-primary/5 via-secondary/20 to-transparent border-b border-slate-200/80">
          <div className="eesa-container max-w-4xl relative z-10">
            <div className="flex justify-start mb-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200 text-xs md:text-sm font-semibold text-slate-700 hover:text-primary hover:bg-white transition-all shadow-2xs group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            </div>

            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                Leadership & Committee
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                EESA <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-eesa-teal">Executive Members</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Meet the student coordinators and executive committee driving innovation,
                organizing forums, and leading student initiatives at PRMIT&R.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <section className="eesa-container py-4 sm:py-6 space-y-4 sm:space-y-5">

          {/* FILTER & SEARCH BAR */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-sm">
            
            {/* FORUM FILTER PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 flex-1">
              <button
                type="button"
                onClick={() => setSelectedForumId("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                  selectedForumId === "ALL"
                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                    : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/50"
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
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                      isSelected
                        ? "bg-primary text-white shadow-sm shadow-primary/25"
                        : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/50"
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
            <div className="relative w-full md:w-60 flex-shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs sm:text-sm transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* ACTIVE FORUM FILTER NOTIFICATION */}
          {selectedForumId !== "ALL" && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {forums.find((f) => f.id === selectedForumId)?.name || "Selected Forum"}
                  </h3>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    — Showing {filteredMembers.length} assigned {filteredMembers.length === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForumId("ALL")}
                className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline whitespace-nowrap"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* MEMBERS GRID */}
          {loading ? (
            <div className="min-h-[220px] flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80 p-8">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading Executive Members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">No Members Found</h3>
              <p className="text-xs text-slate-500 mb-4">
                {searchQuery
                  ? "No executive members match your search query."
                  : "No active executive members have been assigned to this forum yet."}
              </p>
              {(searchQuery || selectedForumId !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedForumId("ALL");
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4.5">
              {filteredMembers.map((member) => {
                const forumNames = getMemberForumNames(member);

                return (
                  <div
                    key={member.id}
                    className="group relative rounded-2xl bg-white border border-slate-200/80 hover:border-primary/40 p-4 sm:p-4.5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Accent Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-eesa-teal opacity-80 group-hover:h-1.5 group-hover:opacity-100 transition-all" />

                    <div className="flex flex-col h-full justify-between">
                      {/* PROFILE PHOTO & BASIC INFO */}
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-2.5 mt-1 flex justify-center">
                          <OptimizedImage
                            src={member.photo_url}
                            alt={member.full_name}
                            variant="profile"
                            fallbackText={member.full_name}
                            containerClassName="w-24 h-24 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-sm"
                            className="group-hover:scale-105 transition-transform duration-500"
                          />

                          {member.academic_year && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap flex items-center gap-0.5 z-10">
                              <GraduationCap className="w-2.5 h-2.5" />
                              {member.academic_year}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mt-1">
                          {member.full_name}
                        </h3>

                        <p className="text-xs font-semibold text-primary mt-0.5 line-clamp-1">
                          {member.designation}
                        </p>
                      </div>

                      {/* ASSIGNED FORUMS BADGES */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100">
                        {forumNames.length > 0 ? (
                          <div className="flex flex-wrap justify-center gap-1">
                            {forumNames.map((name, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/15 group-hover:bg-primary/10 transition-colors"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 text-center italic">
                            Executive Committee
                          </p>
                        )}
                      </div>

                      {/* BIO */}
                      {member.bio && (
                        <p className="text-[11px] text-slate-500 leading-relaxed text-center whitespace-pre-line line-clamp-3 bg-slate-50/80 p-2 rounded-xl border border-slate-100/80 mt-2.5">
                          "{member.bio}"
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
