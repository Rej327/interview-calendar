import { NextRequest } from "next/server";
import { 
  fetchEventHandler, 
  createEventHandler, 
  updateEventHandler, 
  deleteEventHandler 
} from "@/lib/api/events";

/**
 * Next.js API Route for /api/events
 */

export async function GET(req: NextRequest) {
  return await fetchEventHandler(req);
}

export async function POST(req: NextRequest) {
  return await createEventHandler(req);
}

export async function PATCH(req: NextRequest) {
  return await updateEventHandler(req);
}

export async function DELETE(req: NextRequest) {
  return await deleteEventHandler(req);
}
