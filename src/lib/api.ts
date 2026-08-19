import { supabase } from "@/supabase/client";

/* HOME HERO */
export const getHomeHero = async () => {
  const { data, error } = await supabase
    .from("home_hero")
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

/* HOME FEATURES */
export const getHomeFeatures = async () => {
  const { data, error } = await supabase
    .from("home_features")
    .select("*");

  if (error) throw error;
  return data;
};

/* ABOUT PAGE */
export const getAboutPage = async () => {
  const { data, error } = await supabase
    .from("about_page")
    .select("*");

  if (error) throw error;
  return data;
};

/* LATEST BLOGS */
export const getLatestBlogs = async () => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return data;
};

/* UPCOMING EVENTS (FIXED) */
export const getUpcomingEvents = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("event_date", todayString) // Only today & future
    .order("event_date", { ascending: true })
    .limit(3);

  if (error) throw error;
  return data;
};

/*  PAST EVENTS (with pagination) */
export const getPastEvents = async (
  limit: number = 12,
  offset: number = 0
): Promise<{ data: any[]; count: number | null }> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split("T")[0];

  const { data, error, count } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .lt("event_date", todayString) 
    .order("event_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data || [], count };
};

/* ABOUT TEAM */
export const getAboutTeam = async () => {
  const { data, error } = await supabase
    .from("about_team")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

/* MEMBERSHIP SETTINGS */
export const getMembershipSettings = async () => {
  const { data, error } = await supabase
    .from("membership_settings")
    .select("*")
    .single();

  if (error) {
    console.error("Membership fetch error:", error);
    return null;
  }

  return data;
};

export const updateMembershipSettings = async (
  enabled: boolean,
  form_url: string
) => {
  const { error } = await supabase
    .from("membership_settings")
    .update({
      enabled,
      form_url,
      updated_at: new Date(),
    })
    .eq("id", 1);

  if (error) throw error;
};

/* ==========================================================
   EXECUTIVE MEMBERS & FORUMS API
   ========================================================== */

export type ForumItem = {
  id: string;
  name: string;
  category?: string;
};

export type ExecutiveMember = {
  id: string;
  full_name: string;
  designation: string;
  bio: string;
  photo_url: string;
  is_active: boolean;
  display_order: number;
  academic_year?: string;
  created_at?: string;
  updated_at?: string;
  executive_member_forums?: {
    forum_id: string;
    forums?: ForumItem | ForumItem[] | null;
  }[];
};

const normalizeMember = (item: any): ExecutiveMember => {
  const forumsList = Array.isArray(item.executive_member_forums)
    ? item.executive_member_forums.map((emf: any) => ({
        forum_id: emf.forum_id,
        forums: Array.isArray(emf.forums) ? emf.forums[0] || null : emf.forums || null,
      }))
    : [];

  return {
    id: item.id,
    full_name: item.full_name,
    designation: item.designation,
    bio: item.bio || "",
    photo_url: item.photo_url || "",
    is_active: Boolean(item.is_active),
    display_order: Number(item.display_order) || 0,
    academic_year: item.academic_year || "2024-25",
    created_at: item.created_at,
    updated_at: item.updated_at,
    executive_member_forums: forumsList,
  };
};

/**
 * Fetch active executive members with their assigned forums for the public website.
 */
export const getActiveExecutiveMembers = async (): Promise<ExecutiveMember[]> => {
  try {
    const { data, error } = await supabase
      .from("executive_members")
      .select(`
        id,
        full_name,
        designation,
        bio,
        photo_url,
        is_active,
        display_order,
        academic_year,
        created_at,
        updated_at,
        executive_member_forums (
          forum_id,
          forums (
            id,
            name,
            category
          )
        )
      `)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("Could not query executive_members with relations, falling back:", error);
      // Fallback simple query
      const { data: simpleData, error: simpleError } = await supabase
        .from("executive_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (simpleError) throw simpleError;
      return (simpleData || []).map(normalizeMember);
    }

    return (data || []).map(normalizeMember);
  } catch (err) {
    console.error("Error fetching active executive members:", err);
    return [];
  }
};

/**
 * Fetch all executive members (active and inactive) for the Admin Dashboard.
 */
export const getAllExecutiveMembersAdmin = async (): Promise<ExecutiveMember[]> => {
  try {
    const { data, error } = await supabase
      .from("executive_members")
      .select(`
        id,
        full_name,
        designation,
        bio,
        photo_url,
        is_active,
        display_order,
        academic_year,
        created_at,
        updated_at,
        executive_member_forums (
          forum_id,
          forums (
            id,
            name,
            category
          )
        )
      `)
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("Could not query admin executive_members with relations:", error);
      const { data: simpleData, error: simpleErr } = await supabase
        .from("executive_members")
        .select("*")
        .order("display_order", { ascending: true });
      if (simpleErr) throw simpleErr;
      return (simpleData || []).map(normalizeMember);
    }

    return (data || []).map(normalizeMember);
  } catch (err) {
    console.error("Error fetching admin executive members:", err);
    return [];
  }
};

