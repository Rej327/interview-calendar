import { NextRequest, NextResponse } from "next/server";
import { fetchCalendarEvents } from "@/app/actions/get";

/**
 * Fetch calendar events within a specified date range.
 * 
 * @endpoint GET /api/events
 * @param {string} [start_date] - Filter events starting from this date (ISO 8601).
 * @param {string} [end_date] - Filter events up to this date (ISO 8601).
 * @returns {Promise<NextResponse>} Success: { success: true, data: Event[] } | Error: { success: false, message: string }
 */
export async function fetchEventHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;

  // Optional Validation for Date Formats
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (start_date && !isoDateRegex.test(start_date)) {
    return NextResponse.json({ success: false, message: "Invalid start_date format" }, { status: 400 });
  }
  if (end_date && !isoDateRegex.test(end_date)) {
    return NextResponse.json({ success: false, message: "Invalid end_date format" }, { status: 400 });
  }

  const result = await fetchCalendarEvents(start_date, end_date);
  
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
