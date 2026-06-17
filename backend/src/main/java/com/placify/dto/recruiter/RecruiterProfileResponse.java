package com.placify.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileResponse {

    private Long id;

    private String name;

    private String email;

    private String company;

    private String companyWebsite;

    private String position;

    private String phoneNumber;

    private Integer experienceYears;

    private String bio;

    private String linkedIn;

    private String companyVerificationNote;
}