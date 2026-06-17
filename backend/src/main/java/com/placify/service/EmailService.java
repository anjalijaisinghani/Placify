
package com.placify.service;

import com.placify.enums.ApplicationStatus;

public interface EmailService {

    void sendApplicationConfirmation(String toEmail, String studentName,
                                     String jobTitle, String companyName);

    void sendStatusUpdate(String toEmail, String studentName,
                          String jobTitle, String companyName,
                          ApplicationStatus status);

    void sendNewJobAlert(String toEmail, String studentName,
                         String jobTitle, String companyName,
                         String location, String salaryPackage,
                         String deadline);

    void sendPasswordReset(String toEmail, String name, String resetLink);

    void sendVerificationEmail(String toEmail, String name, String verifyLink);

    void sendOtpEmail(String toEmail, String name, String otp);

    /**
     * Notifies the recruiter that a new application has been received.
     * Includes the student's profile details and a link to their resume.
     */
    void sendNewApplicationToRecruiter(String recruiterEmail,
                                       String studentName,
                                       String studentEmail,
                                       String studentBranch,
                                       Double studentCgpa,
                                       String studentSkills,
                                       String resumePath,
                                       String jobTitle,
                                       String companyName);
}