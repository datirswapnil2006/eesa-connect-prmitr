import { supabase } from "@/supabase/client";
import { type AlumniProfile } from "./alumniApi";

/* ==========================================================
   1. MENTORSHIP REQUESTS INTERFACES & API
   ========================================================== */

export interface AlumniMentorshipRequest {
  id: string;
  student_id: string;
  alumni_id: string;
  topic: string;
  message: string;
  preferred_mode: string | null;
  student_name: string | null;
  student_email: string | null;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  alumni_profiles?: AlumniProfile | null;
}

export const MENTORSHIP_TOPICS = [
  "Placement Preparation",
  "Software Development & Cloud",
  "Core Electronics & VLSI",
  "Embedded Systems & IoT",
  "Higher Studies & Research",
  "Interview Preparation & Mock Interviews",
  "Career Guidance & Resume Review",
  "Entrepreneurship & Startups",
  "Industry Trends & Networking",
];

export const INTERACTION_MODES = [
  "Video Call (Google Meet / Zoom)",
  "Email Discussion",
  "LinkedIn / Chat",
  "Phone Call",
  "In-person (College Campus)",
];

/**
 * Send a mentorship request from student to an approved alumni
 */
export const sendMentorshipRequest = async (data: {
  studentId: string;
  alumniId: string;
  topic: string;
  message: string;
  preferredMode?: string;
  studentName?: string;
  studentEmail?: string;
}) => {
  const { data: inserted, error } = await supabase
    .from("alumni_mentorship_requests")
    .insert([
      {
        student_id: data.studentId,
        alumni_id: data.alumniId,
        topic: data.topic,
        message: data.message.trim(),
        preferred_mode: data.preferredMode || "Video Call (Google Meet / Zoom)",
        student_name: data.studentName?.trim() || null,
        student_email: data.studentEmail?.trim() || null,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return inserted;
};

/**
 * Get mentorship requests sent by logged in student
 */
export const getMySentMentorshipRequests = async (
  studentId: string
): Promise<AlumniMentorshipRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("alumni_mentorship_requests")
      .select(`
        *,
        alumni_profiles (*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Falling back to simple mentorship fetch:", error);
      const { data: simpleData, error: simpleErr } = await supabase
        .from("alumni_mentorship_requests")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (simpleErr) throw simpleErr;
      return (simpleData || []) as AlumniMentorshipRequest[];
    }

    return (data || []) as AlumniMentorshipRequest[];
  } catch (err) {
    console.error("Error fetching sent mentorship requests:", err);
    return [];
  }
};

/**
 * Get mentorship requests received by alumni
 */
export const getMyReceivedMentorshipRequests = async (
  alumniProfileId: string
): Promise<AlumniMentorshipRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("alumni_mentorship_requests")
      .select("*")
      .eq("alumni_id", alumniProfileId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as AlumniMentorshipRequest[];
  } catch (err) {
    console.error("Error fetching received mentorship requests:", err);
    return [];
  }
};

/**
 * Update mentorship request status
 */
export const updateMentorshipRequestStatus = async (
  requestId: string,
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
) => {
  const { error } = await supabase
    .from("alumni_mentorship_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;
};

/**
 * Admin: Get all mentorship requests
 */
export const getAllMentorshipRequestsAdmin = async (): Promise<
  AlumniMentorshipRequest[]
> => {
  try {
    const { data, error } = await supabase
      .from("alumni_mentorship_requests")
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
        .from("alumni_mentorship_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (simpleErr) throw simpleErr;
      return (simpleData || []) as AlumniMentorshipRequest[];
    }

    return (data || []) as AlumniMentorshipRequest[];
  } catch (err) {
    console.error("Error fetching all mentorship requests:", err);
    return [];
  }
};

/* ==========================================================
   2. JOB OPPORTUNITIES INTERFACES & API
   ========================================================== */

export interface AlumniJob {
  id: string;
  title: string;
  company: string;
  location: string;
  work_mode: "Onsite" | "Hybrid" | "Remote";
  experience: string;
  skills: string[];
  description: string;
  eligibility: string | null;
  application_url: string;
  application_deadline: string | null;
  posted_by_alumni_id: string | null;
  posted_by_user_id: string | null;
  poster_name: string | null;
  status: "draft" | "published" | "closed" | "hidden";
  created_at: string;
  updated_at: string;
  alumni_profiles?: AlumniProfile | null;
}

export const getPublicJobs = async (filters?: {
  search?: string;
  work_mode?: string;
  experience?: string;
  limit?: number;
}): Promise<AlumniJob[]> => {
  try {
    let query = supabase
      .from("alumni_jobs")
      .select(`
        *,
        alumni_profiles (
          id,
          full_name,
          designation,
          company,
          profile_photo_url,
          graduation_year
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.work_mode && filters.work_mode !== "all") {
      query = query.eq("work_mode", filters.work_mode);
    }

    const { data, error } = await query;
    if (error) {
      // Fallback simple query
      const { data: fallback, error: fallbackErr } = await supabase
        .from("alumni_jobs")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (fallbackErr) throw fallbackErr;
      return (fallback || []) as AlumniJob[];
    }

    let results = (data || []) as AlumniJob[];

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.skills?.some((s) => s.toLowerCase().includes(q)) ||
          j.description?.toLowerCase().includes(q)
      );
    }

    return results;
  } catch (err) {
    console.error("Error fetching public jobs:", err);
    return [];
  }
};

