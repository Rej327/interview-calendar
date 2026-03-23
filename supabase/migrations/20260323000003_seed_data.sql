-- Seed data for Interview Calendar (Construction Company Context)
-- Generating ~1000+ total records across all tables

SET search_path TO '';

-- 1. Seed Roles (Construction, IT, and Developer Departments)
INSERT INTO public.roles_table (role_title, role_department)
SELECT 
    role_name,
    dept
FROM (VALUES 
    ('Senior Site Manager', 'Construction'),
    ('Project Architect', 'Design & Architecture'),
    ('Civil Engineer (Infrastructure)', 'Engineering'),
    ('Junior Quantity Surveyor', 'Commercial'),
    ('Site Safety & Health Officer', 'Safety & Environment'),
    ('Heavy Equipment Coordinator', 'Logistics'),
    ('BIM Coordinator', 'IT Department'),
    ('Network Administrator', 'IT Department'),
    ('Construction ERP Developer', 'Developer Department'),
    ('Full Stack Engineer (Fleet Management)', 'Developer Department')
) AS r(role_name, dept);

-- 2. Seed Interviewers (30 interviewers)
INSERT INTO public.interviewers_table (interviewer_full_name, interviewer_email, interviewer_avatar_url)
SELECT 
    'Expert ' || i,
    'expert' || i || '@construction-corp.com',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert' || i
FROM generate_series(1, 30) i;

-- 3. Seed Candidates (200 candidates)
INSERT INTO public.candidates_table (candidate_full_name, candidate_email, candidate_avatar_url)
SELECT 
    'Candidate ' || i,
    'candidate' || i || '@gmail.com',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate' || i
FROM generate_series(1, 200) i;

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

-- 5. Seed Interview Steps (3 steps for each active/hired/rejected process)
INSERT INTO public.interview_steps_table (interview_step_hiring_process_id, interview_step_name, interview_step_type, interview_step_order_index, interview_step_status)
SELECT 
    hp.hiring_process_id,
    step.step_name,
    step.step_type::public.INTERVIEW_TYPE,
    step.idx,
    (CASE 
        WHEN hp.hiring_process_status = 'HIRED' THEN 'COMPLETED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'REJECTED' AND step.idx = 1 THEN 'FAILED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'ACTIVE' AND step.idx = 1 THEN 'COMPLETED'::public.STEP_STATUS
        WHEN hp.hiring_process_status = 'ACTIVE' AND step.idx = 2 THEN 'IN_PROGRESS'::public.STEP_STATUS
        ELSE 'PENDING'::public.STEP_STATUS
    END)
FROM public.hiring_processes_table hp
CROSS JOIN LATERAL (VALUES 
    (1, 'HR Screening', 'SCREENING'),
    (2, 'Technical Assessment', 'TECHNICAL'),
    (3, 'Field Expert Review', 'TECHNICAL')
) AS step(idx, step_name, step_type)
WHERE hp.hiring_process_status NOT IN ('WITHDRAWN', 'POOLING') OR random() > 0.5;

-- 6. Seed Interviews (Scheduled sessions for steps)
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
    now() + (random() * interval '30 days') - interval '15 days',
    now() + (random() * interval '30 days') - interval '15 days' + interval '1 hour',
    (CASE (random() * 4)::int 
        WHEN 0 THEN 'SCHEDULED'::public.INTERVIEW_STATUS
        WHEN 1 THEN 'CONFIRMED'::public.INTERVIEW_STATUS
        WHEN 2 THEN 'COMPLETED'::public.INTERVIEW_STATUS
        WHEN 3 THEN 'CANCELLED'::public.INTERVIEW_STATUS
        ELSE 'PENDING'::public.INTERVIEW_STATUS
    END),
    'https://zoom.us/j/' || (random() * 1000000000)::bigint,
    'Site/Tech review notes for ' || step.interview_step_name
FROM public.interview_steps_table step
WHERE step.interview_step_status IN ('COMPLETED', 'IN_PROGRESS') OR random() > 0.7;
