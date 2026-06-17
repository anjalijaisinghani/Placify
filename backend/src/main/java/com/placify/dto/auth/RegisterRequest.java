package com.placify.dto.auth;

import com.placify.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 120, message = "Email must not exceed 120 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,100}$",
            message = "Password must be 8–100 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    )
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    @Size(max = 1000, message = "Skills must not exceed 1000 characters")
    private String skills;

    @Size(max = 255, message = "Resume must not exceed 255 characters")
    private String resume;

    @Size(max = 100, message = "Branch must not exceed 100 characters")
    private String branch;

    @Size(max = 150, message = "Company must not exceed 150 characters")
    private String company;

    @Size(max = 200, message = "Company website must not exceed 200 characters")
    private String companyWebsite;

    @Size(max = 100, message = "Position must not exceed 100 characters")
    private String position;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;
}

