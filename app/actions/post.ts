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
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // 2. Dispatch emails using Resend
    if (candidates.length > 1) {
      const batchRequests = candidates.map(c => {
        const roleTitle = (c as any).hiring_processes_table?.[0]?.roles_table?.role_title || "Specialized Position";
        const applyLink = `${appBaseUrl}/apply/${c.candidate_id}`;
        
        return {
          from: fromEmail,
          to: [c.candidate_email],
          subject: `Opportunity: ${roleTitle} - Global Recruitment`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #1a73e8; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Join Our Journey</h1>
                </div>
                <div style="padding: 40px; background-color: white;">
                    <h2 style="color: #1a73e8; margin-top: 0;">Hello ${c.candidate_full_name.split(' ')[0]},</h2>
                    ${platform && ["LinkedIn", "Indeed", "Glassdoor"].includes(platform) 
                        ? `<p style="font-size: 16px;">We recently came across your professional profile on <strong>${platform}</strong> and were incredibly impressed by your background.</p>`
                        : `<p style="font-size: 16px;">We're thrilled to invite you to join our recruitment pipeline for the <strong>${roleTitle}</strong> position!</p>`
                    }
                    <p style="font-size: 16px;">We'd love to invite you to join our recruitment pipeline for the <strong>${roleTitle}</strong> role. Our team believes you could be a fantastic fit for our organization.</p>
                    <div style="margin: 40px 0; text-align: center;">
                        <a href="${applyLink}" style="background-color: #1a73e8; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">View Opportunity & Apply</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">If the button above doesn't work, copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #1a73e8;">${applyLink}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 14px;">Best regards,<br/><strong>The Recruitment Team</strong></p>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>This invitation was sent via our automated recruitment platform.</p>
                </div>
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
        subject: `Exclusive Invitation: ${roleTitle} Position`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #1a73e8; padding: 40px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Career Opportunity</h1>
              </div>
              <div style="padding: 40px; background-color: white;">
                  <h2 style="color: #1a73e8; margin-top: 0;">Hi ${c.candidate_full_name.split(' ')[0]},</h2>
                  ${platform && ["LinkedIn", "Indeed", "Glassdoor"].includes(platform)
                      ? `<p style="font-size: 16px;">We've reviewed your credentials on <strong>${platform}</strong> and would love to officially invite you to apply for the <strong>${roleTitle}</strong> role.</p>`
                      : `<p style="font-size: 16px;">We've reviewed your credentials and would love to invite you to officially apply for the <strong>${roleTitle}</strong> role.</p>`
                  }
                  <p style="font-size: 16px;">Please use the button below to start your application journey and learn more about this position:</p>
                  <div style="margin: 40px 0; text-align: center;">
                      <a href="${applyLink}" style="background-color: #1a73e8; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">Access Application Portal</a>
                  </div>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                  <p style="font-size: 12px; color: #666; text-align: center;">This invitation was dispatched via our automated recruitment pipeline.</p>
              </div>
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
