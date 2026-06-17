USE placify;

START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE applications;
TRUNCATE TABLE jobs;
TRUNCATE TABLE companies;
TRUNCATE TABLE students;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, created_at, updated_at, name, email, password, role, enabled) VALUES
(1, NOW(), NOW(), 'Priya Sharma', 'admin@placify.com', '$2a$10$kFzlglcCQaIO6JZ1KRgphOXd5OqSGnniE1IcuamrDkvLdOanzhjRe', 'ADMIN', b'1'),
(2, NOW(), NOW(), 'Aarav Mehta', 'recruiter.microsoft@placify.com', '$2a$10$BzjOSxWamSKqjeMZe1YRquNJG//b6I9zbQyI3N062Ore6eil3yItW', 'RECRUITER', b'1'),
(3, NOW(), NOW(), 'Neha Kulkarni', 'recruiter.amazon@placify.com', '$2a$10$BzjOSxWamSKqjeMZe1YRquNJG//b6I9zbQyI3N062Ore6eil3yItW', 'RECRUITER', b'1'),
(4, NOW(), NOW(), 'Rishi Bhatia', 'recruiter.deloitte@placify.com', '$2a$10$BzjOSxWamSKqjeMZe1YRquNJG//b6I9zbQyI3N062Ore6eil3yItW', 'RECRUITER', b'1'),
(5, NOW(), NOW(), 'Kavya Reddy', 'recruiter.infosys@placify.com', '$2a$10$BzjOSxWamSKqjeMZe1YRquNJG//b6I9zbQyI3N062Ore6eil3yItW', 'RECRUITER', b'1'),
(6, NOW(), NOW(), 'Arjun Nair', 'recruiter.accenture@placify.com', '$2a$10$BzjOSxWamSKqjeMZe1YRquNJG//b6I9zbQyI3N062Ore6eil3yItW', 'RECRUITER', b'1'),
(7, NOW(), NOW(), 'Siddharth Jain', 'recruiter.tcs@placify.com', '$2a$10$BzjOSxWamSKqjeMZe1YRquNJG//b6I9zbQyI3N062Ore6eil3yItW', 'RECRUITER', b'1'),
(8, NOW(), NOW(), 'Ananya Gupta', 'ananya.gupta@placify.com', '$2a$10$z9qw8tPPzQBhkuFjApWLUeiTjKWykUyqqWHaoEhwyTXuEJZaGiiO2', 'STUDENT', b'1'),
(9, NOW(), NOW(), 'Rohan Verma', 'rohan.verma@placify.com', '$2a$10$z9qw8tPPzQBhkuFjApWLUeiTjKWykUyqqWHaoEhwyTXuEJZaGiiO2', 'STUDENT', b'1'),
(10, NOW(), NOW(), 'Sneha Iyer', 'sneha.iyer@placify.com', '$2a$10$z9qw8tPPzQBhkuFjApWLUeiTjKWykUyqqWHaoEhwyTXuEJZaGiiO2', 'STUDENT', b'1'),
(11, NOW(), NOW(), 'Aditya Rao', 'aditya.rao@placify.com', '$2a$10$z9qw8tPPzQBhkuFjApWLUeiTjKWykUyqqWHaoEhwyTXuEJZaGiiO2', 'STUDENT', b'1'),
(12, NOW(), NOW(), 'Meera Nair', 'meera.nair@placify.com', '$2a$10$z9qw8tPPzQBhkuFjApWLUeiTjKWykUyqqWHaoEhwyTXuEJZaGiiO2', 'STUDENT', b'1'),
(13, NOW(), NOW(), 'Kunal Singh', 'kunal.singh@placify.com', '$2a$10$z9qw8tPPzQBhkuFjApWLUeiTjKWykUyqqWHaoEhwyTXuEJZaGiiO2', 'STUDENT', b'1'),
(14, NOW(), NOW(), 'Ishita Kapoor', 'ishita.kapoor@placify.com', '$2a$10$z9qw8tPPzQBhkuFjApWLUeiTjKWykUyqqWHaoEhwyTXuEJZaGiiO2', 'STUDENT', b'1'),
(15, NOW(), NOW(), 'Vivek Menon', 'vivek.menon@placify.com', '$2a$10$z9qw8tPPzQBhkuFjApWLUeiTjKWykUyqqWHaoEhwyTXuEJZaGiiO2', 'STUDENT', b'1');

