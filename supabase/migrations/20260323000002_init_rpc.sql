-- ==========================================
-- RPC FUNCTIONS
-- ==========================================

-- Function to fetch a candidate's full hiring journey
CREATE OR REPLACE FUNCTION public.get_hiring_process_details(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_hiring_process_id UUID := (input_data->>'hiring_process_id')::UUID;

    -- Return variable
    return_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'process_info', jsonb_build_object(
            'hiring_process_id', hiring_processes_table.hiring_process_id,
            'hiring_process_status', hiring_processes_table.hiring_process_status,
            'candidate_full_name', candidates_table.candidate_full_name,
            'candidate_avatar_url', candidates_table.candidate_avatar_url,
            'role_title', roles_table.role_title,
            'role_department', roles_table.role_department
        ),
        'steps', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'interview_step_id', interview_steps_table.interview_step_id,
                    'interview_step_name', interview_steps_table.interview_step_name,
                    'interview_step_order_index', interview_steps_table.interview_step_order_index,
                    'interview_step_status', interview_steps_table.interview_step_status,
                    'interview_step_type', interview_steps_table.interview_step_type,
                    'interviews', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'interview_id', interviews_table.interview_id,
                                'interview_start_at', interviews_table.interview_start_at,
                                'interview_end_at', interviews_table.interview_end_at,
                                'interview_status', interviews_table.interview_status,
                                'interview_meeting_link', interviews_table.interview_meeting_link,
                                'interview_interviewer_id', interviews_table.interview_interviewer_id
                            )
                        )
                        FROM public.interviews_table AS interviews_table
                        WHERE interviews_table.interview_step_id = interview_steps_table.interview_step_id
                    )
                ) ORDER BY interview_steps_table.interview_step_order_index ASC
            )
            FROM public.interview_steps_table AS interview_steps_table
            WHERE interview_steps_table.interview_step_hiring_process_id = hiring_processes_table.hiring_process_id
        )
    ) INTO return_data
    FROM public.hiring_processes_table AS hiring_processes_table
    JOIN public.candidates_table AS candidates_table ON hiring_processes_table.hiring_process_candidate_id = candidates_table.candidate_id
    JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id
    WHERE hiring_processes_table.hiring_process_id = input_hiring_process_id;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new hiring process with default steps
