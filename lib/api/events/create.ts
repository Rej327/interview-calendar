import { NextRequest, NextResponse } from "next/server";
import { scheduleInterview } from "@/app/actions/post";

export async function createEventHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await scheduleInterview(body);
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
