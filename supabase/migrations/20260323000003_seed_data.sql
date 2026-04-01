-- Seed data for Interview Calendar (Construction Company Context)
-- Generating 1500+ total records across all tables

SET search_path TO '';

-- 1. Seed Roles (20 roles across various departments)
INSERT INTO public.roles_table (role_title, role_department)
SELECT 
    role_name,
    dept
FROM (VALUES 
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
    ('Electrician Team Lead', 'Maintenance')
) AS r(role_name, dept);

-- 2. Seed Interviewers (40 experts)
INSERT INTO public.interviewers_table (interviewer_full_name, interviewer_email, interviewer_avatar_url, interviewer_role_id)
SELECT 
    'Expert ' || i,
    'expert' || i || '@construction-corp.com',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert' || i,
    r.role_id
FROM generate_series(1, 40) i
CROSS JOIN LATERAL (SELECT role_id FROM public.roles_table ORDER BY random() LIMIT 1) r;



-- 3. Seed Candidates (300 candidates)
INSERT INTO public.candidates_table (candidate_full_name, candidate_email, candidate_avatar_url)
SELECT 
    'Candidate ' || i,
    'candidate' || i || '@gmail.com',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate' || i
FROM generate_series(1, 300) i;

-- 4. Seed Hiring Processes (1 per candidate)
INSERT INTO public.hiring_processes_table (hiring_process_candidate_id, hiring_process_role_id, hiring_process_status)
SELECT 
    candidate_id,
    (SELECT role_id FROM public.roles_table ORDER BY random() LIMIT 1),
    (CASE (random() * 4)::int 
        WHEN 0 THEN 'ACTIVE'::public.HIRING_PROCESS_STATUS
        WHEN 1 THEN 'HIRED'::public.HIRING_PROCESS_STATUS
        WHEN 2 THEN 'REJECTED'::public.HIRING_PROCESS_STATUS
        WHEN 3 THEN 'WITHDRAWN'::public.HIRING_PROCESS_STATUS
        ELSE 'POOLING'::public.HIRING_PROCESS_STATUS
    END)
FROM public.candidates_table;

-- 5. Seed Interview Steps (3 steps for each candidate journey)
INSERT INTO public.interview_steps_table (interview_step_hiring_process_id, interview_step_name, interview_step_type, interview_step_order_index, interview_step_status)
SELECT 
    hp.hiring_process_id,
    step.step_name,
    step.step_type::public.INTERVIEW_TYPE,
    step.idx,
    (CASE 
        WHEN hp.hiring_process_status = 'HIRED' THEN 'COMPLETED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'REJECTED' AND step.idx = 1 THEN 'FAILED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'REJECTED' AND step.idx = 2 THEN 'FAILED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'ACTIVE' AND step.idx = 1 THEN 'COMPLETED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'ACTIVE' AND step.idx = 2 THEN 'IN_PROGRESS'::public.STEP_STATUS
        ELSE 'PENDING'::public.STEP_STATUS
    END)
FROM public.hiring_processes_table hp
CROSS JOIN LATERAL (VALUES 
    (1, 'HR Interview', 'HR'),
    (2, 'Department Interview', 'DEPARTMENT'),
    (3, 'Requestor Interview', 'REQUESTOR')
) AS step(idx, step_name, step_type)

-- Only skip steps for Withdrawals/Pooling, but ensure at least some steps exist for everyone
WHERE hp.hiring_process_status NOT IN ('WITHDRAWN', 'POOLING') OR random() > 0.4;

-- 6. Seed Interviews (Generating ~600+ interview sessions)
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
    -- Spread over last 3 weeks and next 2 weeks
    now() + (random() * interval '35 days') - interval '21 days',
    now() + (random() * interval '35 days') - interval '21 days' + interval '45 minutes',
    (CASE (random() * 4)::int 
        WHEN 0 THEN 'SCHEDULED'::public.INTERVIEW_STATUS
        WHEN 1 THEN 'CONFIRMED'::public.INTERVIEW_STATUS
        WHEN 2 THEN 'COMPLETED'::public.INTERVIEW_STATUS
        WHEN 3 THEN 'CANCELLED'::public.INTERVIEW_STATUS
        ELSE 'PENDING'::public.INTERVIEW_STATUS
    END),
    'https://zoom.us/j/' || (100000000 + (random() * 899999999))::bigint,
    'Professional evaluation for ' || step.step_name || '. Candidate discussed site safety and previous technical projects.'
FROM (
    -- Subquery to select steps that should have interviews
    SELECT interview_step_id, interview_step_name as step_name FROM public.interview_steps_table 
    WHERE interview_step_status IN ('COMPLETED', 'IN_PROGRESS') OR random() > 0.6
) step;
