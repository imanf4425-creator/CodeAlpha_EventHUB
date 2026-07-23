-- ================================================================
-- EVENT REGISTRATION SYSTEM — SEED DATA
-- File: 002_seed.sql
-- 
-- All user passwords: Password123!
-- bcrypt hash (saltRounds=12):
--   $2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW
-- ================================================================

-- ================================================================
-- SEED TABLE 1: tbl_event_categories
-- ================================================================
INSERT INTO tbl_event_categories 
    (name, slug, description, icon, color, sort_order) 
VALUES
    ('Technology',  'technology',  'Software, AI, Cloud, DevOps, Cybersecurity workshops', '💻', '#4f46e5', 1),
    ('Business',    'business',    'Entrepreneurship, startups, marketing, finance events', '💼', '#0369a1', 2),
    ('Arts',        'arts',        'Design, music, theatre, photography, creative workshops', '🎨', '#7c3aed', 3),
    ('Sports',      'sports',      'Marathons, tournaments, fitness, outdoor activities',    '⚽', '#16a34a', 4),
    ('Education',   'education',   'Academic conferences, training, certifications',         '📚', '#d97706', 5),
    ('Networking',  'networking',  'Professional meetups, community events, conferences',    '🤝', '#0891b2', 6),
    ('Health',      'health',      'Wellness, mental health, medical, nutrition events',     '🏥', '#dc2626', 7),
    ('General',     'general',     'Other events that do not fit a specific category',       '🎫', '#6b7280', 8);

-- ================================================================
-- SEED TABLE 2: tbl_users
-- ================================================================
-- Roles:
--   is_staff=true, is_organizer=true  → Admin (has admin panel access)
--   is_staff=false, is_organizer=true → Organizer (creates events)
--   is_staff=false, is_organizer=false → Attendee (registers for events)
-- ================================================================
INSERT INTO tbl_users 
    (email, first_name, last_name, phone, password_hash, city, country, bio, is_organizer, is_staff, is_active)
VALUES
    -- ── ADMINS ──────────────────────────────────────────
    (
        'admin@eventhub.com', 'Super', 'Admin', '+92-300-0000000',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Karachi', 'Pakistan', 'Platform administrator with full access.',
        true, true, true
    ),
    (
        'sarah.ahmed@eventhub.com', 'Sarah', 'Ahmed', '+92-300-1234567',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Karachi', 'Pakistan', 'Tech event organizer and admin. Runs workshops across Pakistan.',
        true, true, true
    ),

    -- ── ORGANIZERS ──────────────────────────────────────
    (
        'omar.khan@example.com', 'Omar', 'Khan', '+92-321-9876543',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Lahore', 'Pakistan', 'Software engineer and community builder. Organizes Python and data science events.',
        true, false, true
    ),
    (
        'aisha.malik@example.com', 'Aisha', 'Malik', '+92-333-1112222',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Islamabad', 'Pakistan', 'UX designer and Flutter developer. Organizes design and mobile dev workshops.',
        true, false, true
    ),
    (
        'hassan.mirza@example.com', 'Hassan', 'Mirza', '+92-311-3334444',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Karachi', 'Pakistan', 'Business consultant and startup mentor. Runs entrepreneurship events.',
        true, false, true
    ),

    -- ── ATTENDEES ───────────────────────────────────────
    (
        'fatima.ali@example.com', 'Fatima', 'Ali', '+92-333-5554444',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Karachi', 'Pakistan', 'Computer Science student. Interested in AI and web development.',
        false, false, true
    ),
    (
        'zain.malik@example.com', 'Zain', 'Malik', '+92-345-7778888',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Lahore', 'Pakistan', 'Full stack developer. Loves hackathons and tech meetups.',
        false, false, true
    ),
    (
        'hina.butt@example.com', 'Hina', 'Butt', '+92-311-2223333',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Islamabad', 'Pakistan', 'Graphic designer transitioning to UX. Passionate about design thinking.',
        false, false, true
    ),
    (
        'ali.hassan@example.com', 'Ali', 'Hassan', '+92-322-6667777',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Karachi', 'Pakistan', 'DevOps engineer. Building cloud infrastructure at a fintech startup.',
        false, false, true
    ),
    (
        'bilal.ch@example.com', 'Bilal', 'Chaudhry', '+92-301-9990000',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Lahore', 'Pakistan', 'ML engineer and tech blogger. Working on NLP projects.',
        false, false, true
    ),
    (
        'maria.siddiqui@example.com', 'Maria', 'Siddiqui', '+92-312-4445555',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Islamabad', 'Pakistan', 'Digital marketing manager. Growing brands through data-driven campaigns.',
        false, false, true
    ),
    (
        'ahmed.raza@example.com', 'Ahmed', 'Raza', '+92-333-8889999',
        '$2a$12$1JS5FKJSzwYRkTTweTyKcOUiI9orYCk6RbCAOvE6uQSK0VBIgiydW',
        'Karachi', 'Pakistan', 'Startup founder. Building a SaaS product for local businesses.',
        false, false, true
    );

