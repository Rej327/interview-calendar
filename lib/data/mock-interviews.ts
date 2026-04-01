import { Interview, InterviewStatus, InterviewType, INTERVIEW_STATUS } from "../types/interview";
import dayjs from "dayjs";

const now = dayjs().startOf("day");

export const mockInterviews: Interview[] = [
  {
    id: "1",
    title: "Technical: Sarah Chen",
    candidateName: "Sarah Chen",
    interviewerName: "Alice Walker",
    role: "Senior Frontend Engineer",
    start: now.add(10, "hour").toISOString(),
    end: now.add(11, "hour").toISOString(),
    status: InterviewStatus.CONFIRMED,
    type: InterviewType.TECHNICAL,
  },
  {
    id: "2",
    title: "Culture: Marcus Oliveira",
    candidateName: "Marcus Oliveira",
    interviewerName: "Bob Johnson",
    role: "Product Designer",
    start: now.add(11, "hour").add(30, "minute").toISOString(),
    end: now.add(12, "hour").add(30, "minute").toISOString(),
    status: InterviewStatus.CONFIRMED,
    type: InterviewType.CULTURE,
  },
  {
    id: "3",
    title: "System Design: Anya Sharma",
    candidateName: "Anya Sharma",
    interviewerName: "Charlie Brown",
    role: "Backend Engineer",
    start: now.add(14, "hour").toISOString(),
    end: now.add(15, "hour").toISOString(),
    status: InterviewStatus.PENDING,
    type: InterviewType.TECHNICAL,
  },
  {
    id: "4",
    title: "Leadership: James Whitfield",
    candidateName: "James Whitfield",
    interviewerName: "Alice Walker",
    role: "Engineering Manager",
    start: now.add(16, "hour").toISOString(),
    end: now.add(17, "hour").toISOString(),
    status: InterviewStatus.CONFIRMED,
    type: InterviewType.LEADERSHIP,
  },
  {
    id: "5",
    title: "Screening: Li Wei",
    candidateName: "Li Wei",
    interviewerName: "Bob Johnson",
    role: "Software Developer",
    start: now.add(1, "day").add(9, "hour").toISOString(),
    end: now.add(1, "day").add(9, "hour").add(30, "minute").toISOString(),
    status: InterviewStatus.SCHEDULED,
    type: InterviewType.SCREENING,
  },
  {
    id: "6",
    title: "Technical: Emma Watson",
    candidateName: "Emma Watson",
    interviewerName: "Alice Walker",
    role: "Data Scientist",
    start: now.add(1, "day").add(11, "hour").toISOString(),
    end: now.add(1, "day").add(12, "hour").toISOString(),
    status: InterviewStatus.SCHEDULED,
    type: InterviewType.TECHNICAL,
  },
  {
    id: "7",
    title: "Culture: Carlos Ruiz",
    candidateName: "Carlos Ruiz",
    interviewerName: "Bob Johnson",
    role: "Marketing Manager",
    start: now.subtract(1, "day").add(10, "hour").toISOString(),
    end: now.subtract(1, "day").add(11, "hour").toISOString(),
    status: InterviewStatus.COMPLETED,
    type: InterviewType.CULTURE,
  },
];

export const getStatusColor = (status: INTERVIEW_STATUS) => {
  switch (status) {
    case InterviewStatus.SCHEDULED: return "var(--mantine-color-blue-6)";
    case InterviewStatus.CONFIRMED: return "var(--mantine-color-teal-6)";
    case InterviewStatus.PENDING: return "var(--mantine-color-yellow-6)";
    case InterviewStatus.COMPLETED: return "var(--mantine-color-gray-5)";
    case InterviewStatus.CANCELLED: return "var(--mantine-color-red-6)";
    case InterviewStatus.RESCHEDULED: return "var(--mantine-color-indigo-6)";
    default: return "var(--mantine-color-blue-6)";
  }
};
