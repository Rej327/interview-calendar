import { NextRequest, NextResponse } from "next/server";
import { updateInterview } from "@/app/actions/update";

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