INSERT INTO students (id, created_at, updated_at, branch, resume, skills, user_id) VALUES
(1, NOW(), NOW(), 'Computer Science Engineering', 'ananya-gupta-resume.pdf', 'Java, Spring Boot, MySQL, REST APIs, DSA', 8),
(2, NOW(), NOW(), 'Information Technology', 'rohan-verma-resume.pdf', 'JavaScript, SQL, Node.js, React, Git', 9),
(3, NOW(), NOW(), 'Artificial Intelligence and Machine Learning', 'sneha-iyer-resume.pdf', 'Python, SQL, FastAPI, Machine Learning, Power BI', 10),
(4, NOW(), NOW(), 'Electronics and Communication Engineering', 'aditya-rao-resume.pdf', 'Java, DBMS, Operating Systems, Computer Networks', 11),
(5, NOW(), NOW(), 'Computer Science Engineering', 'meera-nair-resume.pdf', 'Spring Boot, Docker, PostgreSQL, Microservices, GitHub Actions', 12),
(6, NOW(), NOW(), 'Data Science', 'kunal-singh-resume.pdf', 'Python, Pandas, SQL, ETL, Data Visualization', 13),
(7, NOW(), NOW(), 'Computer Engineering', 'ishita-kapoor-resume.pdf', 'DSA, Java, OOP, AWS Basics, Problem Solving', 14),
(8, NOW(), NOW(), 'Information Technology', 'vivek-menon-resume.pdf', 'Java, Manual Testing, SQL, Postman, Git', 15);

INSERT INTO companies (id, created_at, updated_at, name, industry, website, location, description, created_by) VALUES
(1, NOW(), NOW(), 'Microsoft', 'Technology', 'https://www.microsoft.com/', 'Bengaluru, Karnataka', 'Global technology company building cloud, productivity, AI, and enterprise developer platforms.', 1),
(2, NOW(), NOW(), 'Amazon', 'E-commerce and Cloud', 'https://www.amazon.jobs/', 'Hyderabad, Telangana', 'Global commerce and cloud platform hiring campus engineers for scalable backend and platform systems.', 1),
(3, NOW(), NOW(), 'Deloitte', 'Consulting and Professional Services', 'https://www.deloitte.com/', 'Hyderabad, Telangana', 'Advisory and consulting network delivering enterprise transformation, analytics, and technology programs.', 1),
(4, NOW(), NOW(), 'Infosys', 'IT Services and Consulting', 'https://www.infosys.com/', 'Bengaluru, Karnataka', 'Digital services and consulting company focused on enterprise delivery, modernization, and cloud engineering.', 1),
(5, NOW(), NOW(), 'Accenture', 'Technology Consulting', 'https://www.accenture.com/in-en', 'Pune, Maharashtra', 'Professional services company hiring associates for application engineering, cloud, and digital delivery.', 1),
(6, NOW(), NOW(), 'Tata Consultancy Services', 'IT Services and Consulting', 'https://www.tcs.com/', 'Mumbai, Maharashtra', 'Enterprise technology and consulting organization with large-scale campus hiring across software and digital roles.', 1);

