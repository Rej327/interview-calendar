import { NextResponse } from "next/server";
import { fetchCandidates } from "@/app/actions/get";

/**
 * Fetch candidates portfolio data.
 * 
 * @endpoint GET /api/candidates
 * @returns {Promise<NextResponse>} Success: { success: true, data: any[] } | Error: { success: false, message: string }
 */
export async function GET() {
  const result = await fetchCandidates();
  
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
