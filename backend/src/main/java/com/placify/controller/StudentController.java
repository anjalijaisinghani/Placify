package com.placify.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placify.dto.common.ApiResponse;
import com.placify.dto.job.JobResponse;
import com.placify.dto.student.StudentProfileUpdateRequest;
import com.placify.dto.student.StudentRequest;
import com.placify.dto.student.StudentResponse;
import com.placify.service.JobService;
import com.placify.service.StudentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<StudentResponse>builder()
                        .success(true)
                        .message("Student created successfully")
                        .data(studentService.createStudent(request))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents() {
        return ResponseEntity.ok(
                ApiResponse.<List<StudentResponse>>builder()
                        .success(true)
                        .message("Students fetched successfully")
                        .data(studentService.getAllStudents())
                        .build()
        );
    }

    @GetMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(@PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.<StudentResponse>builder()
                        .success(true)
                        .message("Student fetched successfully")
                        .data(studentService.getStudentById(studentId))
                        .build()
        );
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentResponse>> getOwnProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.<StudentResponse>builder()
                        .success(true)
                        .message("Student profile fetched successfully")
                        .data(studentService.getOwnProfile(userDetails.getUsername()))
                        .build()
        );
    }

    @PutMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(@PathVariable Long studentId,
                                                                      @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<StudentResponse>builder()
                        .success(true)
                        .message("Student updated successfully")
                        .data(studentService.updateStudent(studentId, request))
                        .build()
        );
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentResponse>> updateOwnProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StudentProfileUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<StudentResponse>builder()
                        .success(true)
                        .message("Student profile updated successfully")
                        .data(studentService.updateOwnProfile(userDetails.getUsername(), request))
                        .build()
        );
    }

    @PostMapping("/me/resume")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentResponse>> uploadResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                ApiResponse.<StudentResponse>builder()
                        .success(true)
                        .message("Resume uploaded successfully")
                        .data(studentService.uploadResume(userDetails.getUsername(), file))
                        .build()
        );
    }

    @GetMapping("/me/jobs/available")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getAvailableJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String eligibility) {
        return ResponseEntity.ok(
                ApiResponse.<List<JobResponse>>builder()
                        .success(true)
                        .message("Available jobs fetched successfully")
                        .data(jobService.getAvailableJobs(title, eligibility,companyId))
                        .build()
        );
    }

    @DeleteMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long studentId) {
        studentService.deleteStudent(studentId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Student deleted successfully")
                        .build()
        );
    }

    @PostMapping("/me/saved-jobs/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> saveJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId) {
        studentService.saveJob(userDetails.getUsername(), jobId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder().success(true).message("Job saved").build()
        );
    }

    @DeleteMapping("/me/saved-jobs/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId) {
        studentService.unsaveJob(userDetails.getUsername(), jobId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder().success(true).message("Job removed from saved").build()
        );
    }

    @GetMapping("/me/saved-jobs/ids")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Long>>> getSavedJobIds(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.<List<Long>>builder()
                        .success(true)
                        .message("Saved job IDs fetched")
                        .data(studentService.getSavedJobIds(userDetails.getUsername()))
                        .build()
        );
    }

    @GetMapping("/me/saved-jobs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getSavedJobs(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.<List<JobResponse>>builder()
                        .success(true)
                        .message("Saved jobs fetched")
                        .data(studentService.getSavedJobs(userDetails.getUsername()))
                        .build()
        );
    }
}
