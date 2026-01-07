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
// ABOUT TEAM
export const getAboutTeam = async () => {
  const { data, error } = await supabase
    .from("about_team")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};