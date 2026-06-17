package com.placify.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.placify.dto.job.JobResponse;
import com.placify.dto.student.StudentProfileUpdateRequest;
import com.placify.dto.student.StudentRequest;
import com.placify.dto.student.StudentResponse;
import com.placify.entity.Job;
import com.placify.entity.SavedJob;
import com.placify.entity.Student;
import com.placify.entity.User;
import com.placify.enums.Role;
import com.placify.exception.BadRequestException;
import com.placify.exception.ResourceNotFoundException;
import com.placify.repository.JobRepository;
import com.placify.repository.SavedJobRepository;
import com.placify.repository.StudentRepository;
import com.placify.repository.UserRepository;
import com.placify.service.StudentService;


@Service
@Transactional(readOnly = true)
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public StudentServiceImpl(StudentRepository studentRepository, UserRepository userRepository,
                              JobRepository jobRepository, SavedJobRepository savedJobRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.savedJobRepository = savedJobRepository;
    }

    @Override
    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        User user = getStudentUser(request.getUserId());
        if (studentRepository.existsByUserId(user.getId())) {
            throw new BadRequestException("Student record already exists for this user");
        }

        Student student = new Student();
        applyStudentValues(student, request, user);

        return mapStudent(studentRepository.save(student));
    }

    @Override
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapStudent)
                .toList();
    }

    @Override
    public StudentResponse getStudentById(Long studentId) {
        return mapStudent(getStudentEntity(studentId));
    }

    @Override
    public StudentResponse getOwnProfile(String email) {
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return mapStudent(student);
    }

    @Override
    @Transactional
    public StudentResponse updateStudent(Long studentId, StudentRequest request) {
        Student student = getStudentEntity(studentId);
        User user = getStudentUser(request.getUserId());

        if (!student.getUser().getId().equals(user.getId()) && studentRepository.existsByUserId(user.getId())) {
            throw new BadRequestException("Student record already exists for this user");
        }

        applyStudentValues(student, request, user);
        return mapStudent(studentRepository.save(student));
    }

    @Override
    @Transactional
    public StudentResponse updateOwnProfile(String email, StudentProfileUpdateRequest request) {
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        student.setSkills(request.getSkills().trim());
        student.setBranch(request.getBranch().trim());
        if (request.getResume() != null && !request.getResume().isBlank()) {
            student.setResume(request.getResume().trim());
        }
        if (request.getCgpa() != null) {
            student.setCgpa(request.getCgpa());
        }
        return mapStudent(studentRepository.save(student));
    }

    @Override
    @Transactional
    public StudentResponse uploadResume(String email, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("No file provided");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new BadRequestException("Only PDF files are allowed");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 2MB");
        }

        Student student = studentRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        try {
            Path resumeDir = Paths.get(uploadDir, "resumes");
            Files.createDirectories(resumeDir);
            String filename = student.getId() + "_" + UUID.randomUUID() + ".pdf";
            Path destination = resumeDir.resolve(filename);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            student.setResume("/resumes/" + filename);
            return mapStudent(studentRepository.save(student));
        } catch (IOException e) {
            throw new BadRequestException("Failed to store resume file");
        }
    }

    @Override
    @Transactional
    public void deleteStudent(Long studentId) {
        studentRepository.delete(getStudentEntity(studentId));
    }

    @Override
    @Transactional
    public void saveJob(String email, Long jobId) {
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        if (savedJobRepository.existsByStudentIdAndJobId(student.getId(), jobId)) {
            return;
        }
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        savedJobRepository.save(new SavedJob(student, job));
    }

    @Override
    @Transactional
    public void unsaveJob(String email, Long jobId) {
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        savedJobRepository.deleteByStudentIdAndJobId(student.getId(), jobId);
    }

    @Override
    public List<Long> getSavedJobIds(String email) {
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return savedJobRepository.findByStudentId(student.getId()).stream()
                .map(sj -> sj.getJob().getId())
                .toList();
    }

    @Override
    public List<JobResponse> getSavedJobs(String email) {
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return savedJobRepository.findByStudentId(student.getId()).stream()
                .map(sj -> mapJob(sj.getJob()))
                .toList();
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
                .active(job.isActive())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    private User getStudentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("Only users with STUDENT role can be linked to a student record");
        }
        return user;
    }

    private Student getStudentEntity(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    private void applyStudentValues(Student student, StudentRequest request, User user) {
        student.setUser(user);
        student.setSkills(request.getSkills().trim());
        student.setResume(request.getResume().trim());
        student.setBranch(request.getBranch().trim());
    }

    private StudentResponse mapStudent(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .name(student.getUser().getName())
                .email(student.getUser().getEmail())
                .branch(student.getBranch())
                .skills(student.getSkills())
                .resume(student.getResume())
                .cgpa(student.getCgpa())
                .build();
    }
}