export const getAllJobsAdmin = async (): Promise<AlumniJob[]> => {
  try {
    const { data, error } = await supabase
      .from("alumni_jobs")
      .select(`
        *,
        alumni_profiles (
          id,
          full_name,
          designation,
          company
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      const { data: simpleData, error: simpleErr } = await supabase
        .from("alumni_jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (simpleErr) throw simpleErr;
      return (simpleData || []) as AlumniJob[];
    }

    return (data || []) as AlumniJob[];
  } catch (err) {
    console.error("Error fetching admin jobs:", err);
    return [];
  }
};

export const createJob = async (job: Partial<AlumniJob>) => {
  const payload = {
    title: job.title,
    company: job.company,
    location: job.location,
    work_mode: job.work_mode || "Hybrid",
    experience: job.experience || "0-2 years",
    skills: job.skills || [],
    description: job.description,
    eligibility: job.eligibility || null,
    application_url: job.application_url,
    application_deadline: job.application_deadline || null,
    posted_by_alumni_id: job.posted_by_alumni_id || null,
    posted_by_user_id: job.posted_by_user_id || null,
    poster_name: job.poster_name || null,
    status: job.status || "published",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("alumni_jobs")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as AlumniJob;
};

export const updateJob = async (id: string, job: Partial<AlumniJob>) => {
  const payload: any = {
    ...job,
    updated_at: new Date().toISOString(),
  };
  delete payload.id;
  delete payload.alumni_profiles;

  const { error } = await supabase
    .from("alumni_jobs")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
};

export const deleteJob = async (id: string) => {
  const { error } = await supabase.from("alumni_jobs").delete().eq("id", id);
  if (error) throw error;
};

/* ==========================================================
   3. INTERNSHIP OPPORTUNITIES INTERFACES & API
   ========================================================== */

export interface AlumniInternship {
  id: string;
  title: string;
  company: string;
  location: string;
  work_mode: "Onsite" | "Hybrid" | "Remote";
  duration: string;
  stipend: string | null;
  skills: string[];
  eligibility: string | null;
  description: string;
  application_url: string;
  application_deadline: string | null;
  posted_by_alumni_id: string | null;
  posted_by_user_id: string | null;
  poster_name: string | null;
  status: "draft" | "published" | "closed" | "hidden";
  created_at: string;
  updated_at: string;
  alumni_profiles?: AlumniProfile | null;
}

export const getPublicInternships = async (filters?: {
  search?: string;
  work_mode?: string;
  limit?: number;
}): Promise<AlumniInternship[]> => {
  try {
    let query = supabase
      .from("alumni_internships")
      .select(`
        *,
        alumni_profiles (
          id,
          full_name,
          designation,
          company,
          profile_photo_url,
          graduation_year
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.work_mode && filters.work_mode !== "all") {
      query = query.eq("work_mode", filters.work_mode);
    }

    const { data, error } = await query;
    if (error) {
      const { data: fallback, error: fallbackErr } = await supabase
        .from("alumni_internships")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (fallbackErr) throw fallbackErr;
      return (fallback || []) as AlumniInternship[];
    }

    let results = (data || []) as AlumniInternship[];

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.skills?.some((s) => s.toLowerCase().includes(q)) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    return results;
  } catch (err) {
    console.error("Error fetching public internships:", err);
    return [];
  }
};

export const getAllInternshipsAdmin = async (): Promise<AlumniInternship[]> => {
  try {
    const { data, error } = await supabase
      .from("alumni_internships")
      .select(`
        *,
        alumni_profiles (
          id,
          full_name,
          designation,
          company
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      const { data: simpleData, error: simpleErr } = await supabase
        .from("alumni_internships")
        .select("*")
        .order("created_at", { ascending: false });
      if (simpleErr) throw simpleErr;
      return (simpleData || []) as AlumniInternship[];
    }

    return (data || []) as AlumniInternship[];
  } catch (err) {
    console.error("Error fetching admin internships:", err);
    return [];
  }
};

export const createInternship = async (internship: Partial<AlumniInternship>) => {
  const payload = {
    title: internship.title,
    company: internship.company,
    location: internship.location,
    work_mode: internship.work_mode || "Hybrid",
    duration: internship.duration || "3 Months",
    stipend: internship.stipend || null,
    skills: internship.skills || [],
    eligibility: internship.eligibility || null,
    description: internship.description,
    application_url: internship.application_url,
    application_deadline: internship.application_deadline || null,
    posted_by_alumni_id: internship.posted_by_alumni_id || null,
    posted_by_user_id: internship.posted_by_user_id || null,
    poster_name: internship.poster_name || null,
    status: internship.status || "published",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("alumni_internships")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as AlumniInternship;
};

export const updateInternship = async (
  id: string,
  internship: Partial<AlumniInternship>
) => {
  const payload: any = {
    ...internship,
    updated_at: new Date().toISOString(),
  };
  delete payload.id;
  delete payload.alumni_profiles;

  const { error } = await supabase
    .from("alumni_internships")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
};

export const deleteInternship = async (id: string) => {
  const { error } = await supabase
    .from("alumni_internships")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

/* ==========================================================
   4. GUEST LECTURES INTERFACES & API
   ========================================================== */

export interface AlumniGuestLecture {
  id: string;
  title: string;
  description: string;
  speaker_alumni_id: string | null;
  speaker_name: string | null;
  speaker_designation: string | null;
  speaker_company: string | null;
  topic_category: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  meeting_url: string | null;
  registration_url: string | null;
  poster_url: string | null;
  status: "upcoming" | "completed" | "cancelled" | "hidden";
  created_at: string;
  updated_at: string;
  alumni_profiles?: AlumniProfile | null;
}

export const getPublicGuestLectures = async (limit?: number): Promise<AlumniGuestLecture[]> => {
  try {
    let query = supabase
      .from("alumni_guest_lectures")
      .select(`
        *,
        alumni_profiles (
          id,
          full_name,
          designation,
          company,
          profile_photo_url,
          graduation_year,
          linkedin_url
        )
      `)
      .in("status", ["upcoming", "completed"])
      .order("date", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      const { data: fallback, error: fallbackErr } = await supabase
        .from("alumni_guest_lectures")
        .select("*")
        .in("status", ["upcoming", "completed"])
        .order("date", { ascending: false });
      if (fallbackErr) throw fallbackErr;
      return (fallback || []) as AlumniGuestLecture[];
    }

    return (data || []) as AlumniGuestLecture[];
  } catch (err) {
    console.error("Error fetching guest lectures:", err);
    return [];
  }
};

export const getAllGuestLecturesAdmin = async (): Promise<
  AlumniGuestLecture[]
> => {
  try {
    const { data, error } = await supabase
      .from("alumni_guest_lectures")
      .select(`
        *,
        alumni_profiles (
          id,
          full_name,
          designation,
          company,
          profile_photo_url
        )
      `)
      .order("date", { ascending: false });

    if (error) {
      const { data: simpleData, error: simpleErr } = await supabase
        .from("alumni_guest_lectures")
        .select("*")
        .order("date", { ascending: false });
      if (simpleErr) throw simpleErr;
      return (simpleData || []) as AlumniGuestLecture[];
    }

    return (data || []) as AlumniGuestLecture[];
  } catch (err) {
    console.error("Error fetching admin guest lectures:", err);
    return [];
  }
};

export const createGuestLecture = async (
  lecture: Partial<AlumniGuestLecture>
) => {
  const payload = {
    title: lecture.title,
    description: lecture.description,
    speaker_alumni_id: lecture.speaker_alumni_id || null,
    speaker_name: lecture.speaker_name || null,
    speaker_designation: lecture.speaker_designation || null,
    speaker_company: lecture.speaker_company || null,
    topic_category: lecture.topic_category || "Technical Talk",
    date: lecture.date,
    start_time: lecture.start_time,
    end_time: lecture.end_time,
    venue: lecture.venue || "Seminar Hall",
    meeting_url: lecture.meeting_url || null,
    registration_url: lecture.registration_url || null,
    poster_url: lecture.poster_url || null,
    status: lecture.status || "upcoming",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("alumni_guest_lectures")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as AlumniGuestLecture;
};

export const updateGuestLecture = async (
  id: string,
  lecture: Partial<AlumniGuestLecture>
) => {
  const payload: any = {
    ...lecture,
    updated_at: new Date().toISOString(),
  };
  delete payload.id;
  delete payload.alumni_profiles;

  const { error } = await supabase
    .from("alumni_guest_lectures")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
};

export const deleteGuestLecture = async (id: string) => {
  const { error } = await supabase
    .from("alumni_guest_lectures")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

/* ==========================================================
   5. ALUMNI EVENTS INTERFACES & API
   ========================================================== */

export interface AlumniEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  location: string | null;
  registration_url: string | null;
  poster_url: string | null;
  organizer: string;
  status: "upcoming" | "completed" | "cancelled" | "hidden";
  created_at: string;
  updated_at: string;
}

export const getPublicAlumniEvents = async (limit?: number): Promise<AlumniEvent[]> => {
  try {
    let query = supabase
      .from("alumni_events")
      .select("*")
      .in("status", ["upcoming", "completed"])
      .order("event_date", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as AlumniEvent[];
  } catch (err) {
    console.error("Error fetching alumni events:", err);
    return [];
  }
};

export const getAllAlumniEventsAdmin = async (): Promise<AlumniEvent[]> => {
  try {
    const { data, error } = await supabase
      .from("alumni_events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) throw error;
    return (data || []) as AlumniEvent[];
  } catch (err) {
    console.error("Error fetching admin alumni events:", err);
    return [];
  }
};

export const createAlumniEvent = async (event: Partial<AlumniEvent>) => {
  const payload = {
    title: event.title,
    description: event.description,
    event_date: event.event_date,
    start_time: event.start_time,
    end_time: event.end_time,
    venue: event.venue,
    location: event.location || null,
    registration_url: event.registration_url || null,
    poster_url: event.poster_url || null,
    organizer: event.organizer || "EESA Alumni Cell & Electronics Dept",
    status: event.status || "upcoming",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("alumni_events")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as AlumniEvent;
};

export const updateAlumniEvent = async (
  id: string,
  event: Partial<AlumniEvent>
) => {
  const payload: any = {
    ...event,
    updated_at: new Date().toISOString(),
  };
  delete payload.id;

  const { error } = await supabase
    .from("alumni_events")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
};

export const deleteAlumniEvent = async (id: string) => {
  const { error } = await supabase
    .from("alumni_events")
    .delete()
    .eq("id", id);
  if (error) throw error;
};
