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

/* UPCOMING EVENTS */
export const getUpcomingEvents = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: true })
    .limit(3);

  if (error) throw error;
  return data;
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
