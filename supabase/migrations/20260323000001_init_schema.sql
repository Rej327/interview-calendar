-- ==========================================
-- TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.candidates_table (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_full_name TEXT NOT NULL,
    candidate_email TEXT UNIQUE NOT NULL,
    candidate_avatar_url TEXT,
    candidate_created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interviewers_table (
    interviewer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewer_full_name TEXT NOT NULL,
    interviewer_email TEXT UNIQUE NOT NULL,
    interviewer_avatar_url TEXT,
    interviewer_created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles_table (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_title TEXT UNIQUE NOT NULL,
    role_department TEXT,
    role_created_at TIMESTAMPTZ DEFAULT now()
);

-- Hiring Process links a candidate to a role and tracks the overall journey
CREATE TABLE IF NOT EXISTS public.hiring_processes_table (
    hiring_process_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hiring_process_status TEXT DEFAULT 'ACTIVE',
    hiring_process_created_at TIMESTAMPTZ DEFAULT now()
);

-- Interview Steps define the sequence of evaluations
CREATE TABLE IF NOT EXISTS public.interview_steps_table (
    interview_step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_step_name TEXT NOT NULL, -- e.g. "Technical Round 1", "HR Screening"
    interview_step_type public.interview_type NOT NULL,
    interview_step_order_index INTEGER NOT NULL, -- The sequence in the process
    interview_step_status TEXT DEFAULT 'PENDING',
    interview_step_created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(interview_step_hiring_process_id, interview_step_order_index)
);

-- Interviews are the actual sessions scheduled for a session/step
CREATE TABLE IF NOT EXISTS public.interviews_table (
    interview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_start_at TIMESTAMPTZ NOT NULL,
    interview_end_at TIMESTAMPTZ NOT NULL,
    interview_status TEXT DEFAULT 'PENDING',
    interview_notes TEXT,
    interview_meeting_link TEXT,
    interview_created_at TIMESTAMPTZ DEFAULT now()
);