-- ================================================================
-- SEED TABLE 3: tbl_events
-- ================================================================
-- organizer_id:
--   1 = admin@eventhub.com
--   2 = sarah.ahmed
--   3 = omar.khan
--   4 = aisha.malik
--   5 = hassan.mirza
-- category_id:
--   1=Technology, 2=Business, 3=Arts, 4=Sports, 5=Education, 6=Networking, 7=Health, 8=General
-- ================================================================
INSERT INTO tbl_events 
    (title, description, organizer_id, category_id, venue_name, address, city, country,
     start_datetime, end_datetime, capacity, ticket_price, currency, is_free,
     is_published, is_featured, tags)
VALUES

    -- ── TECHNOLOGY EVENTS ───────────────────────────────
    (
        'React & Next.js Bootcamp 2025',
        'A full-day intensive bootcamp covering React 18 hooks, state management with Zustand, Server Components, and building production-ready apps with Next.js 14. Bring your laptop. Prerequisites: basic JavaScript.',
        2, 1, 'Expo Centre Hall 3', 'Expo Avenue, opposite Mazar-e-Quaid', 'Karachi', 'Pakistan',
        NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '8 hours',
        60, 0, 'PKR', true, true, true, 'react,nextjs,frontend,javascript'
    ),
    (
        'Python for Data Science Workshop',
        'Hands-on workshop covering Python, Pandas, NumPy, Matplotlib, and Scikit-learn with real datasets. Learn to clean data, build visualizations, and train ML models. Datasets provided.',
        3, 1, 'COMSATS University Auditorium', 'Defense Road, Off Raiwind Road', 'Lahore', 'Pakistan',
        NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '6 hours',
        80, 500, 'PKR', false, true, false, 'python,datascience,machinelearning'
    ),
    (
        'Node.js & Express Masterclass',
        'Deep-dive into building production-grade REST APIs with Node.js, Express, PostgreSQL, and JWT. Build a full real-time app with Socket.io. Take-home project included.',
        2, 1, 'Tech Hub Islamabad', 'Blue Area, Fazl-ul-Haq Road', 'Islamabad', 'Pakistan',
        NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '7 hours',
        50, 0, 'PKR', true, true, false, 'nodejs,express,backend,api'
    ),
    (
        'AI & Machine Learning Summit Pakistan 2025',
        'Pakistan''s biggest AI conference. Keynotes from Google Brain, Microsoft Research, and local AI labs. Topics: Large Language Models, Computer Vision, NLP, AI in healthcare & finance. Networking dinner included.',
        2, 1, 'Pearl Continental Hotel, Main Hall', 'Dr. Ziauddin Ahmed Road', 'Karachi', 'Pakistan',
        NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '10 hours',
        300, 2500, 'PKR', false, true, true, 'ai,machinelearning,llm,deeplearning'
    ),
    (
        'Cybersecurity & Ethical Hacking Bootcamp',
        'Intensive 2-day bootcamp on network security, OWASP Top 10, ethical hacking methodology, penetration testing with Kali Linux, and CTF challenges. Bring your own laptop.',
        3, 1, 'FAST University CS Department', 'Block B, Faisal Town', 'Lahore', 'Pakistan',
        NOW() + INTERVAL '28 days', NOW() + INTERVAL '28 days' + INTERVAL '16 hours',
        35, 1500, 'PKR', false, true, false, 'cybersecurity,hacking,security,kalilinux'
    ),
    (
        'AWS Cloud Computing Workshop',
        'Hands-on training on EC2, S3, RDS, Lambda, VPC, IAM, and CloudFormation. Two mock exams for AWS Cloud Practitioner certification. Official AWS study guide included.',
        4, 1, 'Serena Hotel Conference Centre', 'Khayaban-e-Suhrawardy, Sector G-5/1', 'Islamabad', 'Pakistan',
        NOW() + INTERVAL '35 days', NOW() + INTERVAL '35 days' + INTERVAL '8 hours',
        70, 3000, 'PKR', false, true, false, 'aws,cloud,devops,certification'
    ),
    (
        'Docker & Kubernetes DevOps Workshop',
        'Learn containerization with Docker, orchestration with Kubernetes, Helm charts, and building CI/CD pipelines with GitHub Actions. Set up a full production pipeline during the workshop.',
        4, 1, 'NED University Engineering Hall', 'University Road', 'Karachi', 'Pakistan',
        NOW() + INTERVAL '42 days', NOW() + INTERVAL '42 days' + INTERVAL '7 hours',
        55, 1000, 'PKR', false, true, false, 'docker,kubernetes,devops,cicd'
    ),
    (
        'Mobile App Development with Flutter',
        'Build cross-platform iOS and Android apps using Flutter and Dart. Covers widgets, BLoC state management, Firebase integration, local storage, and deployment to Play Store.',
        4, 1, 'NUST Campus Auditorium', 'H-12 Sector', 'Islamabad', 'Pakistan',
        NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days' + INTERVAL '8 hours',
        45, 800, 'PKR', false, true, false, 'flutter,dart,mobile,android,ios'
    ),

    -- ── BUSINESS EVENTS ─────────────────────────────────
    (
        'Startup Pitch Competition 2025',
        'Present your startup to a panel of investors and VCs. Top 3 startups win funding up to PKR 5 million. Open to all early-stage startups. Apply with a 2-page executive summary. 50+ investors attending.',
        5, 2, 'PSX Conference Centre', 'Stock Exchange Road, I.I. Chundrigar', 'Karachi', 'Pakistan',
        NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '9 hours',
        150, 0, 'PKR', true, true, true, 'startup,pitch,funding,entrepreneurship'
    ),
    (
        'Digital Marketing Masterclass',
        'Master SEO, Google Ads, Meta Ads, email campaigns, influencer marketing, and analytics. Learn from practitioners managing multi-million dollar budgets for Pakistani brands.',
        5, 2, 'Lahore Business School Auditorium', 'Gulberg III', 'Lahore', 'Pakistan',
        NOW() + INTERVAL '12 days', NOW() + INTERVAL '12 days' + INTERVAL '5 hours',
        100, 1200, 'PKR', false, true, false, 'digitalmarketing,seo,socialmedia,ads'
    ),
    (
        'Freelancing & Remote Work Seminar',
        'Learn how to get international clients on Upwork and Fiverr, write winning proposals, manage remote projects, handle PayPal/Payoneer payments, and avoid common mistakes. Q&A with top-rated Pakistani freelancers.',
        5, 2, 'Online via Zoom', '', 'Online', 'Pakistan',
        NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
        200, 0, 'PKR', true, true, true, 'freelancing,remote,upwork,fiverr'
    ),
    (
        'E-Commerce & Dropshipping Workshop',
        'Start your own online store on Shopify, integrate payment gateways, run Facebook and TikTok ads, and build a brand. Case studies from successful Pakistani e-commerce sellers.',
        5, 2, 'Bahria Town Commercial Hub', 'Bahria Town Phase 4', 'Rawalpindi', 'Pakistan',
        NOW() + INTERVAL '18 days', NOW() + INTERVAL '18 days' + INTERVAL '6 hours',
        80, 900, 'PKR', false, true, false, 'ecommerce,shopify,dropshipping,ads'
    ),

    -- ── ARTS & DESIGN ────────────────────────────────────
    (
        'UI/UX Design Intensive Workshop',
        'Learn user research, wireframing in Figma, building design systems, prototyping, and usability testing. Build a complete portfolio project during the workshop. Certificate provided.',
        4, 3, 'National College of Arts, Studio Block', 'Mall Road', 'Lahore', 'Pakistan',
        NOW() + INTERVAL '9 days', NOW() + INTERVAL '9 days' + INTERVAL '6 hours',
        40, 700, 'PKR', false, true, false, 'uxdesign,figma,ui,design'
    ),

    -- ── SPORTS ────────────────────────────────────────
    (
        'Karachi Marathon 2025',
        'Annual Karachi Marathon with 4 categories: 5K Fun Run, 10K, Half Marathon (21K), and Full Marathon (42K). Open to all ages. Finisher medals, t-shirts, and refreshments for all participants. Chip timing.',
        2, 4, 'Sea View, Do Darya Start Line', 'Clifton Block 9, Sea View', 'Karachi', 'Pakistan',
        NOW() + INTERVAL '60 days', NOW() + INTERVAL '60 days' + INTERVAL '8 hours',
        2000, 1000, 'PKR', false, true, true, 'marathon,running,fitness,sports'
    ),

    -- ── NETWORKING ──────────────────────────────────────
    (
        'Pakistan Tech Meetup — Quarterly',
        'Quarterly gathering of developers, designers, and tech enthusiasts. Short talks (5 min each), networking, and product demos. Free pizza and drinks. All skill levels welcome.',
        2, 6, 'Arfa Software Technology Park', 'Ferozpur Road', 'Lahore', 'Pakistan',
        NOW() + INTERVAL '45 days', NOW() + INTERVAL '45 days' + INTERVAL '4 hours',
        120, 0, 'PKR', true, true, false, 'networking,tech,community,meetup'
    ),

    -- ── DRAFT (Not published, not visible publicly) ──────
    (
        'Advanced Kubernetes Production Operations [DRAFT]',
        'Advanced Kubernetes: multi-cluster management, GitOps with ArgoCD, service mesh with Istio, cost optimization, and SRE practices. Currently being planned.',
        2, 1, 'TBD Islamabad', '', 'Islamabad', 'Pakistan',
        NOW() + INTERVAL '90 days', NOW() + INTERVAL '90 days' + INTERVAL '8 hours',
        25, 2000, 'PKR', false, false, false, 'kubernetes,advanced,devops'
    );

