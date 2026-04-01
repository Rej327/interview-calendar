# Events API Overview

This directory contains the modular handlers for the `/api/events` endpoint.

## Endpoint Structure

| Method | Endpoint | Description | Action Logic |
|--------|----------|-------------|--------------|
| GET    | `/api/events` | Fetch calendar events | calls `fetchCalendarEvents` |
| POST   | `/api/events` | Schedule new interview | calls `scheduleInterview` |
| PATCH  | `/api/events` | Update interview details | calls `updateInterview` |
| DELETE | `/api/events` | Remove interview session | calls `deleteInterview` |

## Data Models

### POST Request Body
```json
{
  "interview_step_id": "UUID",
  "interview_interviewer_id": "UUID",
  "interview_start_at": "ISO-TIMESTAMP",
  "interview_end_at": "ISO-TIMESTAMP",
  "interview_meeting_link": "URL (optional)"
}
```

### PATCH Request Body
```json
{
  "interview_id": "UUID",
  "interview_status": "PENDING | CONFIRMED | COMPLETED | CANCELLED | RESCHEDULED",
  "interview_notes": "String",
  "interview_start_at": "ISO-TIMESTAMP",
  "interview_end_at": "ISO-TIMESTAMP"
}
```

## Error Handling

Standard error response structure:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

Common HTTP Codes:
- `200/201`: Success
- `400`: Validation failure or malformed JSON
- `500`: Internal server error (Database or RPC failure)
