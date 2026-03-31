-- RPC to quickly add an interview by names/titles
CREATE OR REPLACE FUNCTION public.quick_add_interview(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_candidate_name TEXT := (input_data->>'candidate_name');
    input_interviewer_name TEXT := (input_data->>'interviewer_name');
    input_role_title TEXT := (input_data->>'role_title');
    input_type public.INTERVIEW_TYPE := (input_data->>'type')::public.INTERVIEW_TYPE;
    input_start_at TIMESTAMPTZ := (input_data->>'start_at')::TIMESTAMPTZ;
    input_end_at TIMESTAMPTZ := (input_data->>'end_at')::TIMESTAMPTZ;
    input_meeting_link TEXT := (input_data->>'meeting_link');

    -- Local IDs

    var_candidate_id UUID;
    var_interviewer_id UUID;
    var_role_id UUID;
    var_hiring_process_id UUID;
    var_step_id UUID;
    var_interview_id UUID;

    -- Return variable
    return_data JSONB;
BEGIN
    -- 1. Find or Create Candidate
    SELECT candidate_id INTO var_candidate_id FROM public.candidates_table WHERE candidate_full_name = input_candidate_name LIMIT 1;
    IF var_candidate_id IS NULL THEN
        INSERT INTO public.candidates_table (candidate_full_name, candidate_email)
        VALUES (input_candidate_name, lower(replace(input_candidate_name, ' ', '.')) || '@example.com')
        RETURNING candidate_id INTO var_candidate_id;
    END IF;

    -- 2. Find or Create Role
    SELECT role_id INTO var_role_id FROM public.roles_table WHERE role_title = input_role_title LIMIT 1;
    IF var_role_id IS NULL THEN
        INSERT INTO public.roles_table (role_title, role_department)
        VALUES (input_role_title, 'General')
        RETURNING role_id INTO var_role_id;
    END IF;

    -- 3. Find or Create Hiring Process
    SELECT hiring_process_id INTO var_hiring_process_id FROM public.hiring_processes_table 
    WHERE hiring_process_candidate_id = var_candidate_id AND hiring_process_role_id = var_role_id LIMIT 1;
    IF var_hiring_process_id IS NULL THEN
        INSERT INTO public.hiring_processes_table (hiring_process_candidate_id, hiring_process_role_id)
        VALUES (var_candidate_id, var_role_id)
        RETURNING hiring_process_id INTO var_hiring_process_id;
    END IF;

    -- 4. Find or Create Interview Step
    SELECT interview_step_id INTO var_step_id FROM public.interview_steps_table 
    WHERE interview_step_hiring_process_id = var_hiring_process_id AND interview_step_type = input_type LIMIT 1;
    IF var_step_id IS NULL THEN
        INSERT INTO public.interview_steps_table (interview_step_hiring_process_id, interview_step_name, interview_step_type, interview_step_order_index)
        VALUES (var_hiring_process_id, initcap(input_type::text) || ' Round', input_type, 1)
        RETURNING interview_step_id INTO var_step_id;
    END IF;

    -- 5. Find or Create Interviewer
    SELECT interviewer_id INTO var_interviewer_id FROM public.interviewers_table WHERE interviewer_full_name = input_interviewer_name LIMIT 1;
    IF var_interviewer_id IS NULL THEN
        INSERT INTO public.interviewers_table (interviewer_full_name, interviewer_email, interviewer_role_id)
        VALUES (input_interviewer_name, lower(replace(input_interviewer_name, ' ', '.')) || '@construction-corp.com', var_role_id)
        RETURNING interviewer_id INTO var_interviewer_id;
    END IF;


    -- 6. Insert Interview
    INSERT INTO public.interviews_table (
        interview_step_id, 
        interview_interviewer_id, 
        interview_start_at, 
        interview_end_at, 
        interview_status,
        interview_meeting_link
    ) VALUES (
        var_step_id, 
        var_interviewer_id, 
        input_start_at, 
        input_end_at, 
        'CONFIRMED',
        input_meeting_link
    )
    RETURNING interview_id INTO var_interview_id;

    -- Prepare return data (similar to get_calendar_events structure)
    SELECT jsonb_build_object(
        'interview_id', var_interview_id,
        'title', initcap(replace(input_type::text, '_', ' ')) || ' Interview: ' || input_candidate_name,
        'start', input_start_at,
        'end', input_end_at,
        'status', 'CONFIRMED',
        'color', CASE 
            WHEN input_type = 'DEPARTMENT' THEN 'violet'
            WHEN input_type = 'REQUESTOR' THEN 'teal'
            WHEN input_type = 'HR' THEN 'blue'
            ELSE 'gray'
        END,
        'extendedProps', jsonb_build_object(
            'candidate_name', input_candidate_name,
            'interviewer_name', input_interviewer_name,
            'role', input_role_title,
            'avatar', NULL,
            'type', input_type,
            'meeting_link', input_meeting_link
        )

    ) INTO return_data;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;

