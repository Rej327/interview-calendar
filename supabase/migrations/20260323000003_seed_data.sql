-- Seed data for Interview Calendar (Construction & Engineering Context)
-- Ensuring high data variety and realism across all tables

SET search_path TO '';

-- 1. Refresh Roles (Ensuring 20+ distinct roles)
DELETE FROM public.roles_table;
INSERT INTO public.roles_table (role_title, role_department)
VALUES 
    ('Senior Site Manager', 'Construction'),
    ('Junior Estimator', 'Commercial'),
    ('Civil/Structural Engineer', 'Engineering'),
    ('BIM Coordinator', 'IT Department'),
    ('Construction ERP Developer', 'Developer Department'),
    ('Health & Safety Manager', 'Safety & Environment'),
    ('Procurement Officer', 'Logistics'),
    ('Human Resources Officer', 'People'),
    ('Lead Architect', 'Design & Architecture'),
    ('Surveyor', 'Field Survey'),
    ('Project Controls Specialist', 'Management'),
    ('Logistics Coordinator', 'Logistics'),
    ('Concrete Lab Technician', 'Quality Control'),
    ('IT Support Technician', 'IT Department'),
    ('Backend Engineer (Scheduling API)', 'Developer Department'),
    ('Site Foreman', 'Construction'),
    ('Operations Analyst', 'Management'),
    ('Compliance Officer', 'Legal'),
    ('Material Planner', 'Commercial'),
    ('Electrician Team Lead', 'Maintenance'),
    ('Quantity Surveyor', 'Commercial'),
    ('Geotechnical Engineer', 'Engineering'),
    ('Sustainability Consultant', 'Environment'),
    ('Frontend Developer (UI/UX)', 'Developer Department'),
    ('Assistant Project Manager', 'Construction');

