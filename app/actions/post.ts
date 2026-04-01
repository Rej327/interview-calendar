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

export async function updateInterview(input_data: any) {
  try {
    const { data, error } = await supabaseAdmin.rpc("update_interview", {
      input_data,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("updateInterview Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function quickAddInterview(input_data: any) {
  try {
    const { data, error } = await supabaseAdmin.rpc("quick_add_interview", {
      input_data,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("quickAddInterview Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function createCandidate(input_data: { full_name: string; email: string; avatar_url: string; role_id: string }) {
  try {
    const { data, error } = await supabaseAdmin.rpc("create_candidate", {
      input_data,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("createCandidate Action Error:", error);
    return { success: false, message: error.message };
  }
}
