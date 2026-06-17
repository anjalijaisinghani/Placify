package com.placify.dto.admin;

import lombok.Data;

@Data
public class PendingRecruiterResponse {

    private Long id;
    private String name;
    private String email;

    private String company;
    private String position;

    private String verificationStatus;
}