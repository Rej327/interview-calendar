import { NextRequest, NextResponse } from "next/server";
import { deleteInterview } from "@/app/actions/delete";

/**
 * Delete an existing interview session.
 * 
 * @endpoint DELETE /api/events
 * @param {string} interview_id - ID of the interview session to delete (Query Param).
 * @returns {Promise<NextResponse>} 200 Success | 400 Validation Error | 500 Server Error
 */
export async function deleteEventHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const interview_id = searchParams.get("interview_id");

  // Validation
  if (!interview_id || interview_id.trim() === "") {
    return NextResponse.json({ success: false, message: "interview_id query parameter is required" }, { status: 400 });
  }

  const result = await deleteInterview(interview_id);
  
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
