import { NextRequest, NextResponse } from "next/server";
import { deleteInterview } from "@/app/actions/delete";

export async function deleteEventHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const interview_id = searchParams.get("interview_id");

  if (!interview_id) {
    return NextResponse.json({ success: false, message: "interview_id is required" }, { status: 400 });
  }

  const result = await deleteInterview(interview_id);
  
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
