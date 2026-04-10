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

export async function updateRole(role_id: string, updates: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from("roles_table")
      .update(updates)
      .eq("role_id", role_id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("updateRole Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateCandidate(input_data: { candidate_id: string; full_name?: string; email?: string; avatar_url?: string; status?: string; role_id?: string }) {
  try {
    const { data, error } = await supabaseAdmin.rpc("update_candidate", {
      input_data,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("updateCandidate Action Error:", error);
    return { success: false, message: error.message };
  }
}
