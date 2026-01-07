import { supabase } from "@/supabase/client";

export const uploadTeamImage = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("team-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("team-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
