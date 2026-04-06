-- Function to update candidate and their hiring process status
CREATE OR REPLACE FUNCTION public.update_candidate(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_candidate_id UUID := (input_data->>'candidate_id')::UUID;
    input_full_name TEXT := (input_data->>'full_name');
    input_email TEXT := (input_data->>'email');
    input_avatar_url TEXT := (input_data->>'avatar_url');
    input_status TEXT := (input_data->>'status');
    input_role_id UUID := (input_data->>'role_id')::UUID;
    
    -- Return variable
    return_data JSONB;
BEGIN
    -- 1. Update candidate info if provided
    IF input_full_name IS NOT NULL OR input_email IS NOT NULL OR input_avatar_url IS NOT NULL THEN
        UPDATE public.candidates_table
        SET 
            candidate_full_name = COALESCE(input_full_name, candidate_full_name),
            candidate_email = COALESCE(input_email, candidate_email),
            candidate_avatar_url = COALESCE(input_avatar_url, candidate_avatar_url)
        WHERE candidate_id = input_candidate_id;
    END IF;

    -- 2. Update hiring process if status or role_id is provided
    IF input_status IS NOT NULL OR input_role_id IS NOT NULL THEN
        UPDATE public.hiring_processes_table
        SET 
            hiring_process_status = COALESCE(input_status::public.HIRING_PROCESS_STATUS, hiring_process_status),
            hiring_process_role_id = COALESCE(input_role_id, hiring_process_role_id)
        WHERE hiring_process_candidate_id = input_candidate_id;
    END IF;

    -- Construct return data (synced with get_candidates_portfolio)
    SELECT jsonb_build_object(
        'candidate_id', candidates_table.candidate_id,
        'hiring_process_id', hiring_processes_table.hiring_process_id,
        'name', candidates_table.candidate_full_name,
        'email', candidates_table.candidate_email,
        'role', roles_table.role_title,
        'status', hiring_processes_table.hiring_process_status,
        'avatar', candidates_table.candidate_avatar_url,
        'applied_date', hiring_processes_table.hiring_process_created_at
    ) INTO return_data
    FROM public.candidates_table AS candidates_table
    JOIN public.hiring_processes_table AS hiring_processes_table ON candidates_table.candidate_id = hiring_processes_table.hiring_process_candidate_id
    JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id
    WHERE candidates_table.candidate_id = input_candidate_id;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- Redefine get_candidates_portfolio to include email
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
            'hiring_process_id', hiring_processes_table.hiring_process_id,
            'name', candidates_table.candidate_full_name,
            'email', candidates_table.candidate_email,
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

-- Redefine create_candidate to include email
CREATE OR REPLACE FUNCTION public.create_candidate(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_full_name TEXT := (input_data->>'full_name');
    input_email TEXT := (input_data->>'email');
    input_avatar_url TEXT := (input_data->>'avatar_url');
    input_role_id UUID := (input_data->>'role_id')::UUID;
    
    -- Function variables
    var_candidate_id UUID;
    var_process_id UUID;
    
    -- Return variable
    return_data JSONB;
BEGIN
    -- 1. Create candidate
    INSERT INTO public.candidates_table (candidate_full_name, candidate_email, candidate_avatar_url)
    VALUES (input_full_name, input_email, input_avatar_url)
    RETURNING candidate_id INTO var_candidate_id;

    -- 2. Create hiring process for the candidate for a specific role
    INSERT INTO public.hiring_processes_table (hiring_process_candidate_id, hiring_process_role_id, hiring_process_status)
    VALUES (var_candidate_id, input_role_id, 'ACTIVE')
    RETURNING hiring_process_id INTO var_process_id;

    -- 3. Add default steps for the process
    INSERT INTO public.interview_steps_table (interview_step_hiring_process_id, interview_step_name, interview_step_type, interview_step_order_index, interview_step_status)
    VALUES 
        (var_process_id, 'HR Screening', 'HR', 1, 'PENDING'),
        (var_process_id, 'Department Interview', 'DEPARTMENT', 2, 'PENDING'),
        (var_process_id, 'Requestor Interview', 'REQUESTOR', 3, 'PENDING');

    -- Construct return data (synced with get_candidates_portfolio)
    SELECT jsonb_build_object(
        'candidate_id', candidates_table.candidate_id,
        'hiring_process_id', hiring_processes_table.hiring_process_id,
        'name', candidates_table.candidate_full_name,
        'email', candidates_table.candidate_email,
        'role', roles_table.role_title,
        'status', hiring_processes_table.hiring_process_status,
        'avatar', candidates_table.candidate_avatar_url,
        'applied_date', hiring_processes_table.hiring_process_created_at
    ) INTO return_data
    FROM public.candidates_table AS candidates_table
    JOIN public.hiring_processes_table AS hiring_processes_table ON candidates_table.candidate_id = hiring_processes_table.hiring_process_candidate_id
    JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id
    WHERE candidates_table.candidate_id = var_candidate_id;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a candidate and all related data
CREATE OR REPLACE FUNCTION public.delete_candidate(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_candidate_id UUID := (input_data->>'candidate_id')::UUID;
    
    -- Return variable
    return_data JSONB;
BEGIN
    -- Deletion of hiring_processes_table will cascade to interview_steps_table and interviews_table 
    -- IF foreign key constraints are set with ON DELETE CASCADE.
    -- Let's check constraints or perform manual cleanup if needed.
    -- Based on init_schema, we should ensure cascade is there or do it here.

    -- For safety, manual cleanup of related data if not cascading
    DELETE FROM public.interviews_table 
    WHERE interview_step_id IN (
        SELECT interview_step_id FROM public.interview_steps_table 
        WHERE interview_step_hiring_process_id IN (
            SELECT hiring_process_id FROM public.hiring_processes_table 
            WHERE hiring_process_candidate_id = input_candidate_id
        )
    );

    DELETE FROM public.interview_steps_table 
    WHERE interview_step_hiring_process_id IN (
        SELECT hiring_process_id FROM public.hiring_processes_table 
        WHERE hiring_process_candidate_id = input_candidate_id
    );

    DELETE FROM public.hiring_processes_table 
    WHERE hiring_process_candidate_id = input_candidate_id;

    DELETE FROM public.candidates_table 
    WHERE candidate_id = input_candidate_id;

    RETURN jsonb_build_object('success', true, 'candidate_id', input_candidate_id);
END;
$$ LANGUAGE plpgsql;
