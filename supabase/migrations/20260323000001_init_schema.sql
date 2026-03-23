-- Refined Schema for Interview Calendar
-- Following PL/pgSQL RPC Coding Conventions
-- Convention: Table names end with _table, Column names prefixed with table name
-- Enum standard: All enum values are UPPERCASE

SET search_path TO '';

-- ==========================================
-- TYPES
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'INTERVIEW_STATUS') THEN
        CREATE TYPE public.INTERVIEW_STATUS AS ENUM (
            'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'PENDING'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'INTERVIEW_TYPE') THEN
        CREATE TYPE public.INTERVIEW_TYPE AS ENUM (
            'TECHNICAL', 'BEHAVIORAL', 'SCREENING', 'LEADERSHIP', 'CULTURE'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HIRING_PROCESS_STATUS') THEN
        CREATE TYPE public.HIRING_PROCESS_STATUS AS ENUM (
            'ACTIVE', 'HIRED', 'REJECTED', 'WITHDRAWN', 'POOLING'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'STEP_STATUS') THEN
        CREATE TYPE public.STEP_STATUS AS ENUM (
            'PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'FAILED'
        );
    END IF;
END $$;

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
    hiring_process_candidate_id UUID REFERENCES public.candidates_table(candidate_id) ON DELETE CASCADE,
    hiring_process_role_id UUID REFERENCES public.roles_table(role_id) ON DELETE CASCADE,
    hiring_process_status public.hiring_process_status DEFAULT 'ACTIVE',
    hiring_process_created_at TIMESTAMPTZ DEFAULT now()
);

-- Interview Steps define the sequence of evaluations
CREATE TABLE IF NOT EXISTS public.interview_steps_table (
    interview_step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_step_hiring_process_id UUID REFERENCES public.hiring_processes_table(hiring_process_id) ON DELETE CASCADE,
    interview_step_name TEXT NOT NULL, -- e.g. "Technical Round 1", "HR Screening"
    interview_step_type public.interview_type NOT NULL,
    interview_step_order_index INTEGER NOT NULL, -- The sequence in the process
    interview_step_status public.step_status DEFAULT 'PENDING',
    interview_step_created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(interview_step_hiring_process_id, interview_step_order_index)
);

-- Interviews are the actual sessions scheduled for a session/step
CREATE TABLE IF NOT EXISTS public.interviews_table (
    interview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_step_id UUID REFERENCES public.interview_steps_table(interview_step_id) ON DELETE CASCADE,
    interview_interviewer_id UUID REFERENCES public.interviewers_table(interviewer_id) ON DELETE SET NULL,
    interview_start_at TIMESTAMPTZ NOT NULL,
    interview_end_at TIMESTAMPTZ NOT NULL,
    interview_status public.interview_status DEFAULT 'PENDING',
    interview_notes TEXT,
    interview_meeting_link TEXT,
    interview_created_at TIMESTAMPTZ DEFAULT now()
);


