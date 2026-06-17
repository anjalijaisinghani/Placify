package com.placify.service.impl;

import com.placify.enums.ApplicationStatus;
import com.placify.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.enabled:true}")
    private boolean emailEnabled;

    // ── Application confirmed ────────────────────────────────────────

    @Override
    @Async("emailExecutor")
    public void sendApplicationConfirmation(String toEmail, String studentName,
                                            String jobTitle, String companyName) {
        if (!emailEnabled) return;
        String subject = "Application Received — " + jobTitle + " at " + companyName;
        String html = buildHtml(studentName,
                "Application Received",
                "Your application has been submitted successfully.",
                "<p>You applied for <strong>" + escape(jobTitle) + "</strong> at <strong>"
                        + escape(companyName) + "</strong>.</p>"
                        + "<p>We'll notify you as your application moves through the pipeline.</p>",
                "#6366f1");
        send(toEmail, subject, html);
    }

    // ── Status changed ───────────────────────────────────────────────

    @Override
    @Async("emailExecutor")
    public void sendStatusUpdate(String toEmail, String studentName,
                                 String jobTitle, String companyName,
                                 ApplicationStatus status) {
        if (!emailEnabled) return;
        String label = formatStatus(status);
        String color = statusColor(status);
        String subject = "Application Update — " + label + " | " + jobTitle;
        String html = buildHtml(studentName,
                "Application Status Update",
                "Your application status has changed.",
                "<p>Your application for <strong>" + escape(jobTitle) + "</strong> at <strong>"
                        + escape(companyName) + "</strong> has been updated to:</p>"
                        + "<div style='margin:20px 0;padding:14px 20px;background:" + color
                        + "22;border-left:4px solid " + color
                        + ";border-radius:6px;font-size:1.05rem;font-weight:700;color:" + color + "'>"
                        + escape(label) + "</div>"
                        + statusNote(status),
                color);
        send(toEmail, subject, html);
    }

    // ── Password reset ───────────────────────────────────────────────

    @Override
    @Async("emailExecutor")
    public void sendPasswordReset(String toEmail, String name, String resetLink) {
        if (!emailEnabled) return;
        String subject = "Reset your Placify password";
        String html = buildHtml(name,
                "Password Reset",
                "You requested a password reset.",
                "<p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>"
                        + "<div style='margin:24px 0;text-align:center'>"
                        + "<a href='" + resetLink + "' style='display:inline-block;padding:12px 28px;"
                        + "background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;"
                        + "font-weight:700;font-size:0.9rem;letter-spacing:0.02em'>Reset Password</a></div>"
                        + "<p style='font-size:0.78rem;color:#64748b'>If you did not request this, ignore this email. Your password will not change.</p>",
                "#6366f1");
        send(toEmail, subject, html);
    }

    //Email verification
    @Override
    @Async("emailExecutor")
    public void sendVerificationEmail(
            String toEmail,
            String name,
            String verifyLink
    ) {
        if (!emailEnabled) return;

        String subject = "Verify your Placify email";

        String html = buildHtml(
                name,
                "Verify Your Email",
                "One step left to activate your account.",
                "<p>Click the button below to verify your email address. "
                        + "This link expires in <strong>24 hours</strong>.</p>"
                        + "<div style='margin:24px 0;text-align:center'>"
                        + "<a href='" + verifyLink + "' "
                        + "style='display:inline-block;padding:12px 28px;"
                        + "background:#6366f1;color:#fff;border-radius:8px;"
                        + "text-decoration:none;font-weight:700;"
                        + "font-size:0.9rem;letter-spacing:0.02em'>"
                        + "Verify Email</a></div>"
                        + "<p style='font-size:0.78rem;color:#64748b'>"
                        + "If you did not create this account, ignore this email."
                        + "</p>",
                "#6366f1"
        );

        send(toEmail, subject, html);
    }

    //Email otp verification
    @Override
    @Async("emailExecutor")
    public void sendOtpEmail(String toEmail, String name, String otp) {
        if (!emailEnabled) return;
        String subject = "Your Placify verification code";
        String html = buildHtml(name,
                "Verify Your Email",
                "Use the code below to activate your account.",
                "<div style='text-align:center;margin:32px 0'>" +
                        "<div style='display:inline-block;padding:20px 40px;" +
                        "background:#6366f122;border:2px solid #6366f1;" +
                        "border-radius:12px;font-size:2.5rem;font-weight:800;" +
                        "letter-spacing:0.3em;color:#f1f5f9'>" + otp + "</div></div>" +
                        "<p style='text-align:center;color:#94a3b8;font-size:0.85rem'>" +
                        "This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>",
                "#6366f1");
        send(toEmail, subject, html);
    }
    // ── New job alert ────────────────────────────────────────────────

    @Override
    @Async("emailExecutor")
    public void sendNewJobAlert(String toEmail, String studentName,
                                String jobTitle, String companyName,
                                String location, String salaryPackage, String deadline) {
        if (!emailEnabled) return;
        String subject = "New Job Posted — " + jobTitle + " at " + companyName;
        String details = "<table style='width:100%;border-collapse:collapse;margin:16px 0'>"
                + row("Role", jobTitle)
                + row("Company", companyName)
                + row("Location", location != null ? location : "—")
                + row("Package", salaryPackage != null ? salaryPackage : "Confidential")
                + row("Deadline", deadline != null ? deadline : "—")
                + "</table>";
        String html = buildHtml(studentName,
                "New Opportunity",
                "A new job matching your profile has been posted.",
                details + "<p>Log in to Placify to view details and apply.</p>",
                "#06b6d4");
        send(toEmail, subject, html);
    }

    // ── New application → recruiter ────────────────────────────────

    @Override
    @Async("emailExecutor")
    public void sendNewApplicationToRecruiter(String recruiterEmail,
                                              String studentName,
                                              String studentEmail,
                                              String studentBranch,
                                              Double studentCgpa,
                                              String studentSkills,
                                              String resumePath,
                                              String jobTitle,
                                              String companyName) {
        if (!emailEnabled) return;
        String subject = "New Application — " + jobTitle + " at " + companyName;
        String cgpaStr = studentCgpa != null ? String.valueOf(studentCgpa) : "Not set";
        String branchStr = studentBranch != null ? studentBranch : "Not set";
        String skillsStr = studentSkills != null && !studentSkills.isBlank() ? studentSkills : "Not specified";
        String resumeSection;
        if (resumePath != null && !resumePath.isBlank()) {
            resumeSection = "<div style='margin:20px 0'><a href='" + resumePath + "' "
                    + "style='display:inline-block;padding:10px 24px;background:#6366f1;color:#fff;"
                    + "border-radius:8px;text-decoration:none;font-weight:700;font-size:0.88rem;'"
                    + ">&#128196; Download Resume</a></div>";
        } else {
            resumeSection = "<p style='color:#f87171'>No resume uploaded by this student.</p>";
        }
        String body = "<p>A new student has applied for <strong>" + escape(jobTitle) + "</strong> at <strong>"
                + escape(companyName) + "</strong>.</p>"
                + "<table style='width:100%;border-collapse:collapse;margin:16px 0'>"
                + row("Name", studentName)
                + row("Email", studentEmail)
                + row("Branch", branchStr)
                + row("CGPA", cgpaStr)
                + row("Skills", skillsStr)
                + "</table>"
                + resumeSection
                + "<p style='font-size:0.8rem;color:#64748b'>Log in to Placify to review the application and update its status.</p>";
        String html = buildHtml("Recruiter", "New Application Received",
                "A student just applied to one of your job postings.", body, "#6366f1");
        send(recruiterEmail, subject, html);
    }

    // ── Core send ────────────────────────────────────────────────────

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email sent → {} | {}", to, subject);
        } catch (Exception e) {
            log.error("Email failed → {} | {}", to, subject, e);
        }
    }

    // ── HTML template ────────────────────────────────────────────────

    private String buildHtml(String name, String heading, String subheading,
                             String body, String accentColor) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
                <body style="margin:0;padding:0;background:#07101f;font-family:'Segoe UI',Arial,sans-serif">
                  <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 16px">
                      <table width="600" cellpadding="0" cellspacing="0"
                             style="background:#0f1d32;border-radius:16px;overflow:hidden;
                                    border:1px solid rgba(255,255,255,0.08)">

                        <!-- Header -->
                        <tr><td style="background:linear-gradient(135deg,#0e1f40,#132a58);
                                       padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.07)">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <p style="margin:0;font-size:1.1rem;font-weight:700;color:#f1f5f9;
                                          letter-spacing:-0.02em">Placify</p>
                                <p style="margin:4px 0 0;font-size:0.75rem;color:#64748b">
                                  Campus Placement OS</p>
                              </td>
                              <td align="right">
                                <span style="display:inline-block;padding:5px 12px;border-radius:999px;
                                             background:%s22;color:%s;font-size:0.7rem;font-weight:700;
                                             border:1px solid %s44;letter-spacing:0.08em;
                                             text-transform:uppercase">
                                  %s
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td></tr>

                        <!-- Body -->
                        <tr><td style="padding:32px">
                          <p style="margin:0 0 6px;font-size:1.3rem;font-weight:700;color:#f1f5f9;
                                    letter-spacing:-0.03em">%s</p>
                          <p style="margin:0 0 24px;font-size:0.875rem;color:#94a3b8">%s</p>
                          <p style="margin:0 0 20px;font-size:0.875rem;color:#94a3b8">
                            Hi <strong style="color:#f1f5f9">%s</strong>,
                          </p>
                          <div style="font-size:0.875rem;color:#cbd5e1;line-height:1.7">%s</div>
                        </td></tr>

                        <!-- Footer -->
                        <tr><td style="padding:20px 32px;background:#0b1626;
                                       border-top:1px solid rgba(255,255,255,0.06)">
                          <p style="margin:0;font-size:0.75rem;color:#475569;text-align:center">
                            Placify — Smart Campus Placement OS &nbsp;&bull;&nbsp;
                            This is an automated message, do not reply.
                          </p>
                        </td></tr>

                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(accentColor, accentColor, accentColor, heading,
                heading, subheading, name, body);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private String row(String label, String value) {
        return "<tr style='border-bottom:1px solid rgba(255,255,255,0.05)'>"
                + "<td style='padding:10px 0;color:#64748b;font-size:0.78rem;font-weight:600;"
                + "text-transform:uppercase;letter-spacing:0.08em;width:110px'>" + escape(label) + "</td>"
                + "<td style='padding:10px 0;color:#f1f5f9;font-size:0.875rem;font-weight:500'>"
                + escape(value) + "</td></tr>";
    }

    private String statusNote(ApplicationStatus status) {
        return switch (status) {
            case SHORTLISTED -> "<p>Great news — you have been shortlisted! Stay tuned for further updates.</p>";
            case INTERVIEW   -> "<p>You have been invited for an interview. Check the platform for details.</p>";
            case SELECTED    -> "<p style='color:#10b981;font-weight:700'>Congratulations! You have been selected. 🎉</p>";
            case REJECTED    -> "<p>Thank you for applying. Keep exploring other opportunities on Placify.</p>";
            default          -> "";
        };
    }

    private String formatStatus(ApplicationStatus status) {
        return switch (status) {
            case APPLIED     -> "Applied";
            case IN_REVIEW   -> "Under Review";
            case SHORTLISTED -> "Shortlisted";
            case INTERVIEW   -> "Interview Scheduled";
            case SELECTED    -> "Selected — Congratulations!";
            case REJECTED    -> "Rejected";
        };
    }

    private String statusColor(ApplicationStatus status) {
        return switch (status) {
            case SELECTED, SHORTLISTED -> "#10b981";
            case REJECTED              -> "#f87171";
            case INTERVIEW             -> "#f59e0b";
            default                    -> "#6366f1";
        };
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}