-- ================================================================
-- SEED TABLE 4: tbl_registrations
-- ================================================================
-- tbl_users IDs:
--   1=admin, 2=sarah, 3=omar, 4=aisha, 5=hassan (organizers)
--   6=fatima, 7=zain, 8=hina, 9=ali, 10=bilal, 11=maria, 12=ahmed (attendees)
-- tbl_events IDs:
--   1=React, 2=Python, 3=Node, 4=AI Summit, 5=Cyber, 6=AWS, 7=Docker
--   8=Flutter, 9=Startup, 10=DigitalMktg, 11=Freelancing, 12=Ecommerce
--   13=UIUX, 14=Marathon, 15=TechMeetup, 16=Draft
-- ================================================================
INSERT INTO tbl_registrations 
    (user_id, event_id, status, notes)
VALUES
    -- Fatima (user_id=6) — 5 registrations
    (6, 1,  'active',    'Excited to learn React 18 Server Components'),
    (6, 2,  'active',    'Need Python for my final year data science project'),
    (6, 11, 'active',    'Want to freelance as a frontend developer after graduation'),
    (6, 4,  'active',    'AI is the future and I want to be part of it'),
    (6, 13, 'cancelled', 'Cannot attend due to university exams this week'),

    -- Zain (user_id=7) — 5 registrations
    (7, 1,  'active',   'Upgrading from class components to hooks and Next.js'),
    (7, 3,  'active',   'Backend is my specialty, want to deepen Node.js skills'),
    (7, 5,  'active',   'Interested in bug bounty programs and CTF challenges'),
    (7, 9,  'active',   'Pitching my EdTech SaaS startup — B2B model'),
    (7, 15, 'active',   'Always attend the quarterly meetup — great community'),

    -- Hina (user_id=8) — 4 registrations
    (8, 13, 'active',   'Figma is my tool of choice, want to go deeper into systems'),
    (8, 8,  'active',   'Building a design portfolio app with Flutter'),
    (8, 11, 'active',   'Plan to freelance as a UI/UX designer internationally'),
    (8, 4,  'active',   'AI in design is revolutionizing the field'),

    -- Ali (user_id=9) — 5 registrations
    (9, 2,  'active',   'Expanding from DevOps to ML infrastructure'),
    (9, 6,  'active',   'Our team is migrating everything to AWS this quarter'),
    (9, 7,  'active',   'Already use Docker daily, want to master Kubernetes'),
    (9, 14, 'active',   'Running the full 42K marathon — trained for 6 months'),
    (9, 15, 'active',   'Great place to connect with the local tech community'),

    -- Bilal (user_id=10) — 4 registrations
    (10, 4,  'active',   'Working on a RAG-based LLM project, need to network'),
    (10, 3,  'active',   'Building APIs for my ML models'),
    (10, 9,  'active',   'Pitching an AI-powered fintech product'),
    (10, 10, 'active',   'Want to grow my tech blog through digital marketing'),

    -- Maria (user_id=11) — 4 registrations
    (11, 1,  'active',   'Learning React to understand what devs build for me'),
    (11, 11, 'active',   'Want to offer social media marketing on Fiverr'),
    (11, 10, 'active',   'Managing $2M+ ad spend, always looking to improve'),
    (11, 14, 'active',   'Joining the 10K category for the first time'),

    -- Ahmed (user_id=12) — 4 registrations
    (12, 9,  'active',   'Presenting SupplyChainAI — logistics optimization SaaS'),
    (12, 11, 'active',   'Testing freelancing while building my startup'),
    (12, 3,  'active',   'Building the backend of my SaaS with Node.js'),
    (12, 12, 'active',   'Researching e-commerce as a revenue stream for my startup');

