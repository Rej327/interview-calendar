-- Function to fetch calendar events with more details for reports
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
                WHEN interview_steps_table.interview_step_type = 'DEPARTMENT' THEN 'violet'
                WHEN interview_steps_table.interview_step_type = 'REQUESTOR' THEN 'teal'
                WHEN interview_steps_table.interview_step_type = 'HR' THEN 'blue'
                ELSE 'gray'
            END,
            'extendedProps', jsonb_build_object(
                'candidate_id', candidates_table.candidate_id,
                'candidate_name', candidates_table.candidate_full_name,
                'interviewer_name', interviewers_table.interviewer_full_name,
                'interviewer_role', interviewer_roles.role_title,
                'avatar', candidates_table.candidate_avatar_url,
                'role', roles_table.role_title,
                'type', interview_steps_table.interview_step_type,
                'recording_link', interviews_table.interview_recorded_link,
                'meeting_link', interviews_table.interview_meeting_link,
                'notes', interviews_table.interview_notes
            )
        )
    ) INTO return_data
    FROM public.interviews_table AS interviews_table
    JOIN public.interview_steps_table AS interview_steps_table ON interviews_table.interview_step_id = interview_steps_table.interview_step_id
    JOIN public.hiring_processes_table AS hiring_processes_table ON interview_steps_table.interview_step_hiring_process_id = hiring_processes_table.hiring_process_id
    JOIN public.candidates_table AS candidates_table ON hiring_processes_table.hiring_process_candidate_id = candidates_table.candidate_id
    JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id
    LEFT JOIN public.interviewers_table AS interviewers_table ON interviews_table.interview_interviewer_id = interviewers_table.interviewer_id
    LEFT JOIN public.roles_table AS interviewer_roles ON interviewers_table.interviewer_role_id = interviewer_roles.role_id
    WHERE (input_start_date IS NULL OR interviews_table.interview_start_at >= input_start_date)
      AND (input_end_date IS NULL OR interviews_table.interview_end_at <= input_end_date);

    RETURN COALESCE(return_data, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;
