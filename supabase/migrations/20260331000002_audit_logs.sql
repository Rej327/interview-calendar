-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs_table (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_interview_id UUID REFERENCES public.interviews_table(interview_id) ON DELETE CASCADE,
    log_candidate_name TEXT,
    log_action_type TEXT, 
    log_description TEXT, -- Added for detailed changes
    log_modified_by TEXT DEFAULT 'Current User',
    log_timestamp TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Logging Logic
CREATE OR REPLACE FUNCTION public.log_interview_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs_table (log_interview_id, log_candidate_name, log_action_type, log_description)
        SELECT 
            NEW.interview_id, 
            c.candidate_full_name,
            'CREATED',
            'Interview scheduled for ' || to_char(NEW.interview_start_at, 'Mon DD, HH:MI AM')
        FROM public.interview_steps_table s
        JOIN public.hiring_processes_table hp ON s.interview_step_hiring_process_id = hp.hiring_process_id
        JOIN public.candidates_table c ON hp.hiring_process_candidate_id = c.candidate_id
        WHERE s.interview_step_id = NEW.interview_step_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.interview_start_at <> NEW.interview_start_at) THEN
            INSERT INTO public.audit_logs_table (log_interview_id, log_candidate_name, log_action_type, log_description)
            SELECT 
                NEW.interview_id, 
                c.candidate_full_name,
                'RESCHEDULED',
                'Modified from ' || to_char(OLD.interview_start_at, 'HH:MI AM') || ' to ' || to_char(NEW.interview_start_at, 'HH:MI AM')
            FROM public.interview_steps_table s
            JOIN public.hiring_processes_table hp ON s.interview_step_hiring_process_id = hp.hiring_process_id
            JOIN public.candidates_table c ON hp.hiring_process_candidate_id = c.candidate_id
            WHERE s.interview_step_id = NEW.interview_step_id;
        ELSIF (OLD.interview_status <> NEW.interview_status) THEN
             INSERT INTO public.audit_logs_table (log_interview_id, log_candidate_name, log_action_type, log_description)
            SELECT 
                NEW.interview_id, 
                c.candidate_full_name,
                CASE WHEN NEW.interview_status = 'CANCELLED' THEN 'CANCELLED' ELSE 'STATUS_CHANGE' END,
                'Status updated: ' || OLD.interview_status || ' → ' || NEW.interview_status
            FROM public.interview_steps_table s
            JOIN public.hiring_processes_table hp ON s.interview_step_hiring_process_id = hp.hiring_process_id
            JOIN public.candidates_table c ON hp.hiring_process_candidate_id = c.candidate_id
            WHERE s.interview_step_id = NEW.interview_step_id;
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER tr_log_interview_change
AFTER INSERT OR UPDATE ON public.interviews_table
FOR EACH ROW EXECUTE FUNCTION public.log_interview_change();

-- 3. Create Fetch RPC
CREATE OR REPLACE FUNCTION public.get_recent_changes()
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    return_data JSONB;
BEGIN
    SELECT json_agg(logs) FROM (
        SELECT 
            log_id as id,
            log_candidate_name as candidate,
            log_action_type as type,
            log_description as description,
            log_modified_by as user,
            to_char(log_timestamp, 'HH:MI AM') as time
        FROM public.audit_logs_table

        ORDER BY log_timestamp DESC
        LIMIT 10
    ) logs INTO return_data;
    
    RETURN coalesce(return_data, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;
