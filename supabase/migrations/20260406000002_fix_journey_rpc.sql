-- Fix hiring process details to include created_at field
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
            'hiring_process_created_at', hiring_processes_table.hiring_process_created_at,
            'candidate_full_name', candidates_table.candidate_full_name,
            'candidate_avatar_url', candidates_table.candidate_avatar_url,
            'role_title', roles_table.role_title,
            'role_department', roles_table.role_department
        ),
        'steps', COALESCE((
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
        ), '[]'::JSONB)
    ) INTO return_data
    FROM public.hiring_processes_table AS hiring_processes_table
    JOIN public.candidates_table AS candidates_table ON hiring_processes_table.hiring_process_candidate_id = candidates_table.candidate_id
    JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id
    WHERE hiring_processes_table.hiring_process_id = input_hiring_process_id;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;
