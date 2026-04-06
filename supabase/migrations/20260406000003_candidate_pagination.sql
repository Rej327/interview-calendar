-- Add indexes for efficient sorting and filtering
CREATE INDEX IF NOT EXISTS idx_candidates_full_name ON public.candidates_table (candidate_full_name);
CREATE INDEX IF NOT EXISTS idx_hiring_processes_status ON public.hiring_processes_table (hiring_process_status);
CREATE INDEX IF NOT EXISTS idx_hiring_processes_created_at ON public.hiring_processes_table (hiring_process_created_at);

-- Updated RPC for paginated candidates portfolio
CREATE OR REPLACE FUNCTION public.get_candidates_portfolio_paginated(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Pagination parameters
    input_limit INTEGER := (input_data->>'limit')::INTEGER;
    input_offset INTEGER := (input_data->>'offset')::INTEGER;
    input_sort_column TEXT := COALESCE(input_data->>'sort_column', 'applied_date');
    input_sort_direction TEXT := COALESCE(input_data->>'sort_direction', 'DESC');
    
    -- Filter parameters
    input_query TEXT := (input_data->>'query');
    input_status_filters TEXT[] := ARRAY(SELECT jsonb_array_elements_text(input_data->'status_filters'));
    input_role_filters TEXT[] := ARRAY(SELECT jsonb_array_elements_text(input_data->'role_filters'));
    
    -- Function variables
    var_total_count INTEGER;
    var_records JSONB;
    return_data JSONB;
BEGIN
    -- 1. Calculate total count with filters (before pagination)
    SELECT count(*) INTO var_total_count
    FROM public.candidates_table AS candidates_table
    JOIN public.hiring_processes_table AS hiring_processes_table ON candidates_table.candidate_id = hiring_processes_table.hiring_process_candidate_id
    JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id
    WHERE (input_query IS NULL OR candidates_table.candidate_full_name ILIKE '%' || input_query || '%' OR roles_table.role_title ILIKE '%' || input_query || '%')
      AND (array_length(input_status_filters, 1) IS NULL OR hiring_processes_table.hiring_process_status::TEXT = ANY(input_status_filters))
      AND (array_length(input_role_filters, 1) IS NULL OR roles_table.role_title = ANY(input_role_filters));

    -- 2. Fetch paginated and sorted records
    SELECT jsonb_agg(subquery) INTO var_records
    FROM (
        SELECT 
            candidates_table.candidate_id,
            hiring_processes_table.hiring_process_id,
            candidates_table.candidate_full_name AS "name",
            candidates_table.candidate_email AS "email",
            roles_table.role_title AS "role",
            hiring_processes_table.hiring_process_status AS "status",
            candidates_table.candidate_avatar_url AS "avatar",
            hiring_processes_table.hiring_process_created_at AS "applied_date"
        FROM public.candidates_table AS candidates_table
        JOIN public.hiring_processes_table AS hiring_processes_table ON candidates_table.candidate_id = hiring_processes_table.hiring_process_candidate_id
        JOIN public.roles_table AS roles_table ON hiring_processes_table.hiring_process_role_id = roles_table.role_id
        WHERE (input_query IS NULL OR candidates_table.candidate_full_name ILIKE '%' || input_query || '%' OR roles_table.role_title ILIKE '%' || input_query || '%')
          AND (array_length(input_status_filters, 1) IS NULL OR hiring_processes_table.hiring_process_status::TEXT = ANY(input_status_filters))
          AND (array_length(input_role_filters, 1) IS NULL OR roles_table.role_title = ANY(input_role_filters))
        ORDER BY 
            CASE WHEN input_sort_column = 'name' AND input_sort_direction = 'ASC' THEN candidates_table.candidate_full_name END ASC,
            CASE WHEN input_sort_column = 'name' AND input_sort_direction = 'DESC' THEN candidates_table.candidate_full_name END DESC,
            CASE WHEN input_sort_column = 'status' AND input_sort_direction = 'ASC' THEN hiring_processes_table.hiring_process_status::TEXT END ASC,
            CASE WHEN input_sort_column = 'status' AND input_sort_direction = 'DESC' THEN hiring_processes_table.hiring_process_status::TEXT END DESC,
            CASE WHEN input_sort_column = 'applied_date' AND input_sort_direction = 'ASC' THEN hiring_processes_table.hiring_process_created_at END ASC,
            CASE WHEN input_sort_column = 'applied_date' AND input_sort_direction = 'DESC' THEN hiring_processes_table.hiring_process_created_at END DESC
        LIMIT input_limit
        OFFSET input_offset
    ) AS subquery;

    -- 3. Construct return data
    SELECT jsonb_build_object(
        'total_count', var_total_count,
        'records', COALESCE(var_records, '[]'::JSONB)
    ) INTO return_data;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;