INSERT INTO jobs (id, created_at, updated_at, title, description, eligibility, eligibility_criteria, location, salary_package, application_deadline, active, company_id, recruiter_id) VALUES
(1, NOW(), NOW(), 'Associate Software Engineer', 'Build and maintain enterprise backend services, contribute to code reviews, and work with cross-functional engineering teams on scalable product features.', '2026 batch B.Tech/BE CSE, IT, ECE with 7.0+ CGPA, no active backlogs, strong DSA and Java fundamentals', '2026 batch B.Tech/BE CSE, IT, ECE with 7.0+ CGPA, no active backlogs, strong DSA and Java fundamentals', 'Bengaluru, Karnataka', '18.0 LPA', '2026-06-15', b'1', 1, 2),
(2, NOW(), NOW(), 'Software Development Engineer I', 'Design, develop, test, and improve distributed software components supporting high-scale commerce and internal platform services.', '2026 batch B.Tech/BE CSE, IT, EE with 7.0+ CGPA, strong problem-solving, OOP, and coding round readiness', '2026 batch B.Tech/BE CSE, IT, EE with 7.0+ CGPA, strong problem-solving, OOP, and coding round readiness', 'Hyderabad, Telangana', '20.5 LPA', '2026-06-18', b'1', 2, 3),
(3, NOW(), NOW(), 'Analyst - Technology Consulting', 'Support consulting engagements through requirement analysis, data validation, SQL-based insights, and technology solution documentation.', '2026 batch B.Tech/BE or MCA with 6.5+ CGPA, strong analytical skills, SQL, communication, and teamwork', '2026 batch B.Tech/BE or MCA with 6.5+ CGPA, strong analytical skills, SQL, communication, and teamwork', 'Hyderabad, Telangana', '9.5 LPA', '2026-06-20', b'1', 3, 4),
(4, NOW(), NOW(), 'Systems Engineer Specialist', 'Contribute to enterprise application delivery, issue resolution, code maintenance, and production support within large client programs.', '2026 batch B.Tech/BE CSE, IT, ECE, EEE with 6.0+ CGPA, foundational programming and database skills', '2026 batch B.Tech/BE CSE, IT, ECE, EEE with 6.0+ CGPA, foundational programming and database skills', 'Bengaluru, Karnataka', '7.25 LPA', '2026-06-25', b'1', 4, 5),
(5, NOW(), NOW(), 'Application Development Associate', 'Build, test, and maintain application modules, support agile delivery, and participate in cloud-oriented development assignments.', '2026 batch B.Tech/BE or MCA with 6.5+ CGPA, Java or web development basics, strong communication', '2026 batch B.Tech/BE or MCA with 6.5+ CGPA, Java or web development basics, strong communication', 'Pune, Maharashtra', '6.8 LPA', '2026-06-27', b'1', 5, 6),
(6, NOW(), NOW(), 'Digital Engineering Trainee', 'Join digital engineering delivery teams, work on modern application stacks, and support feature implementation across enterprise accounts.', '2026 batch B.Tech/BE CSE, IT, ECE with 6.0+ CGPA, problem-solving, coding fundamentals, adaptability', '2026 batch B.Tech/BE CSE, IT, ECE with 6.0+ CGPA, problem-solving, coding fundamentals, adaptability', 'Bengaluru, Karnataka', '7.0 LPA', '2026-06-30', b'1', 6, 7),
(7, NOW(), NOW(), 'Cloud Support Associate', 'Assist cloud operations teams by investigating support cases, monitoring systems, and resolving service platform issues with engineering guidance.', '2026 batch B.Tech/BE CSE, IT, ECE with 7.0+ CGPA, cloud basics, networking, Linux, and scripting awareness', '2026 batch B.Tech/BE CSE, IT, ECE with 7.0+ CGPA, cloud basics, networking, Linux, and scripting awareness', 'Hyderabad, Telangana', '12.0 LPA', '2026-07-02', b'1', 1, 2),
(8, NOW(), NOW(), 'Business Technology Analyst', 'Translate business requirements into solution inputs, support analytics reporting, and coordinate with consulting and delivery stakeholders.', '2026 batch B.Tech/BE, BCA, MCA with 6.5+ CGPA, business analysis, SQL, presentation, and stakeholder skills', '2026 batch B.Tech/BE, BCA, MCA with 6.5+ CGPA, business analysis, SQL, presentation, and stakeholder skills', 'Bengaluru, Karnataka', '10.2 LPA', '2026-07-05', b'1', 3, 4),
(9, NOW(), NOW(), 'Data Engineering Associate', 'Work on ingestion pipelines, SQL transformations, data quality checks, and foundational engineering tasks for analytics programs.', '2026 batch B.Tech/BE CSE, IT, AI/ML, Data Science with 6.5+ CGPA, SQL, Python, ETL, and data modeling basics', '2026 batch B.Tech/BE CSE, IT, AI/ML, Data Science with 6.5+ CGPA, SQL, Python, ETL, and data modeling basics', 'Mysuru, Karnataka', '7.8 LPA', '2026-07-08', b'1', 4, 5),
(10, NOW(), NOW(), 'Quality Engineering Analyst', 'Validate application quality through manual and API testing, defect reporting, regression planning, and release coordination support.', '2026 batch B.Tech/BE or MCA with 6.0+ CGPA, testing concepts, API validation, defect logging, and SDLC awareness', '2026 batch B.Tech/BE or MCA with 6.0+ CGPA, testing concepts, API validation, defect logging, and SDLC awareness', 'Chennai, Tamil Nadu', '6.5 LPA', '2026-07-10', b'1', 5, 6);

INSERT INTO applications (id, created_at, updated_at, status, student_id, job_id) VALUES
(1, NOW(), NOW(), 'SHORTLISTED', 1, 1),
(2, NOW(), NOW(), 'IN_REVIEW', 1, 3),
(3, NOW(), NOW(), 'APPLIED', 2, 2),
(4, NOW(), NOW(), 'IN_REVIEW', 2, 5),
(5, NOW(), NOW(), 'SHORTLISTED', 3, 8),
(6, NOW(), NOW(), 'APPLIED', 3, 10),
(7, NOW(), NOW(), 'SELECTED', 4, 4),
(8, NOW(), NOW(), 'APPLIED', 5, 1),
(9, NOW(), NOW(), 'IN_REVIEW', 5, 7),
(10, NOW(), NOW(), 'SHORTLISTED', 6, 9),
(11, NOW(), NOW(), 'REJECTED', 7, 2),
(12, NOW(), NOW(), 'APPLIED', 8, 6);

COMMIT;
