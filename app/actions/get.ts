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

export async function fetchCandidatesPaginated(input_data: { 
  limit: number; 
  offset: number; 
  sort_column?: string; 
  sort_direction?: string; 
  query?: string; 
  status_filters?: string[]; 
  role_filters?: string[]; 
}) {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_candidates_portfolio_paginated", {
      input_data,
    });

    if (error) throw error;
    return { success: true, data: data };
  } catch (error: any) {
    console.error("fetchCandidatesPaginated Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function fetchRoles() {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_all_roles", {
      input_data: {},
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchRoles Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function fetchInterviewers() {
    try {
      const { data, error } = await supabaseAdmin.rpc("get_all_interviewers", {
        input_data: {},
      });
  
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("fetchInterviewers Action Error:", error);
      return { success: false, message: error.message };
  }
}

export async function fetchRecentChanges() {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_recent_changes");

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchRecentChanges Action Error:", error);
    return { success: false, message: error.message };
  }
}

export async function fetchCandidateJourney(hiring_process_id: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_hiring_process_details", {
      input_data: { hiring_process_id },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchCandidateJourney Action Error:", error);
    return { success: false, message: error.message };
  }
}


