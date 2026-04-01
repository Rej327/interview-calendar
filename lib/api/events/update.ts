import { NextRequest, NextResponse } from "next/server";
import { updateInterview } from "@/app/actions/update";

/**
 * Update an existing interview session's status or details.
 * 
 * @endpoint PATCH /api/events
 * @requestBody {
 *   interview_id: string (required),
 *   interview_status: string (optional),
 *   interview_notes: string (optional),
 *   interview_start_at: string (optional, ISO 8601),
 *   interview_end_at: string (optional, ISO 8601)
 * }
 * @returns {Promise<NextResponse>} 200 Success | 400 Validation Error | 500 Server Error
 */
export async function updateEventHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { interview_id, ...updates } = body;

    // Validation
    if (!interview_id) {
      return NextResponse.json({ success: false, message: "interview_id is required" }, { status: 400 });
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "No update fields provided" }, { status: 400 });
    }

    const result = await updateInterview(interview_id, updates);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }
}
