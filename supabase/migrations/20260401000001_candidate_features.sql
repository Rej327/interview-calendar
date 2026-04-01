-- Function to create a candidate and start their hiring process
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
