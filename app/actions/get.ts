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

export async function fetchCandidateForInvite(candidate_id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('candidates_table')
      .select('candidate_id, candidate_full_name, candidate_email, hiring_processes_table!inner(roles_table!inner(role_title, role_department))')
      .eq('candidate_id', candidate_id)
      .single();

    if (error) throw error;
    
    // Flatten the data for easier use
    const roleDetails = (data as any).hiring_processes_table?.[0]?.roles_table || {};
    
    return { 
      success: true, 
      data: {
        id: data.candidate_id,
        name: data.candidate_full_name,
        email: data.candidate_email,
        role: roleDetails.role_title || "Specialized Position",
        department: roleDetails.role_department || "Recruitment"
      } 
    };
  } catch (error: any) {
    console.error("fetchCandidateForInvite Action Error:", error);
    return { success: false, message: error.message };
  }
}
