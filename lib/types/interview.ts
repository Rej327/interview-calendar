import { 
  InterviewStatus, 
  InterviewType, 
  HiringProcessStatus, 
  StepStatus,
  INTERVIEW_STATUS,
  INTERVIEW_TYPE,
  HIRING_PROCESS_STATUS,
  STEP_STATUS
} from './types';

export interface Interview {
  id: string;
  title: string;
  candidateName: string;
  interviewerName: string;
  role: string;
  start: string; // ISO 8601 string
  end: string;   // ISO 8601 string
  status: INTERVIEW_STATUS;
  type: INTERVIEW_TYPE;
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
    status: INTERVIEW_STATUS;
    type: INTERVIEW_TYPE;
    avatar?: string;
  };
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export { 
  InterviewStatus, 
  InterviewType, 
  HiringProcessStatus, 
  StepStatus,
  type INTERVIEW_STATUS,
  type INTERVIEW_TYPE,
  type HIRING_PROCESS_STATUS,
  type STEP_STATUS
};
