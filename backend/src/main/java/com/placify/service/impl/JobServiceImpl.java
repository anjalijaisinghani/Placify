package com.placify.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.placify.dto.job.JobRequest;
import com.placify.dto.job.JobResponse;
import com.placify.entity.Company;
import com.placify.entity.Job;
import com.placify.entity.User;
import com.placify.exception.ResourceNotFoundException;
import com.placify.repository.CompanyRepository;
import com.placify.repository.JobRepository;
import com.placify.repository.JobSpec;
import com.placify.repository.UserRepository;
import com.placify.enums.NotificationType;
import com.placify.service.JobService;
import com.placify.service.NotificationService;

import com.placify.entity.Student;
import com.placify.repository.StudentRepository;
import com.placify.service.EmailService;

import com.placify.enums.VerificationStatus;
import com.placify.exception.BadRequestException;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private final EmailService emailService;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public JobResponse createJob(String email, JobRequest request) {
        Company company = getCompany(request.getCompanyId());
        User currentUser = getUserByEmail(email);

        validateRecruiterApproval(currentUser);

        Job job = new Job();
        applyJobValues(job, request, company, currentUser);
        JobResponse saved = mapJob(jobRepository.save(job));

        String message = "New job posted: " + saved.getTitle() + " at " + saved.getCompanyName()
                + ". Apply before " + saved.getApplicationDeadline() + ".";
        notificationService.notifyAllStudents(NotificationType.NEW_JOB, message, saved.getId());

        List<Student> students = studentRepository.findAll();

        for (Student student : students) {

            if (student.getUser() == null) {
                continue;
            }

            emailService.sendNewJobAlert(
                    student.getUser().getEmail(),
                    student.getUser().getName(),
                    saved.getTitle(),
                    saved.getCompanyName(),
                    saved.getLocation(),
                    saved.getSalaryPackage(),
                    saved.getApplicationDeadline() != null
                            ? saved.getApplicationDeadline().toString()
                            : null
            );
        }

        return saved;
    }

    @Override
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapJob)
                .toList();
    }

    @Override
    public List<JobResponse> getFilteredJobs(String keyword, String location, Long companyId, Boolean active) {
        Specification<Job> spec = JobSpec.filter(keyword, location, companyId, active);
        return jobRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapJob)
                .toList();
    }

    @Override
    public JobResponse getJobById(Long jobId) {
        return mapJob(getJobEntity(jobId));
    }

    @Override
    public List<JobResponse> getJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(this::mapJob)
                .toList();
    }

    @Override
    public List<JobResponse> getAvailableJobs(String keyword, String location, Long companyId) {
        return getFilteredJobs(keyword, location, companyId, true);
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long jobId, String email, JobRequest request) {
        Job job = getJobEntity(jobId);
        Company company = getCompany(request.getCompanyId());
        User currentUser = getUserByEmail(email);

        validateRecruiterApproval(currentUser);

        applyJobValues(job, request, company, currentUser);
        return mapJob(jobRepository.save(job));
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, String email) {
        User currentUser = getUserByEmail(email);

        validateRecruiterApproval(currentUser);

        jobRepository.delete(getJobEntity(jobId));
    }

    @Override
    @Transactional
    public JobResponse toggleActive(Long jobId, String email) {
        User currentUser = getUserByEmail(email);

        validateRecruiterApproval(currentUser);

        Job job = getJobEntity(jobId);
        job.setActive(!job.isActive());
        return mapJob(jobRepository.save(job));
    }

    private void applyJobValues(Job job, JobRequest request, Company company, User currentUser) {
        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());
        job.setEligibility(request.getEligibility().trim());
        job.setEligibilityCriteria(request.getEligibility().trim());
        job.setLocation(request.getLocation() != null && !request.getLocation().isBlank()
                ? request.getLocation().trim()
                : (job.getLocation() != null ? job.getLocation() : "Remote"));
        job.setSalaryPackage(request.getSalaryPackage() != null && !request.getSalaryPackage().isBlank()
                ? request.getSalaryPackage().trim()
                : (job.getSalaryPackage() != null ? job.getSalaryPackage() : "Confidential"));
        job.setApplicationDeadline(request.getApplicationDeadline() != null
                ? request.getApplicationDeadline()
                : (job.getApplicationDeadline() != null ? job.getApplicationDeadline() : LocalDate.now().plusDays(30)));
        job.setMinCgpa(request.getMinCgpa());
        job.setActive(true);
        job.setCompany(company);
        job.setRecruiter(job.getRecruiter() != null ? job.getRecruiter() : currentUser);
    }

    private Company getCompany(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    private Job getJobEntity(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateRecruiterApproval(User user) {

        if (user.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new BadRequestException(
                    "Your recruiter account is pending admin approval."
            );
        }
    }

    private JobResponse mapJob(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .eligibility(job.getEligibility())
                .location(job.getLocation())
                .salaryPackage(job.getSalaryPackage())
                .applicationDeadline(job.getApplicationDeadline())
                .minCgpa(job.getMinCgpa())
                .active(job.isActive())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
