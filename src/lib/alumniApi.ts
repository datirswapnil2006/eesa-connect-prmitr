import { supabase } from "@/supabase/client";

export interface AlumniProfile {
  id: string;
  user_id: string;
  full_name: string;
  graduation_year: number | null;
  academic_year: string | null;
  department: string | null;
  company: string | null;
  designation: string | null;
  industry: string | null;
  location: string | null;
  bio: string | null;
  skills: string[];
  profile_photo_url: string | null;
  linkedin_url: string | null;
  mentorship_available: boolean;
  career_guidance_available: boolean;
  internship_support: boolean;
  job_referral_support: boolean;
  status: "pending" | "approved" | "rejected";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AlumniConnectionRequest {
  id: string;
  student_id: string;
  alumni_id: string;
  message: string | null;
  student_name: string | null;
  student_email: string | null;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
  alumni_profiles?: AlumniProfile | null;
}

export interface AlumniFilterOptions {
  search?: string;
  department?: string;
  graduation_year?: number | null;
  industry?: string;
  company?: string;
  mentorship_available?: boolean;
  career_guidance_available?: boolean;
  internship_support?: boolean;
  job_referral_support?: boolean;
}

/**
 * Upload alumni profile photo to Supabase storage 'alumni-photos' bucket
 */
export const uploadAlumniPhoto = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `alumni-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("alumni-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    // If bucket does not exist or upload fails, try fallback
    console.warn("Storage upload error, attempting team-images fallback:", error);
    const { error: teamImgErr } = await supabase.storage
      .from("team-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (teamImgErr) throw error;

    const { data: teamData } = supabase.storage
      .from("team-images")
      .getPublicUrl(fileName);
    return teamData.publicUrl;
  }

  const { data } = supabase.storage
    .from("alumni-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
};

/**
 * Fetch approved & active alumni for the public directory with filters
 */
export const getPublicAlumni = async (
  filters?: AlumniFilterOptions
): Promise<AlumniProfile[]> => {
  try {
    let query = supabase
      .from("alumni_profiles")
      .select("*")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (filters?.department && filters.department !== "all") {
      query = query.eq("department", filters.department);
    }

    if (filters?.graduation_year) {
      query = query.eq("graduation_year", filters.graduation_year);
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.eq("industry", filters.industry);
    }

    if (filters?.company) {
      query = query.ilike("company", `%${filters.company}%`);
    }

    if (filters?.mentorship_available) {
      query = query.eq("mentorship_available", true);
    }

    if (filters?.career_guidance_available) {
      query = query.eq("career_guidance_available", true);
    }

    if (filters?.internship_support) {
      query = query.eq("internship_support", true);
    }

    if (filters?.job_referral_support) {
      query = query.eq("job_referral_support", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    let result = (data || []) as AlumniProfile[];

    // In-memory multi-field text search for seamless UX
    if (filters?.search && filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.full_name?.toLowerCase().includes(term) ||
          a.company?.toLowerCase().includes(term) ||
          a.designation?.toLowerCase().includes(term) ||
          a.location?.toLowerCase().includes(term) ||
          a.industry?.toLowerCase().includes(term) ||
          a.bio?.toLowerCase().includes(term) ||
          a.skills?.some((s) => s.toLowerCase().includes(term))
      );
    }

    return result;
  } catch (err) {
    console.error("Error fetching public alumni:", err);
    return [];
  }
};

/**
 * Paginated version of getPublicAlumni for the directory.
 * Selects only the columns needed for card display and uses .range() for pagination.
 * Returns { data, count } where count is the total matching records.
 */
export const getPublicAlumniPaginated = async (
  filters?: AlumniFilterOptions,
  page: number = 0,
  pageSize: number = 16
): Promise<{ data: AlumniProfile[]; count: number | null }> => {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("alumni_profiles")
      .select(
        `id, user_id, full_name, graduation_year, academic_year, department,
         company, designation, industry, location, bio, skills,
         profile_photo_url, linkedin_url, mentorship_available,
         career_guidance_available, internship_support, job_referral_support,
         status, is_active, created_at, updated_at`,
        { count: "exact" }
      )
      .eq("status", "approved")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (filters?.department && filters.department !== "all") {
      query = query.eq("department", filters.department);
    }

    if (filters?.graduation_year) {
      query = query.eq("graduation_year", filters.graduation_year);
    }

    if (filters?.industry && filters.industry !== "all") {
      query = query.eq("industry", filters.industry);
    }

    if (filters?.company) {
      query = query.ilike("company", `%${filters.company}%`);
    }

    if (filters?.mentorship_available) {
      query = query.eq("mentorship_available", true);
    }

    if (filters?.career_guidance_available) {
      query = query.eq("career_guidance_available", true);
    }

    if (filters?.internship_support) {
      query = query.eq("internship_support", true);
    }

    if (filters?.job_referral_support) {
      query = query.eq("job_referral_support", true);
    }

    // Apply pagination range
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    let result = (data || []) as AlumniProfile[];

    // In-memory multi-field text search (applied after pagination for UX consistency)
    if (filters?.search && filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.full_name?.toLowerCase().includes(term) ||
          a.company?.toLowerCase().includes(term) ||
          a.designation?.toLowerCase().includes(term) ||
          a.location?.toLowerCase().includes(term) ||
          a.industry?.toLowerCase().includes(term) ||
          a.bio?.toLowerCase().includes(term) ||
          a.skills?.some((s) => s.toLowerCase().includes(term))
      );
    }

    return { data: result, count };
  } catch (err) {
    console.error("Error fetching paginated public alumni:", err);
    return { data: [], count: null };
  }
};

/**
 * Fetch all alumni for the Admin Dashboard (pending, approved, rejected)
 */
export const getAllAlumniAdmin = async (
  statusFilter?: "all" | "pending" | "approved" | "rejected"
): Promise<AlumniProfile[]> => {
  try {
    let query = supabase
      .from("alumni_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AlumniProfile[];
  } catch (err) {
    console.error("Error fetching admin alumni:", err);
    return [];
  }
};

/**
 * Fetch alumni profile of current logged-in user
 */
export const getMyAlumniProfile = async (
  userId: string
): Promise<AlumniProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as AlumniProfile | null;
  } catch (err) {
    console.error("Error fetching my alumni profile:", err);
    return null;
  }
};

/**
 * Register / Update alumni profile (self-service)
 */
export const upsertAlumniProfile = async (
  profileData: Partial<AlumniProfile> & { user_id: string; full_name: string }
): Promise<AlumniProfile> => {
  // Ensure array for skills
  const skillsArray = Array.isArray(profileData.skills)
    ? profileData.skills
    : typeof profileData.skills === "string"
    ? (profileData.skills as string).split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const payload: any = {
    user_id: profileData.user_id,
    full_name: profileData.full_name,
    graduation_year: profileData.graduation_year ? Number(profileData.graduation_year) : null,
    academic_year: profileData.academic_year || null,
    department: profileData.department || null,
    company: profileData.company || null,
    designation: profileData.designation || null,
    industry: profileData.industry || null,
    location: profileData.location || null,
    bio: profileData.bio || null,
    skills: skillsArray,
    profile_photo_url: profileData.profile_photo_url || null,
    linkedin_url: profileData.linkedin_url || null,
    mentorship_available: Boolean(profileData.mentorship_available),
    career_guidance_available: Boolean(profileData.career_guidance_available),
    internship_support: Boolean(profileData.internship_support),
    job_referral_support: Boolean(profileData.job_referral_support),
    status: profileData.status || "pending", // always pending upon new registration or re-submission
    is_active: profileData.is_active !== undefined ? profileData.is_active : true,
    updated_at: new Date().toISOString(),
  };

  if (profileData.id) {
    payload.id = profileData.id;
  }

  const { data, error } = await supabase
    .from("alumni_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return data as AlumniProfile;
};

/**
 * Admin: Update alumni status (Approve / Reject) & visibility
 */
export const updateAlumniStatusAdmin = async (
  id: string,
  status: "pending" | "approved" | "rejected",
  is_active?: boolean
) => {
  const payload: any = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (is_active !== undefined) {
    payload.is_active = is_active;
  }

  const { error } = await supabase
    .from("alumni_profiles")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
};

/**
 * Admin: Toggle alumni active/hidden visibility
 */
export const toggleAlumniActiveAdmin = async (
  id: string,
  is_active: boolean
) => {
  const { error } = await supabase
    .from("alumni_profiles")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
};

/**
 * Admin: Edit entire alumni profile
 */
export const updateAlumniProfileAdmin = async (
  id: string,
  profileData: Partial<AlumniProfile>
) => {
  const skillsArray = Array.isArray(profileData.skills)
    ? profileData.skills
    : typeof profileData.skills === "string"
    ? (profileData.skills as string).split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const payload: any = {
    ...profileData,
    updated_at: new Date().toISOString(),
  };

  if (skillsArray !== undefined) {
    payload.skills = skillsArray;
  }

  delete payload.id;

  const { error } = await supabase
    .from("alumni_profiles")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
};

/**
 * Admin: Delete alumni profile
 */
export const deleteAlumniAdmin = async (id: string) => {
  const { error } = await supabase
    .from("alumni_profiles")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

/* ==========================================================
   CONNECTION REQUESTS API
   ========================================================== */

/**
 * Student: Send a connection request to an approved alumni
 */
export const sendAlumniConnectionRequest = async (
  studentId: string,
  alumniId: string,
  message: string,
  studentName?: string,
  studentEmail?: string
) => {
  const { data, error } = await supabase
    .from("alumni_connection_requests")
    .insert([
      {
        student_id: studentId,
        alumni_id: alumniId,
        message: message.trim(),
        student_name: studentName?.trim() || null,
        student_email: studentEmail?.trim() || null,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Student: Get connection requests sent by this student
 */
export const getMySentRequests = async (
  studentId: string
): Promise<AlumniConnectionRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("alumni_connection_requests")
      .select(`
        *,
        alumni_profiles (*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Falling back to simple request fetch:", error);
      const { data: simpleData, error: simpleErr } = await supabase
        .from("alumni_connection_requests")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (simpleErr) throw simpleErr;
      return (simpleData || []) as AlumniConnectionRequest[];
    }

