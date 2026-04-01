import { Database } from "./database";

//ENUMS
export type INTERVIEW_STATUS = Database["public"]["Enums"]["interview_status"];
export type INTERVIEW_TYPE = Database["public"]["Enums"]["interview_type"];
export type HIRING_PROCESS_STATUS =
  Database["public"]["Enums"]["hiring_process_status"];
export type STEP_STATUS = Database["public"]["Enums"]["step_status"];

//ENUMS CONSTANTS
export const InterviewStatus: Record<string, INTERVIEW_STATUS> = {
  SCHEDULED: "SCHEDULED",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  PENDING: "PENDING",
  RESCHEDULED: "RESCHEDULED",
};

export const InterviewType: Record<string, INTERVIEW_TYPE> = {
  DEPARTMENT: "DEPARTMENT",
  REQUESTOR: "REQUESTOR",
  HR: "HR",
};



export const HiringProcessStatus: Record<string, HIRING_PROCESS_STATUS> = {
  ACTIVE: "ACTIVE",
  HIRED: "HIRED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
  POOLING: "POOLING",
};

export const StepStatus: Record<string, STEP_STATUS> = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  SKIPPED: "SKIPPED",
  FAILED: "FAILED",
};

// TABLES
export type CandidateTableRow =
  Database["public"]["Tables"]["candidates_table"]["Row"];
export type CandidateTableInsert =
  Database["public"]["Tables"]["candidates_table"]["Insert"];
export type CandidateTableUpdate =
  Database["public"]["Tables"]["candidates_table"]["Update"];

export type HiringProcessTableRow =
  Database["public"]["Tables"]["hiring_processes_table"]["Row"];
export type HiringProcessTableInsert =
  Database["public"]["Tables"]["hiring_processes_table"]["Insert"];
export type HiringProcessTableUpdate =
  Database["public"]["Tables"]["hiring_processes_table"]["Update"];

export type InterviewStepTableRow =
  Database["public"]["Tables"]["interview_steps_table"]["Row"];
export type InterviewStepTableInsert =
  Database["public"]["Tables"]["interview_steps_table"]["Insert"];
export type InterviewStepTableUpdate =
  Database["public"]["Tables"]["interview_steps_table"]["Update"];

export type InterviewsTableRow =
  Database["public"]["Tables"]["interviews_table"]["Row"];
export type InterviewsTableInsert =
  Database["public"]["Tables"]["interviews_table"]["Insert"];
export type InterviewsTableUpdate =
  Database["public"]["Tables"]["interviews_table"]["Update"];

export type InterviewersTableRow =
  Database["public"]["Tables"]["interviewers_table"]["Row"];
export type InterviewersTableInsert =
  Database["public"]["Tables"]["interviewers_table"]["Insert"];
export type InterviewersTableUpdate =
  Database["public"]["Tables"]["interviewers_table"]["Update"];

export type RoleTableRow = Database["public"]["Tables"]["roles_table"]["Row"];
export type RoleTableInsert =
  Database["public"]["Tables"]["roles_table"]["Insert"];
export type RoleTableUpdate =
  Database["public"]["Tables"]["roles_table"]["Update"];
