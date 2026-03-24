"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function deleteInterview(interview_id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("interviews_table")
      .delete()
      .eq("interview_id", interview_id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("deleteInterview Action Error:", error);
    return { success: false, message: error.message };
  }
}