CREATE OR REPLACE FUNCTION public.create_hiring_process(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_candidate_id UUID := (input_data->>'hiring_process_candidate_id')::UUID;
    input_role_id UUID := (input_data->>'hiring_process_role_id')::UUID;
    
    -- Function variables
    var_process_id UUID;
    
    -- Return variable
    return_data JSONB;
BEGIN
    -- Create process
    INSERT INTO public.hiring_processes_table (hiring_process_candidate_id, hiring_process_role_id)
    VALUES (input_candidate_id, input_role_id)
    RETURNING hiring_process_id INTO var_process_id;

    -- Add default steps (Example)
    -- Values are now synced with UPPERCASE enum values in INTERVIEW_TYPE
    INSERT INTO public.interview_steps_table (interview_step_hiring_process_id, interview_step_name, interview_step_type, interview_step_order_index)
    VALUES 
        (var_process_id, 'HR Screening', 'SCREENING', 1),
        (var_process_id, 'Technical Assessment', 'TECHNICAL', 2),
        (var_process_id, 'Field Expert Review', 'TECHNICAL', 3);

    SELECT to_jsonb(hiring_processes_table.*) INTO return_data
    FROM public.hiring_processes_table AS hiring_processes_table
    WHERE hiring_processes_table.hiring_process_id = var_process_id;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- Function to schedule an interview for a specific step
CREATE OR REPLACE FUNCTION public.schedule_step_interview(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_step_id UUID := (input_data->>'interview_step_id')::UUID;
    input_interviewer_id UUID := (input_data->>'interview_interviewer_id')::UUID;
    input_start_at TIMESTAMPTZ := (input_data->>'interview_start_at')::TIMESTAMPTZ;
    input_end_at TIMESTAMPTZ := (input_data->>'interview_end_at')::TIMESTAMPTZ;
    input_meeting_link TEXT := (input_data->>'interview_meeting_link')::TEXT;

    -- Return variable
    return_data JSONB;
BEGIN
    -- Values synced with UPPERCASE enum values in INTERVIEW_STATUS
    INSERT INTO public.interviews_table (
        interview_step_id, 
        interview_interviewer_id, 
        interview_start_at, 
        interview_end_at, 
        interview_status,
        interview_meeting_link
    ) VALUES (
        input_step_id, 
        input_interviewer_id, 
        input_start_at, 
        input_end_at, 
        'CONFIRMED',
        input_meeting_link
    )
    RETURNING to_jsonb(public.interviews_table.*) INTO return_data;

    -- Update step status to IN_PROGRESS
    UPDATE public.interview_steps_table AS interview_steps_table
    SET interview_step_status = 'IN_PROGRESS'
    WHERE interview_steps_table.interview_step_id = input_step_id;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- Function to fetch calendar events with details
CREATE OR REPLACE FUNCTION public.get_calendar_events(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_start_date TIMESTAMPTZ := (input_data->>'start_date')::TIMESTAMPTZ;
    input_end_date TIMESTAMPTZ := (input_data->>'end_date')::TIMESTAMPTZ;

    -- Return variable
    return_data JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'interview_id', interviews_table.interview_id,
            'title', interview_steps_table.interview_step_name || ': ' || candidates_table.candidate_full_name,
            'start', interviews_table.interview_start_at,
            'end', interviews_table.interview_end_at,
            'status', interviews_table.interview_status,
            'color', CASE 
                WHEN interviews_table.interview_status = 'COMPLETED' THEN 'teal'
                WHEN interviews_table.interview_status = 'CANCELLED' THEN 'red'
                WHEN interviews_table.interview_status = 'RESCHEDULED' THEN 'indigo'
                ELSE 'blue'
            END,
            'extendedProps', jsonb_build_object(
                'candidate_name', candidates_table.candidate_full_name,
                'interviewer_name', interviewers_table.interviewer_full_name,
                'avatar', candidates_table.candidate_avatar_url,
                'role', roles_table.role_title,
                'type', interview_steps_table.interview_step_type
            )
        )
    ) INTO return_data
    FROM public.interviews_table AS interviews_table
    JOIN public.interview_steps_table AS interview_steps_table ON interviews_table.interview_step_id = interview_steps_table.interview_step_id
    JOIN public.hiring_processes_table AS hiring_processes_table ON interview_steps_table.interview_step_hiring_process_id = hiring_processes_table.hiring_process_id
    JOIN public.candidates_table AS candidates_table ON hiring_processes_table.hiring_process_candidate_id = candidates_table.candidate_id
    JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id
    LEFT JOIN public.interviewers_table AS interviewers_table ON interviews_table.interview_interviewer_id = interviewers_table.interviewer_id
    WHERE (input_start_date IS NULL OR interviews_table.interview_start_at >= input_start_date)
      AND (input_end_date IS NULL OR interviews_table.interview_end_at <= input_end_date);

    RETURN COALESCE(return_data, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Function to fetch candidates portfolio data
CREATE OR REPLACE FUNCTION public.get_candidates_portfolio(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Return variable
    return_data JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'candidate_id', candidates_table.candidate_id,
            'name', candidates_table.candidate_full_name,
            'role', roles_table.role_title,
            'status', hiring_processes_table.hiring_process_status,
            'avatar', candidates_table.candidate_avatar_url,
            'applied_date', hiring_processes_table.hiring_process_created_at
        )
    ) INTO return_data
    FROM public.candidates_table AS candidates_table
    JOIN public.hiring_processes_table AS hiring_processes_table ON candidates_table.candidate_id = hiring_processes_table.hiring_process_candidate_id
    JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id;

    RETURN COALESCE(return_data, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;