"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function updateInterview(interview_id: string, updates: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from("interviews_table")
      .update(updates)
      .eq("interview_id", interview_id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("updateInterview Action Error:", error);
    return { success: false, message: error.message };
  }
}