-- 2. Seed Interviewers (40 experts with balanced roles)
DELETE FROM public.interviewers_table;
INSERT INTO public.interviewers_table (interviewer_full_name, interviewer_email, interviewer_avatar_url, interviewer_role_id)
SELECT 
    'Expert ' || fn.first_name || ' ' || ln.last_name,
    lower(fn.first_name || '.' || ln.last_name || i || '@construction-corp.com'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || fn.first_name || ln.last_name || i,
    r.role_id
FROM generate_series(1, 40) i
CROSS JOIN LATERAL (
    SELECT first_name FROM (VALUES ('Alice'), ('Bob'), ('Charlie'), ('Diana'), ('Edward'), ('Fiona'), ('George'), ('Hannah'), ('Ian'), ('Julia')) AS fn(first_name) ORDER BY random() LIMIT 1
) fn
CROSS JOIN LATERAL (
    SELECT last_name FROM (VALUES ('Miller'), ('Davis'), ('Wilson'), ('Moore'), ('Taylor'), ('Anderson'), ('Thomas'), ('Jackson'), ('White'), ('Harris')) AS ln(last_name) ORDER BY random() LIMIT 1
) ln
CROSS JOIN LATERAL (SELECT role_id FROM public.roles_table ORDER BY random() LIMIT 1) r;

-- 3. Seed Candidates (200 candidates with very high name variety)
DELETE FROM public.candidates_table CASCADE;
INSERT INTO public.candidates_table (candidate_full_name, candidate_email, candidate_avatar_url)
SELECT 
    first_name || ' ' || last_name,
    lower(first_name || '.' || last_name || i || '@gmail.com'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate' || i
FROM generate_series(1, 200) i
CROSS JOIN LATERAL (
    SELECT first_name FROM (VALUES 
        ('James'), ('Mary'), ('Robert'), ('Patricia'), ('John'), ('Jennifer'), ('Michael'), ('Linda'), ('William'), ('Elizabeth'),
        ('David'), ('Barbara'), ('Richard'), ('Susan'), ('Joseph'), ('Jessica'), ('Thomas'), ('Sarah'), ('Christopher'), ('Karen'),
        ('Charles'), ('Nancy'), ('Daniel'), ('Lisa'), ('Matthew'), ('Betty'), ('Anthony'), ('Margaret'), ('Mark'), ('Sandra'),
        ('Donald'), ('Ashley'), ('Steven'), ('Kimberly'), ('Paul'), ('Emily'), ('Andrew'), ('Donna'), ('Joshua'), ('Michelle')
    ) AS fn(first_name) ORDER BY random() LIMIT 1
) f
CROSS JOIN LATERAL (
    SELECT last_name FROM (VALUES 
        ('Smith'), ('Johnson'), ('Williams'), ('Brown'), ('Jones'), ('Garcia'), ('Miller'), ('Davis'), ('Rodriguez'), ('Martinez'),
        ('Hernandez'), ('Lopez'), ('Gonzales'), ('Wilson'), ('Anderson'), ('Thomas'), ('Taylor'), ('Moore'), ('Jackson'), ('Martin'),
        ('Lee'), ('Perez'), ('Thompson'), ('White'), ('Harris'), ('Sanchez'), ('Clark'), ('Ramirez'), ('Lewis'), ('Robinson'),
        ('Walker'), ('Young'), ('Allen'), ('King'), ('Wright'), ('Scott'), ('Torres'), ('Nguyen'), ('Hill'), ('Flores')
    ) AS ln(last_name) ORDER BY random() LIMIT 1
) l;

-- 4. Seed Hiring Processes (1 per candidate, ensuring different roles per row)
INSERT INTO public.hiring_processes_table (hiring_process_candidate_id, hiring_process_role_id, hiring_process_status, hiring_process_created_at)
SELECT 
    c.candidate_id,
    r.role_id,
    p.status,
    now() - (random() * interval '90 days')
FROM public.candidates_table c
CROSS JOIN LATERAL (
    SELECT role_id FROM public.roles_table ORDER BY random() LIMIT 1
) r
CROSS JOIN LATERAL (
    SELECT (CASE (random() * 5)::int 
        WHEN 0 THEN 'ACTIVE'::public.HIRING_PROCESS_STATUS
        WHEN 1 THEN 'HIRED'::public.HIRING_PROCESS_STATUS
        WHEN 2 THEN 'REJECTED'::public.HIRING_PROCESS_STATUS
        WHEN 3 THEN 'WITHDRAWN'::public.HIRING_PROCESS_STATUS
        WHEN 4 THEN 'POOLING'::public.HIRING_PROCESS_STATUS
        ELSE 'ACTIVE'::public.HIRING_PROCESS_STATUS
    END) AS status
) p;

-- 5. Seed Interview Steps (3 steps for each actively processed journey)
INSERT INTO public.interview_steps_table (interview_step_hiring_process_id, interview_step_name, interview_step_type, interview_step_order_index, interview_step_status)
SELECT 
    hp.hiring_process_id,
    step.step_name,
    step.step_type::public.INTERVIEW_TYPE,
    step.idx,
    (CASE 
        WHEN hp.hiring_process_status = 'HIRED' THEN 'COMPLETED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'REJECTED' AND step.idx <= 2 AND random() > 0.5 THEN 'FAILED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'ACTIVE' AND step.idx = 1 THEN 'COMPLETED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'ACTIVE' AND step.idx = 2 AND random() > 0.3 THEN 'IN_PROGRESS'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'ACTIVE' AND step.idx = 2 THEN 'PENDING'::public.STEP_STATUS
        ELSE 'PENDING'::public.STEP_STATUS
    END)
FROM public.hiring_processes_table hp
CROSS JOIN LATERAL (VALUES 
    (1, 'HR Screening', 'HR'),
    (2, 'Technical Department Interview', 'DEPARTMENT'),
    (3, 'Management & Requestor Review', 'REQUESTOR')
) AS step(idx, step_name, step_type)
WHERE hp.hiring_process_status NOT IN ('POOLING', 'WITHDRAWN');

-- 6. Seed Interviews (Generating 400+ distinct sessions)
INSERT INTO public.interviews_table (
    interview_id,
    interview_step_id, 
    interview_interviewer_id, 
    interview_start_at, 
    interview_end_at, 
    interview_status, 
    interview_meeting_link, 
    interview_notes
)
SELECT 
    gen_random_uuid(),
    step.interview_step_id,
    (SELECT interviewer_id FROM public.interviewers_table ORDER BY random() LIMIT 1),
    -- Distributed over the last 2 months and next month
    now() + (random() * interval '90 days') - interval '60 days',
    now() + (random() * interval '90 days') - interval '60 days' + interval '60 minutes',
    (CASE (random() * 4)::int 
        WHEN 0 THEN 'SCHEDULED'::public.INTERVIEW_STATUS
        WHEN 1 THEN 'CONFIRMED'::public.INTERVIEW_STATUS
        WHEN 2 THEN 'COMPLETED'::public.INTERVIEW_STATUS
        WHEN 3 THEN 'CANCELLED'::public.INTERVIEW_STATUS
        ELSE 'COMPLETED'::public.INTERVIEW_STATUS
    END),
    'https://zoom.us/abc/' || (100000 + (random() * 899999))::int,
    'Candidate evaluation session for ' || step.interview_step_name || '. Experience and culture fit reviewed.'
FROM public.interview_steps_table step
WHERE step.interview_step_status IN ('COMPLETED', 'IN_PROGRESS') OR random() > 0.7;
