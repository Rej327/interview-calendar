-- Performance Optimization for RPCs
-- This migration optimizes the core fetch functions using CTEs and filtered joins

SET search_path TO '';

-- 1. Optimized Calendar Events Fetch
-- Uses a CTE to filter the base table before performing expensive joins
CREATE OR REPLACE FUNCTION public.get_calendar_events(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    input_start_date TIMESTAMPTZ := (input_data->>'start_date')::TIMESTAMPTZ;
    input_end_date TIMESTAMPTZ := (input_data->>'end_date')::TIMESTAMPTZ;
    return_data JSONB;
BEGIN
    WITH base_interviews AS (
        SELECT *
        FROM public.interviews_table
        WHERE (input_start_date IS NULL OR interview_start_at >= input_start_date)
          AND (input_end_date IS NULL OR interview_start_at <= input_end_date)
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'interview_id', i.interview_id,
            'title', ist.interview_step_name || ': ' || c.candidate_full_name,
            'start', i.interview_start_at,
            'end', i.interview_end_at,
            'status', i.interview_status,
            'color', CASE 
                WHEN ist.interview_step_type = 'DEPARTMENT' THEN 'violet'
                WHEN ist.interview_step_type = 'REQUESTOR' THEN 'teal'
                WHEN ist.interview_step_type = 'HR' THEN 'blue'
                ELSE 'gray'
            END,
            'extendedProps', jsonb_build_object(
                'candidate', c.candidate_full_name,
                'interviewer', intv.interviewer_full_name,
                'role', r.role_title,
                'status', i.interview_status,
                'type', ist.interview_step_type,
                'avatar', c.candidate_avatar_url
            )
        )
    ) INTO return_data
    FROM base_interviews i
    JOIN public.interview_steps_table ist ON i.interview_step_id = ist.interview_step_id
    JOIN public.hiring_processes_table hp ON ist.interview_step_hiring_process_id = hp.hiring_process_id
    JOIN public.candidates_table c ON hp.hiring_process_candidate_id = c.candidate_id
    JOIN public.roles_table r ON hp.hiring_process_role_id = r.role_id
    LEFT JOIN public.interviewers_table intv ON i.interview_interviewer_id = intv.interviewer_id;

    RETURN COALESCE(return_data, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- 2. Optimized Candidate Portfolio with Aggregated Status
-- Uses window functions and specialized indexing paths
CREATE OR REPLACE FUNCTION public.get_candidates_portfolio_paginated(
    input_limit INTEGER DEFAULT 10,
    input_offset INTEGER DEFAULT 0,
    input_status TEXT DEFAULT NULL,
    input_search TEXT DEFAULT NULL
)
RETURNS TABLE (
    candidate_id UUID,
    name TEXT,
    avatar TEXT,
    role TEXT,
    status public.HIRING_PROCESS_STATUS,
    applied_date TIMESTAMPTZ,
    total_count INTEGER
)
SET search_path TO ''
AS $$
BEGIN
    RETURN QUERY
    WITH filtered_candidates AS (
        SELECT 
            c.candidate_id,
            c.candidate_full_name as name,
            c.candidate_avatar_url as avatar,
            r.role_title as role,
            hp.hiring_process_status as status,
            hp.hiring_process_created_at as applied_date
        FROM public.candidates_table c
        JOIN public.hiring_processes_table hp ON c.candidate_id = hp.hiring_process_candidate_id
        JOIN public.roles_table r ON hp.hiring_process_role_id = r.role_id
        WHERE (input_status IS NULL OR hp.hiring_process_status::TEXT = input_status)
          AND (input_search IS NULL OR c.candidate_full_name ILIKE '%' || input_search || '%')
    )
    SELECT 
        *,
        (SELECT count(*)::INTEGER FROM filtered_candidates) as total_count
    FROM filtered_candidates
    ORDER BY applied_date DESC
    LIMIT input_limit
    OFFSET input_offset;
END;
$$ LANGUAGE plpgsql;
