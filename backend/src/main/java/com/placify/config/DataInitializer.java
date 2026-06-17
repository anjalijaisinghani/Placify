package com.placify.config;

import java.time.LocalDate;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.placify.entity.Application;
import com.placify.entity.Company;
import com.placify.entity.Job;
import com.placify.entity.Student;
import com.placify.entity.User;
import com.placify.enums.ApplicationStatus;
import com.placify.enums.Role;
import com.placify.repository.ApplicationRepository;
import com.placify.repository.CompanyRepository;
import com.placify.repository.JobRepository;
import com.placify.repository.StudentRepository;
import com.placify.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_PASSWORD = "Admin@Placify2026";
    private static final String RECRUITER_PASSWORD = "Recruiter@Placify2026";
    private static final String STUDENT_PASSWORD = "Student@Placify2026";

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        User admin = upsertUser(
                "Priya Sharma",
                "admin@Placify.com",
                ADMIN_PASSWORD,
                Role.ADMIN);

        upsertUser("Aarav Mehta", "recruiter.microsoft@Placify.com", RECRUITER_PASSWORD, Role.RECRUITER);
        upsertUser("Neha Kulkarni", "recruiter.amazon@Placify.com", RECRUITER_PASSWORD, Role.RECRUITER);
        upsertUser("Rishi Bhatia", "recruiter.deloitte@Placify.com", RECRUITER_PASSWORD, Role.RECRUITER);
        upsertUser("Kavya Reddy", "recruiter.infosys@Placify.com", RECRUITER_PASSWORD, Role.RECRUITER);
        upsertUser("Arjun Nair", "recruiter.accenture@Placify.com", RECRUITER_PASSWORD, Role.RECRUITER);
        upsertUser("Siddharth Jain", "recruiter.tcs@Placify.com", RECRUITER_PASSWORD, Role.RECRUITER);

        upsertStudent(
                "Ananya Gupta",
                "ananya.gupta@Placify.com",
                "Computer Science Engineering",
                "Java, Spring Boot, MySQL, REST APIs, DSA",
                "ananya-gupta-resume.pdf");
        upsertStudent(
                "Rohan Verma",
                "rohan.verma@Placify.com",
                "Information Technology",
                "JavaScript, SQL, Node.js, React, Git",
                "rohan-verma-resume.pdf");
        upsertStudent(
                "Sneha Iyer",
                "sneha.iyer@Placify.com",
                "Artificial Intelligence and Machine Learning",
                "Python, SQL, FastAPI, Machine Learning, Power BI",
                "sneha-iyer-resume.pdf");
        upsertStudent(
                "Aditya Rao",
                "aditya.rao@Placify.com",
                "Electronics and Communication Engineering",
                "Java, DBMS, Operating Systems, Computer Networks",
                "aditya-rao-resume.pdf");
        upsertStudent(
                "Meera Nair",
                "meera.nair@Placify.com",
                "Computer Science Engineering",
                "Spring Boot, Docker, PostgreSQL, Microservices, GitHub Actions",
                "meera-nair-resume.pdf");
        upsertStudent(
                "Kunal Singh",
                "kunal.singh@Placify.com",
                "Data Science",
                "Python, Pandas, SQL, ETL, Data Visualization",
                "kunal-singh-resume.pdf");
        upsertStudent(
                "Ishita Kapoor",
                "ishita.kapoor@Placify.com",
                "Computer Engineering",
                "DSA, Java, OOP, AWS Basics, Problem Solving",
                "ishita-kapoor-resume.pdf");
        upsertStudent(
                "Vivek Menon",
                "vivek.menon@Placify.com",
                "Information Technology",
                "Java, Manual Testing, SQL, Postman, Git",
                "vivek-menon-resume.pdf");

        upsertCompany(
                "Microsoft",
                "Technology",
                "https://www.microsoft.com/",
                "Bengaluru, Karnataka",
                "Global technology company building cloud, productivity, AI, and enterprise developer platforms.",
                admin);
        upsertCompany(
                "Amazon",
                "E-commerce and Cloud",
                "https://www.amazon.jobs/",
                "Hyderabad, Telangana",
                "Global commerce and cloud platform hiring campus engineers for scalable backend and platform systems.",
                admin);
        upsertCompany(
                "Deloitte",
                "Consulting and Professional Services",
                "https://www.deloitte.com/",
                "Hyderabad, Telangana",
                "Advisory and consulting network delivering enterprise transformation, analytics, and technology programs.",
                admin);
        upsertCompany(
                "Infosys",
                "IT Services and Consulting",
                "https://www.infosys.com/",
                "Bengaluru, Karnataka",
                "Digital services and consulting company focused on enterprise delivery, modernization, and cloud engineering.",
                admin);
        upsertCompany(
                "Accenture",
                "Technology Consulting",
                "https://www.accenture.com/in-en",
                "Pune, Maharashtra",
                "Professional services company hiring associates for application engineering, cloud, and digital delivery.",
                admin);
        upsertCompany(
                "Tata Consultancy Services",
                "IT Services and Consulting",
                "https://www.tcs.com/",
                "Mumbai, Maharashtra",
                "Enterprise technology and consulting organization with large-scale campus hiring across software and digital roles.",
                admin);

        upsertJob(
                "Associate Software Engineer",
                "Microsoft",
                "recruiter.microsoft@Placify.com",
                "Build and maintain enterprise backend services, contribute to code reviews, and work with cross-functional engineering teams on scalable product features.",
                "2026 batch B.Tech/BE CSE, IT, ECE with 7.0+ CGPA, no active backlogs, strong DSA and Java fundamentals",
                "Bengaluru, Karnataka",
                "18.0 LPA",
                LocalDate.of(2026, 6, 15));
        upsertJob(
                "Software Development Engineer I",
                "Amazon",
                "recruiter.amazon@Placify.com",
                "Design, develop, test, and improve distributed software components supporting high-scale commerce and internal platform services.",
                "2026 batch B.Tech/BE CSE, IT, EE with 7.0+ CGPA, strong problem-solving, OOP, and coding round readiness",
                "Hyderabad, Telangana",
                "20.5 LPA",
                LocalDate.of(2026, 6, 18));
        upsertJob(
                "Analyst - Technology Consulting",
                "Deloitte",
                "recruiter.deloitte@Placify.com",
                "Support consulting engagements through requirement analysis, data validation, SQL-based insights, and technology solution documentation.",
                "2026 batch B.Tech/BE or MCA with 6.5+ CGPA, strong analytical skills, SQL, communication, and teamwork",
                "Hyderabad, Telangana",
                "9.5 LPA",
                LocalDate.of(2026, 6, 20));
        upsertJob(
                "Systems Engineer Specialist",
                "Infosys",
                "recruiter.infosys@Placify.com",
                "Contribute to enterprise application delivery, issue resolution, code maintenance, and production support within large client programs.",
                "2026 batch B.Tech/BE CSE, IT, ECE, EEE with 6.0+ CGPA, foundational programming and database skills",
                "Bengaluru, Karnataka",
                "7.25 LPA",
                LocalDate.of(2026, 6, 25));
        upsertJob(
                "Application Development Associate",
                "Accenture",
                "recruiter.accenture@Placify.com",
                "Build, test, and maintain application modules, support agile delivery, and participate in cloud-oriented development assignments.",
                "2026 batch B.Tech/BE or MCA with 6.5+ CGPA, Java or web development basics, strong communication",
                "Pune, Maharashtra",
                "6.8 LPA",
                LocalDate.of(2026, 6, 27));
        upsertJob(
                "Digital Engineering Trainee",
                "Tata Consultancy Services",
                "recruiter.tcs@Placify.com",
                "Join digital engineering delivery teams, work on modern application stacks, and support feature implementation across enterprise accounts.",
                "2026 batch B.Tech/BE CSE, IT, ECE with 6.0+ CGPA, problem-solving, coding fundamentals, adaptability",
                "Bengaluru, Karnataka",
                "7.0 LPA",
                LocalDate.of(2026, 6, 30));
        upsertJob(
                "Cloud Support Associate",
                "Microsoft",
                "recruiter.microsoft@Placify.com",
                "Assist cloud operations teams by investigating support cases, monitoring systems, and resolving service platform issues with engineering guidance.",
                "2026 batch B.Tech/BE CSE, IT, ECE with 7.0+ CGPA, cloud basics, networking, Linux, and scripting awareness",
                "Hyderabad, Telangana",
                "12.0 LPA",
                LocalDate.of(2026, 7, 2));
        upsertJob(
                "Business Technology Analyst",
                "Deloitte",
                "recruiter.deloitte@Placify.com",
                "Translate business requirements into solution inputs, support analytics reporting, and coordinate with consulting and delivery stakeholders.",
                "2026 batch B.Tech/BE, BCA, MCA with 6.5+ CGPA, business analysis, SQL, presentation, and stakeholder skills",
                "Bengaluru, Karnataka",
                "10.2 LPA",
                LocalDate.of(2026, 7, 5));
        upsertJob(
                "Data Engineering Associate",
                "Infosys",
                "recruiter.infosys@Placify.com",
                "Work on ingestion pipelines, SQL transformations, data quality checks, and foundational engineering tasks for analytics programs.",
                "2026 batch B.Tech/BE CSE, IT, AI/ML, Data Science with 6.5+ CGPA, SQL, Python, ETL, and data modeling basics",
                "Mysuru, Karnataka",
                "7.8 LPA",
                LocalDate.of(2026, 7, 8));
        upsertJob(
                "Quality Engineering Analyst",
                "Accenture",
                "recruiter.accenture@Placify.com",
                "Validate application quality through manual and API testing, defect reporting, regression planning, and release coordination support.",
                "2026 batch B.Tech/BE or MCA with 6.0+ CGPA, testing concepts, API validation, defect logging, and SDLC awareness",
                "Chennai, Tamil Nadu",
                "6.5 LPA",
                LocalDate.of(2026, 7, 10));

        upsertApplication("ananya.gupta@Placify.com", "Associate Software Engineer", "Microsoft", ApplicationStatus.SHORTLISTED);
        upsertApplication("ananya.gupta@Placify.com", "Analyst - Technology Consulting", "Deloitte", ApplicationStatus.IN_REVIEW);
        upsertApplication("rohan.verma@Placify.com", "Software Development Engineer I", "Amazon", ApplicationStatus.APPLIED);
        upsertApplication("rohan.verma@Placify.com", "Application Development Associate", "Accenture", ApplicationStatus.IN_REVIEW);
        upsertApplication("sneha.iyer@Placify.com", "Business Technology Analyst", "Deloitte", ApplicationStatus.SHORTLISTED);
        upsertApplication("sneha.iyer@Placify.com", "Quality Engineering Analyst", "Accenture", ApplicationStatus.APPLIED);
        upsertApplication("aditya.rao@Placify.com", "Systems Engineer Specialist", "Infosys", ApplicationStatus.SELECTED);
        upsertApplication("meera.nair@Placify.com", "Associate Software Engineer", "Microsoft", ApplicationStatus.APPLIED);
        upsertApplication("meera.nair@Placify.com", "Cloud Support Associate", "Microsoft", ApplicationStatus.IN_REVIEW);
        upsertApplication("kunal.singh@Placify.com", "Data Engineering Associate", "Infosys", ApplicationStatus.SHORTLISTED);
        upsertApplication("ishita.kapoor@Placify.com", "Software Development Engineer I", "Amazon", ApplicationStatus.REJECTED);
        upsertApplication("vivek.menon@Placify.com", "Digital Engineering Trainee", "Tata Consultancy Services", ApplicationStatus.APPLIED);
    }

    private User upsertUser(String name,
                            String email,
                            String rawPassword,
                            Role role) {
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private Student upsertStudent(String name,
                                  String email,
                                  String branch,
                                  String skills,
                                  String resume) {
        User user = upsertUser(name, email, STUDENT_PASSWORD, Role.STUDENT);
        Student student = studentRepository.findByUserId(user.getId()).orElseGet(Student::new);
        student.setUser(user);
        student.setBranch(branch);
        student.setSkills(skills);
        student.setResume(resume);
        return studentRepository.save(student);
    }

    private Company upsertCompany(String name,
                                  String industry,
                                  String website,
                                  String location,
                                  String description,
                                  User createdBy) {
        Company company = companyRepository.findAll().stream()
                .filter(existing -> existing.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(Company::new);
        company.setName(name);
        company.setIndustry(industry);
        company.setWebsite(website);
        company.setLocation(location);
        company.setDescription(description);
        company.setCreatedBy(createdBy);
        return companyRepository.save(company);
    }

    private Job upsertJob(String title,
                          String companyName,
                          String recruiterEmail,
                          String description,
                          String eligibility,
                          String location,
                          String salaryPackage,
                          LocalDate deadline) {
        Company company = companyRepository.findAll().stream()
                .filter(existing -> existing.getName().equalsIgnoreCase(companyName))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Company not found for seed: " + companyName));
        User recruiter = userRepository.findByEmailIgnoreCase(recruiterEmail)
                .orElseThrow(() -> new IllegalStateException("Recruiter not found for seed: " + recruiterEmail));

        Job job = jobRepository.findAll().stream()
                .filter(existing -> existing.getTitle().equalsIgnoreCase(title)
                        && existing.getCompany().getName().equalsIgnoreCase(companyName))
                .findFirst()
                .orElseGet(Job::new);
        job.setTitle(title);
        job.setDescription(description);
        job.setEligibility(eligibility);
        job.setEligibilityCriteria(eligibility);
        job.setLocation(location);
        job.setSalaryPackage(salaryPackage);
        job.setApplicationDeadline(deadline);
        job.setActive(true);
        job.setCompany(company);
        job.setRecruiter(recruiter);
        return jobRepository.save(job);
    }

    private void upsertApplication(String studentEmail,
                                   String jobTitle,
                                   String companyName,
                                   ApplicationStatus status) {
        Student student = studentRepository.findByUserEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new IllegalStateException("Student not found for seed: " + studentEmail));

        Job job = jobRepository.findAll().stream()
                .filter(existing -> existing.getTitle().equalsIgnoreCase(jobTitle)
                        && existing.getCompany().getName().equalsIgnoreCase(companyName))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Job not found for seed: " + jobTitle + " at " + companyName));

        Application application = applicationRepository.findAll().stream()
                .filter(existing -> existing.getStudent().getId().equals(student.getId())
                        && existing.getJob().getId().equals(job.getId()))
                .findFirst()
                .orElseGet(Application::new);

        application.setStudent(student);
        application.setJob(job);
        application.setStatus(status);
        applicationRepository.save(application);
    }
}
