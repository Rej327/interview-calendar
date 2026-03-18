export interface Interview {
  id: string;
  title: string;
  candidateName: string;
  interviewerName: string;
  role: string;
  start: string; // ISO 8601 string
  end: string;   // ISO 8601 string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "pending";
  type: "technical" | "behavioral" | "screening" | "leadership" | "culture";
  notes?: string;
  color?: string; // Optional color override for the calendar
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    candidate: string;
    interviewer: string;
    role: string;
    status: Interview["status"];
    type: Interview["type"];
  };
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}
