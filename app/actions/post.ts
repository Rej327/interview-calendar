"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function scheduleInterview(input_data: any) {
  try {
    const { data, error } = await supabaseAdmin.rpc("schedule_step_interview", {
      input_data,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("scheduleInterview Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function createRole(input_data: { role_title: string; role_department: string }) {
  try {
    const { data, error } = await supabaseAdmin.rpc("create_role", {
      input_data,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("createRole Action Error:", error);
    return { success: false, message: error.message };
  }
}