-- ================================================================
-- FINAL VERIFICATION — Shows all table data counts
-- ================================================================
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator
UNION ALL SELECT '  EVENT REGISTRATION SYSTEM — DB SUMMARY   '
UNION ALL SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT
    'tbl_users'             AS table_name, COUNT(*)::text AS rows FROM tbl_users
UNION ALL SELECT
    'tbl_event_categories'  AS table_name, COUNT(*)::text FROM tbl_event_categories
UNION ALL SELECT
    'tbl_events (all)'      AS table_name, COUNT(*)::text FROM tbl_events
UNION ALL SELECT
    'tbl_events (published)'AS table_name, COUNT(*)::text FROM tbl_events WHERE is_published=true
UNION ALL SELECT
    'tbl_events (featured)' AS table_name, COUNT(*)::text FROM tbl_events WHERE is_featured=true
UNION ALL SELECT
    'tbl_registrations'     AS table_name, COUNT(*)::text FROM tbl_registrations
UNION ALL SELECT
    'tbl_admin_logs'        AS table_name, COUNT(*)::text FROM tbl_admin_logs;

-- Show user breakdown
SELECT '--- USER BREAKDOWN ---' AS info;
SELECT
    CASE WHEN is_staff     THEN 'Admin'
         WHEN is_organizer THEN 'Organizer'
         ELSE 'Attendee' END AS role,
    COUNT(*) AS count
FROM tbl_users
GROUP BY role ORDER BY role;

-- Show events by category
SELECT '--- EVENTS BY CATEGORY ---' AS info;
SELECT c.name AS category, COUNT(e.event_id) AS event_count
FROM tbl_event_categories c
LEFT JOIN tbl_events e ON e.category_id = c.category_id
GROUP BY c.name ORDER BY event_count DESC;
