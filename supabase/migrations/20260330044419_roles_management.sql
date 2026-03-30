-- ==========================================
-- ROLE MANAGEMENT RPC FUNCTIONS
-- ==========================================

-- Function to fetch all roles
CREATE OR REPLACE FUNCTION public.get_all_roles(input_data JSONB DEFAULT '{}'::jsonb)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    return_data JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'role_id', r.role_id,
            'role_title', r.role_title,
            'role_department', r.role_department,
            'role_created_at', r.role_created_at
        ) ORDER BY r.role_title ASC
    ) INTO return_data
    FROM public.roles_table AS r;

    RETURN COALESCE(return_data, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;


-- Function to create a new role
CREATE OR REPLACE FUNCTION public.create_role(input_data JSONB)
RETURNS JSONB
SET search_path TO ''
AS $$
DECLARE
    -- Input variables
    input_role_title TEXT := (input_data->>'role_title')::TEXT;
    input_role_department TEXT := (input_data->>'role_department')::TEXT;
    
    -- Function variables
    var_role_id UUID;
    
    -- Return variable
    return_data JSONB;
BEGIN
    -- Create role
    INSERT INTO public.roles_table (role_title, role_department)
    VALUES (input_role_title, input_role_department)
    RETURNING role_id INTO var_role_id;

    SELECT to_jsonb(roles_table.*) INTO return_data
    FROM public.roles_table AS roles_table
    WHERE roles_table.role_id = var_role_id;

    RETURN return_data;
END;
$$ LANGUAGE plpgsql;
