"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";

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

export async function sendCandidateInvite(input_data: { candidate_ids: string[]; platform?: string }) {
  try {
    const { candidate_ids, platform } = input_data;
    if (!candidate_ids || candidate_ids.length === 0) return { success: false, message: "No recipients provided." };

    // 1. Fetch candidate emails and role details from Supabase
    const { data: candidates, error } = await supabaseAdmin
      .from('candidates_table')
      .select('candidate_id, candidate_full_name, candidate_email, hiring_processes_table!inner(roles_table!inner(role_title))')
      .in('candidate_id', candidate_ids);

    if (error) throw error;
    if (!candidates || candidates.length === 0) throw new Error("Recipients not found in database.");

    const fromEmail = "Recruitment Team <onboarding@resend.dev>"; 
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://interview-calendar.vercel.app";
    
    // 2. Dispatch emails using Resend
    if (candidates.length > 1) {
      const batchRequests = candidates.map(c => {
        const roleTitle = (c as any).hiring_processes_table?.[0]?.roles_table?.role_title || "Specialized Position";
        const applyLink = `${appBaseUrl}/apply/${c.candidate_id}`;
        
        return {
          from: fromEmail,
          to: [c.candidate_email],
          subject: `Opportunity: ${roleTitle} - Interview Calendar Team`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <h2>Hello ${c.candidate_full_name.split(' ')[0]},</h2>
                <p>We're thrilled to invite you to join our recruitment pipeline for the <strong>${roleTitle}</strong> position!</p>
                <p>To move forward, please complete your profile and initial assessment through our candidate portal:</p>
                <div style="margin: 30px 0;">
                    <a href="${applyLink}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Application Form</a>
                </div>
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>Best regards,<br/>Interview Calendar Team</p>
            </div>
          `,
        };
      });

      const { data: batchResult, error: batchError } = await resend.batch.send(batchRequests as any);
      if (batchError) throw batchError;
      
      return { 
        success: true, 
        message: `Invitations for ${candidates.length} candidates have been sent.` 
      };
    } else {
      // Single email
      const c = candidates[0];
      const roleTitle = (c as any).hiring_processes_table?.[0]?.roles_table?.role_title || "Specialized Position";
      const applyLink = `${appBaseUrl}/apply/${c.candidate_id}`;

      const { data: singleResult, error: singleError } = await resend.emails.send({
        from: fromEmail,
        to: [c.candidate_email],
        subject: `Invitation for ${roleTitle} Position`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <h2>Hi ${c.candidate_full_name.split(' ')[0]},</h2>
              <p>We've reviewed your credentials and would love to invite you to apply for the <strong>${roleTitle}</strong> role.</p>
              <p>Please use the button below to start your application journey:</p>
              <div style="margin: 30px 0;">
                  <a href="${applyLink}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Your Application</a>
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #666;">This invitation was dispatched via our automated recruitment pipeline.</p>
          </div>
        `,
      });

      if (singleError) throw singleError;

      return { 
        success: true, 
        message: `An invitation has been sent to ${c.candidate_full_name}.` 
      };
    }
  } catch (error: any) {
    console.error("sendCandidateInvite Action Error:", error);
    return { success: false, message: "We couldn't send the invitation right now. Please try again." };
  }
}
