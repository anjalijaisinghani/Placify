package com.placify.dto.application;

import java.time.LocalDateTime;

import com.placify.enums.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentBranch;
    private Double studentCgpa;
    private String studentResume;   // NEW: resume path/URL for recruiter view
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private ApplicationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}