import { NextRequest, NextResponse } from "next/server";
import { scheduleInterview } from "@/app/actions/post";

/**
 * Schedule a new interview session.
 * 
 * @endpoint POST /api/events
 * @requestBody {
 *   interview_step_id: string (required),
 *   interview_interviewer_id: string (required),
 *   interview_start_at: string (required, ISO 8601),
 *   interview_end_at: string (required, ISO 8601),
 *   interview_meeting_link: string (optional)
 * }
 * @returns {Promise<NextResponse>} 201 Success | 400 Validation Error | 500 Server Error
 */
export async function createEventHandler(req: NextRequest) {
  try {
    const body = await req.json();

    // Input Validation
    const requiredFields = [
      "interview_step_id",
      "interview_interviewer_id",
      "interview_start_at",
      "interview_end_at",
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const result = await scheduleInterview(body);
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }
}