/**
 * Fetch all available forums for multi-select and filtering.
 */
export const getAllForums = async (): Promise<ForumItem[]> => {
  try {
    const { data, error } = await supabase
      .from("forums")
      .select("id, name, category, title");

    if (error || !data || data.length === 0) {
      // Fallback default list
      return [
        { id: "core-electronics", name: "Core Electronics Forum", category: "Core Electronics" },
        { id: "it-forum", name: "IT Forum", category: "IT" },
        { id: "career-development", name: "Career Development Forum", category: "Career Development" },
        { id: "social-media", name: "Social Media", category: "Social Media" },
      ];
    }

    // Standardize canonical names
    const getCanonicalName = (raw: string): string => {
      const lower = raw.trim().toLowerCase();
      if (lower.includes("core electronics")) return "Core Electronics Forum";
      if (lower.includes("it")) return "IT Forum";
      if (lower.includes("career")) return "Career Development Forum";
      if (lower.includes("social media")) return "Social Media";
      return raw.trim();
    };

    const seenCanonical = new Map<string, ForumItem>();

    data.forEach((item: any) => {
      const rawName = item.name || item.category || item.title || "Forum";
      const canonical = getCanonicalName(rawName);
      const isExact = (item.name && item.name.toLowerCase() === canonical.toLowerCase());

      if (!seenCanonical.has(canonical) || isExact) {
        seenCanonical.set(canonical, {
          id: item.id,
          name: canonical,
          category: item.category || canonical,
        });
      }
    });

    return Array.from(seenCanonical.values());
  } catch (err) {
    console.error("Error fetching forums:", err);
    return [
      { id: "core-electronics", name: "Core Electronics Forum", category: "Core Electronics" },
      { id: "it-forum", name: "IT Forum", category: "IT" },
      { id: "career-development", name: "Career Development Forum", category: "Career Development" },
      { id: "social-media", name: "Social Media", category: "Social Media" },
    ];
  }
};

/**
 * Toggle member visibility (is_active).
 */
export const toggleExecutiveMemberStatus = async (id: string, is_active: boolean) => {
  const { error } = await supabase
    .from("executive_members")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
};

/**
 * Save executive member with many-to-many forum assignments.
 */
export const saveExecutiveMember = async (
  memberData: {
    id?: string;
    full_name: string;
    designation: string;
    bio: string;
    photo_url: string;
    is_active: boolean;
    display_order: number;
    academic_year?: string;
  },
  forumIds: string[]
) => {
  let memberId = memberData.id;

  if (memberId) {
    // UPDATE
    const { error: updateError } = await supabase
      .from("executive_members")
      .update({
        full_name: memberData.full_name,
        designation: memberData.designation,
        bio: memberData.bio,
        photo_url: memberData.photo_url,
        is_active: memberData.is_active,
        display_order: memberData.display_order,
        academic_year: memberData.academic_year || "2024-25",
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);

    if (updateError) throw updateError;
  } else {
    // INSERT
    const { data: inserted, error: insertError } = await supabase
      .from("executive_members")
      .insert([
        {
          full_name: memberData.full_name,
          designation: memberData.designation,
          bio: memberData.bio,
          photo_url: memberData.photo_url,
          is_active: memberData.is_active,
          display_order: memberData.display_order,
          academic_year: memberData.academic_year || "2024-25",
        },
      ])
      .select("id")
      .single();

    if (insertError) throw insertError;
    memberId = inserted.id;
  }

  // Synchronize many-to-many junction records in executive_member_forums
  if (memberId && Array.isArray(forumIds)) {
    // Remove existing assignments
    await supabase
      .from("executive_member_forums")
      .delete()
      .eq("executive_member_id", memberId);

    // Filter valid UUIDs if any
    const validForumIds = forumIds.filter((fid) => fid && fid.length > 5);

    if (validForumIds.length > 0) {
      const junctionRows = validForumIds.map((fid) => ({
        executive_member_id: memberId,
        forum_id: fid,
      }));

      const { error: junctionError } = await supabase
        .from("executive_member_forums")
        .insert(junctionRows);

      if (junctionError) {
        console.warn("Could not insert junction rows into executive_member_forums:", junctionError);
      }
    }
  }

  return memberId;
};

/**
 * Delete executive member.
 */
export const deleteExecutiveMember = async (id: string) => {
  // Cascading deletes handled by foreign key, but cleanup junction first for safety
  await supabase
    .from("executive_member_forums")
    .delete()
    .eq("executive_member_id", id);

  const { error } = await supabase
    .from("executive_members")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

