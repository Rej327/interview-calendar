import { NextRequest, NextResponse } from "next/server";
import { fetchCalendarEvents } from "@/app/actions/get";

export async function fetchEventHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;

  const result = await fetchCalendarEvents(start_date, end_date);
  
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
