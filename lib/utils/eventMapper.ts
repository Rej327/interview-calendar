import { INTERVIEW_STATUS, INTERVIEW_TYPE } from "../types/types";
import { CalendarEvent } from "../types/interview";

/**
 * Maps the output of the `get_calendar_events` Supabase RPC function 
 * to the FullCalendar event structure used by our frontend components.
 */
export function mapSupabaseToCalendarEvent(supabaseEvent: any): CalendarEvent {
  // Mapping the status to our Mantine-based color tokens for visual excellence
  const statusColors: Record<string, string> = {
    'COMPLETED': 'var(--mantine-color-teal-6)',
    'CANCELLED': 'var(--mantine-color-red-6)',
    'RESCHEDULED': 'var(--mantine-color-indigo-6)',
    'CONFIRMED': 'var(--mantine-color-blue-6)',
    'SCHEDULED': 'var(--mantine-color-blue-6)',
    'PENDING': 'var(--mantine-color-gray-6)',
  };

  const backgroundColor = statusColors[supabaseEvent.status] || 'var(--mantine-color-blue-6)';

  return {
    id: supabaseEvent.interview_id,
    title: supabaseEvent.title,
    start: supabaseEvent.start,
    end: supabaseEvent.end,
    backgroundColor: backgroundColor,
    extendedProps: {
      candidate: supabaseEvent.extendedProps?.candidate_name || "Unknown Candidate",
      interviewer: supabaseEvent.extendedProps?.interviewer_name || "Unassigned",
      role: supabaseEvent.extendedProps?.role || "Position TBD",
      status: supabaseEvent.status as INTERVIEW_STATUS,
      type: supabaseEvent.extendedProps?.type as INTERVIEW_TYPE || "TECHNICAL", 
      avatar: supabaseEvent.extendedProps?.avatar,
    },
    borderColor: 'transparent',
    textColor: 'white',
  };
}

/**
 * Maps an array of Supabase RPC events to FullCalendar event structure.
 */
export function mapSupabaseToCalendarEvents(supabaseEvents: any[]): CalendarEvent[] {
  if (!supabaseEvents || !Array.isArray(supabaseEvents)) return [];
  return supabaseEvents.map(mapSupabaseToCalendarEvent);
}