    return (data || []) as AlumniConnectionRequest[];
  } catch (err) {
    console.error("Error fetching sent connection requests:", err);
    return [];
  }
};

/**
 * Alumni: Get connection requests received for this alumni profile
 */
export const getMyReceivedRequests = async (
  alumniProfileId: string
): Promise<AlumniConnectionRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("alumni_connection_requests")
      .select("*")
      .eq("alumni_id", alumniProfileId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as AlumniConnectionRequest[];
  } catch (err) {
    console.error("Error fetching received connection requests:", err);
    return [];
  }
};

/**
 * Admin: Get all connection requests
 */
export const getAllConnectionRequestsAdmin = async (): Promise<
  AlumniConnectionRequest[]
> => {
  try {
    const { data, error } = await supabase
      .from("alumni_connection_requests")
      .select(`
        *,
        alumni_profiles (
          id,
          full_name,
          company,
          designation,
          department,
          graduation_year
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      const { data: simpleData, error: simpleErr } = await supabase
        .from("alumni_connection_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (simpleErr) throw simpleErr;
      return (simpleData || []) as AlumniConnectionRequest[];
    }

    return (data || []) as AlumniConnectionRequest[];
  } catch (err) {
    console.error("Error fetching all connection requests:", err);
    return [];
  }
};

/**
 * Update connection request status (Student cancels, Alumni accepts/rejects)
 */
export const updateConnectionRequestStatus = async (
  requestId: string,
  status: "pending" | "accepted" | "rejected" | "cancelled"
) => {
  const { error } = await supabase
    .from("alumni_connection_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;
};
