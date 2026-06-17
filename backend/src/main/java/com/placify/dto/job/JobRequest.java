package com.placify.dto.job;

import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 120, message = "Job title must not exceed 120 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 3000, message = "Description must not exceed 3000 characters")
    private String description;

    @NotNull(message = "Company id is required")
    private Long companyId;

    @NotBlank(message = "Eligibility is required")
    @Size(max = 1000, message = "Eligibility must not exceed 1000 characters")
    private String eligibility;

    @Size(max = 120, message = "Location must not exceed 120 characters")
    private String location;

    @Size(max = 50, message = "Salary package must not exceed 50 characters")
    private String salaryPackage;

    private LocalDate applicationDeadline;

    @DecimalMin(value = "0.0", message = "Minimum CGPA cannot be negative")
    @DecimalMax(value = "10.0", message = "Minimum CGPA cannot exceed 10")
    private Double minCgpa;
}
