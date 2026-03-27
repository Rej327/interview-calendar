"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function fetchCalendarEvents(start_date?: string, end_date?: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_calendar_events", {
      input_data: { start_date, end_date },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchCalendarEvents Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function fetchCandidates() {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_candidates_portfolio", {
      input_data: {},
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchCandidates Action Error:", error);
    return { success: false, message: error.message };
  }
}
