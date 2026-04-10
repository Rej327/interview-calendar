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

export async function deleteRole(role_id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("roles_table")
      .delete()
      .eq("role_id", role_id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("deleteRole Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteCandidate(candidate_id: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc("delete_candidate", {
      input_data: { candidate_id },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("deleteCandidate Action Error:", error);
    return { success: false, message: error.message };
  }
}
