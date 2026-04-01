-- ==========================================
-- SEED ROLES DATA
-- ==========================================

INSERT INTO public.roles_table (role_title, role_department)
VALUES 
    ('Senior Backend Engineer', 'Engineering'),
    ('Frontend Developer', 'Engineering'),
    ('Product Manager', 'Product'),
    ('UX/UI Designer', 'Design'),
    ('Data Scientist', 'Data Science'),
    ('HR Specialist', 'Human Resources'),
    ('DevOps Engineer', 'Infrastructure'),
    ('Marketing Lead', 'Marketing'),
    ('Customer Success Manager', 'Operations'),
    ('Sales Representative', 'Sales')
ON CONFLICT (role_title) DO NOTHING;
