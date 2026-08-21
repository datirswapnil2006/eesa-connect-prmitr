import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import {
  Users,
  Sparkles,
  Layers,
  Search,
  X,
  GraduationCap,
  Mail,
  Linkedin,
  Github,
  Award,
} from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  getActiveBatches,
  getActiveBatchMembers,
  type BatchItem,
  type BatchMember,
} from "@/lib/api";

export default function BatchMembers() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [members, setMembers] = useState<BatchMember[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [batchesData, membersData] = await Promise.all([
          getActiveBatches(),
          getActiveBatchMembers(),
        ]);
        setBatches(batchesData);
        setMembers(membersData);
      } catch (err) {
        console.error("Error loading batch members data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter members by selected batch and search term
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.full_name?.toLowerCase().includes(q);
        const matchesRole = member.designation?.toLowerCase().includes(q);
        const matchesBio = member.bio?.toLowerCase().includes(q);
        const batchName = member.batches?.name?.toLowerCase() || "";
        const matchesBatch = batchName.includes(q);
        if (!matchesName && !matchesRole && !matchesBio && !matchesBatch) {
          return false;
        }
      }

      // 2. Batch Filter
      if (selectedBatchId === "ALL") {
        return true;
      }
      return member.batch_id === selectedBatchId;
    });
  }, [members, selectedBatchId, searchQuery]);

  return (
    <Layout>
      <div className="bg-slate-50/60 min-h-screen pb-16">

        {/* HERO SECTION */}
        <section className="relative py-8 sm:py-10 md:py-14 bg-gradient-to-b from-primary/10 via-secondary/20 to-transparent border-b border-slate-200/80">
          <div className="eesa-container max-w-4xl text-center relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Batch Cohorts & Representatives
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
              EESA <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-eesa-teal">Batch Members</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Explore the dedicated batch representatives, coordinators, and students who form the vibrant community of EESA across academic years.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <section className="eesa-container py-6 sm:py-8 space-y-6">

          {/* FILTER & SEARCH BAR */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            
            {/* BATCH FILTER TABS */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1 flex-1">
              <button
                type="button"
                onClick={() => setSelectedBatchId("ALL")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${
                  selectedBatchId === "ALL"
                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Batches</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedBatchId === "ALL"
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {members.length}
                </span>
              </button>

              {batches.map((batch) => {
                const isSelected = selectedBatchId === batch.id;
                const batchCount = members.filter((m) => m.batch_id === batch.id).length;

                return (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${
                      isSelected
                        ? "bg-primary text-white shadow-sm shadow-primary/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{batch.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {batchCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH BOX */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, role, batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs sm:text-sm transition"
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

          {/* ACTIVE FILTER NOTIFICATION */}
          {selectedBatchId !== "ALL" && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {batches.find((b) => b.id === selectedBatchId)?.name || "Selected Batch"}
                  </h3>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    — Showing {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatchId("ALL")}
                className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline whitespace-nowrap"
              >
                Show All Batches
              </button>
            </div>
          )}

          {/* MEMBERS GRID */}
          {loading ? (
            <div className="min-h-[260px] flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200/80 p-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading Batch Members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No Members Found</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {searchQuery
                  ? "No batch members match your search criteria."
                  : "No members have been added to this batch yet. Check back soon!"}
              </p>
              {(searchQuery || selectedBatchId !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBatchId("ALL");
                  }}
                  className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredMembers.map((member) => {
                const batchName =
                  member.batches?.name ||
                  batches.find((b) => b.id === member.batch_id)?.name ||
                  "Batch Member";

                return (
                  <div
                    key={member.id}
                    className="group relative rounded-3xl bg-white border border-slate-200/80 hover:border-primary/40 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Gradient Stripe */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-eesa-teal opacity-80 group-hover:opacity-100 transition-opacity" />

                    <div className="flex flex-col h-full justify-between">
                      {/* PROFILE PHOTO & INFO */}
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-3 mt-1 flex justify-center">
                          <OptimizedImage
                            src={member.photo_url}
                            alt={member.full_name}
                            variant="profile"
                            fallbackText={member.full_name}
                            containerClassName="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all shadow-md"
                            className="group-hover:scale-105 transition-transform duration-500 object-cover"
                          />

                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap flex items-center gap-1 z-10 border border-slate-700">
                            <Award className="w-3 h-3 text-eesa-teal" />
                            {batchName}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mt-2">
                          {member.full_name}
                        </h3>

                        <p className="text-xs font-semibold text-primary mt-0.5 line-clamp-1 bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/10">
                          {member.designation}
                        </p>
                      </div>

                      {/* BIO */}
                      {member.bio && (
                        <p className="text-xs text-slate-600 leading-relaxed text-center whitespace-pre-line line-clamp-3 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 mt-3">
                          "{member.bio}"
                        </p>
                      )}

                      {/* SOCIAL & CONTACT LINKS */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors"
                            title={`Email: ${member.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}

                        {member.linkedin_url && (
                          <a
                            href={member.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-colors"
                            title="LinkedIn Profile"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}

                        {member.github_url && (
                          <a
                            href={member.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900/10 hover:text-slate-900 transition-colors"
                            title="GitHub Profile"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}

                        {!member.email && !member.linkedin_url && !member.github_url && (
                          <span className="text-[11px] text-slate-400 italic">
                            PRMIT&R Electrical Engineering
                          </span>
                        )}
                      </div>
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
