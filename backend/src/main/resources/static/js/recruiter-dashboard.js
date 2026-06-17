import {
    apiRequest,
    escapeHtml,
    formatDateTime,
    requireAuth,
    titleCase,
    truncate
} from "./api.js";
import {
    consumeFlashInto,
    emptyState,
    initializeLayout,
    renderLoadingCards,
    renderLoadingSummary,
    setPageBusy,
    setButtonBusy
} from "./common.js";

const ALL_STATUSES = ["APPLIED", "IN_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];

const STATUS_LABELS = {
    APPLIED: "Applied",
    IN_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview",
    SELECTED: "Selected",
    REJECTED: "Rejected"
};

const state = {
    user: null,
    companies: [],
    jobs: [],
    applications: [],
    pipeline: { jobId: null, jobTitle: "", applications: [] }
};

function toast(icon, title) {
    Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        icon,
        title
    });
}

const statsGrid = document.getElementById("statsGrid");
const managerSummary = document.getElementById("managerSummary");
const companiesList = document.getElementById("companiesList");
const companyHint = document.getElementById("companyHint");
const companyForm = document.getElementById("companyForm");
const companyButton = document.getElementById("companyButton");
const jobForm = document.getElementById("jobForm");
const jobButton = document.getElementById("jobButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const jobCompanyId = document.getElementById("jobCompanyId");
const managedJobsGrid = document.getElementById("managedJobsGrid");
const applicationPreviewGrid = document.getElementById("applicationPreviewGrid");
const pipelinePanel = document.getElementById("pipelinePanel");
const pipelineTitle = document.getElementById("pipelineTitle");
const pipelineContent = document.getElementById("pipelineContent");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const closePipelineBtn = document.getElementById("closePipelineBtn");

document.addEventListener("DOMContentLoaded", init);

async function init() {
    setPageBusy(true, "Loading management workspace...");
    const user = await requireAuth(["ADMIN", "RECRUITER"]);
    if (!user) {
        setPageBusy(false);
        return;
    }

    state.user = user;
    initializeLayout("dashboard", user);
    configureRoleView();
    bindEvents();
    renderLoadingSummary(managerSummary, 3);
    renderLoadingSummary(companiesList, 3);
    renderLoadingCards(managedJobsGrid, 3);
    renderLoadingCards(applicationPreviewGrid, 3);
    await loadDashboard();
    setPageBusy(false);
}

function configureRoleView() {
    if (state.user.role === "ADMIN") {
        document.getElementById("dashboardRoleBadge").textContent = "Admin Workspace";
        document.getElementById("dashboardHeroTitle").textContent = "Admin control over companies and job postings.";
        document.getElementById("dashboardHeroSubtitle").textContent =
            "Create companies, support recruiters, and monitor platform-wide application activity.";
        companyForm.classList.remove("hidden");
        companyHint.classList.add("hidden");
        return;
    }
    companyForm.classList.add("hidden");
    companyHint.classList.remove("hidden");
}

function bindEvents() {
    companyForm.addEventListener("submit", saveCompany);
    jobForm.addEventListener("submit", saveJob);
    managedJobsGrid.addEventListener("click", handleJobActions);
    closePipelineBtn.addEventListener("click", closePipeline);
    exportCsvBtn.addEventListener("click", exportCsv);
    pipelineContent.addEventListener("change", handleStatusChange);
    cancelEditButton.addEventListener("click", resetJobForm);
}

async function loadDashboard() {
    try {
        const [companiesPayload, jobsPayload, applicationsPayload] = await Promise.all([
            apiRequest("/api/companies"),
            apiRequest("/api/jobs"),
            apiRequest("/api/applications")
        ]);

        state.companies = companiesPayload.data || [];
        state.jobs = jobsPayload.data || [];
        state.applications = applicationsPayload.data || [];

        renderManagerSummary();
        populateCompanies();
        renderCompanies();
        renderJobs();
        renderApplicationsPreview();
        renderStatsBar();
    } catch (error) {
        toast("error", error.message);
    }
}

function renderManagerSummary() {
    managerSummary.innerHTML = `
        <div class="db-snap-item">
            <div class="db-snap-icon indigo">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
                    <circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
                </svg>
            </div>
            <div class="db-snap-text">
                <div class="db-snap-label">Name</div>
                <div class="db-snap-value">${escapeHtml(state.user.name)}</div>
            </div>
        </div>
        <div class="db-snap-item">
            <div class="db-snap-icon cyan">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
                    <rect x="1.5" y="4" width="13" height="10" rx="1.5"/>
                    <path d="M5.5 4V3A1.5 1.5 0 0 1 7 1.5h2A1.5 1.5 0 0 1 10.5 3v1"/>
                    <line x1="1.5" y1="8" x2="14.5" y2="8"/>
                </svg>
            </div>
            <div class="db-snap-text">
                <div class="db-snap-label">Role</div>
                <div class="db-snap-value">${escapeHtml(state.user.role)}</div>
            </div>
        </div>
        <div class="db-snap-item">
            <div class="db-snap-icon warning">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
                    <path d="M8 2L2 14h12L8 2z"/><line x1="8" y1="7" x2="8" y2="10"/><circle cx="8" cy="12" r="0.5" fill="currentColor"/>
                </svg>
            </div>
            <div class="db-snap-text">
                <div class="db-snap-label">Open Jobs</div>
                <div class="db-snap-value">${state.jobs.filter((j) => j.active).length} active</div>
            </div>
        </div>
    `;
}

function populateCompanies() {
    if (!state.companies.length) {
        jobCompanyId.innerHTML = '<option value="">No companies available</option>';
        return;
    }
    jobCompanyId.innerHTML = state.companies
        .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
        .join("");
}

function renderCompanies() {
    if (!state.companies.length) {
        companiesList.innerHTML = emptyState("No companies available yet.");
        return;
    }
    companiesList.innerHTML = state.companies
        .map(
            (c) => `
        <div class="co-card">
            <div class="co-card-logo">${escapeHtml(c.name.charAt(0))}</div>
            <div class="co-card-info">
                <div class="co-card-name">${escapeHtml(c.name)}</div>
                <div class="co-card-desc">${escapeHtml(truncate(c.description, 100))}</div>
            </div>
        </div>`
        )
        .join("");
}

function renderJobs() {
    if (!state.jobs.length) {
        managedJobsGrid.innerHTML = emptyState("No jobs posted yet. Use the form above to create your first posting.");
        return;
    }

    const jobCards = state.jobs
        .slice(0, 12)
        .map(
            (job) => `
        <article class="rjcard">
            <div class="rjcard-head">
                <div class="chip-row">
                    <span class="status-pill ${job.active ? "success" : "warning"}">${job.active ? "Active" : "Inactive"}</span>
                    <span class="micro-pill">${escapeHtml(job.companyName)}</span>
                </div>
                <div class="rjcard-title">${escapeHtml(job.title)}</div>
                <div class="rjcard-desc">${escapeHtml(truncate(job.description, 120))}</div>
            </div>
            <div class="rjcard-meta">
                <div class="rjcard-meta-item">
                    <span class="rjcard-meta-label">Location</span>
                    <span class="rjcard-meta-value">${escapeHtml(job.location || "—")}</span>
                </div>
                <div class="rjcard-meta-item">
                    <span class="rjcard-meta-label">Package</span>
                    <span class="rjcard-meta-value">${escapeHtml(job.salaryPackage || "—")}</span>
                </div>
                <div class="rjcard-meta-item">
                    <span class="rjcard-meta-label">Deadline</span>
                    <span class="rjcard-meta-value">${job.applicationDeadline ? escapeHtml(job.applicationDeadline) : "—"}</span>
                </div>
                <div class="rjcard-meta-item">
                    <span class="rjcard-meta-label">Posted</span>
                    <span class="rjcard-meta-value">${escapeHtml(formatDateTime(job.createdAt))}</span>
                </div>
            </div>
            <div class="rjcard-actions">
                <button class="button secondary sm" data-edit-job="${job.id}" type="button">Edit</button>
                <button class="button ${job.active ? "ghost" : "secondary"} sm" data-toggle-job="${job.id}" type="button">
                    ${job.active ? "Deactivate" : "Activate"}
                </button>
                <button class="button ghost sm" data-pipeline-job="${job.id}" data-pipeline-title="${escapeHtml(job.title)}" type="button">Applicants</button>
                <button class="button danger sm" data-delete-job="${job.id}" type="button">Delete</button>
            </div>
        </article>`
        )
        .join("");

    managedJobsGrid.innerHTML = `<div class="cards-grid">${jobCards}</div>`;
}

function renderApplicationsPreview() {
    if (!state.applications.length) {
        applicationPreviewGrid.innerHTML = emptyState("No applications submitted yet.");
        return;
    }

    const appCards = state.applications
        .slice(0, 6)
        .map((app) => {
            const initials = app.studentName
                .split(" ")
                .slice(0, 2)
                .map((p) => p.charAt(0))
                .join("");
            return `
        <article class="racard">
            <div class="racard-top">
                <div class="racard-student">
                    <div class="racard-avatar">${escapeHtml(initials)}</div>
                    <div>
                        <div class="racard-name">${escapeHtml(app.studentName)}</div>
                        <div class="racard-job">${escapeHtml(app.jobTitle)} &bull; ${escapeHtml(app.companyName)}</div>
                    </div>
                </div>
                <span class="status-pill ${statusTone(app.status)}">${escapeHtml(STATUS_LABELS[app.status] || titleCase(app.status))}</span>
            </div>
            <div class="racard-meta">
                <div class="racard-meta-item">
                    <span class="racard-meta-key">Applied</span>
                    <span class="racard-meta-val">${escapeHtml(formatDateTime(app.createdAt))}</span>
                </div>
                <div class="racard-meta-item">
                    <span class="racard-meta-key">Branch</span>
                    <span class="racard-meta-val">${escapeHtml(app.studentBranch || "—")}</span>
                </div>
            </div>
        </article>`;
        })
        .join("");

    applicationPreviewGrid.innerHTML = `<div class="cards-grid">${appCards}</div>`;
}

function renderStatsBar() {
    const activeJobs = state.jobs.filter((j) => j.active).length;
    const shortlisted = state.applications.filter(
        (a) => a.status === "SHORTLISTED" || a.status === "SELECTED"
    ).length;

    statsGrid.innerHTML = `
        <div class="scard">
            <div class="scard-icon cyan">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
                    <rect x="1.5" y="3" width="15" height="12" rx="1.5"/>
                    <path d="M6 3V1.5M12 3V1.5"/><line x1="1.5" y1="7" x2="16.5" y2="7"/>
                </svg>
            </div>
            <div class="scard-value">${state.companies.length}</div>
            <div class="scard-label">Companies</div>
        </div>
        <div class="scard">
            <div class="scard-icon indigo">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
                    <rect x="1.5" y="4.5" width="15" height="11" rx="1.5"/>
                    <path d="M5.5 4.5V3A1.5 1.5 0 0 1 7 1.5h4A1.5 1.5 0 0 1 12.5 3v1.5"/>
                    <line x1="1.5" y1="9" x2="16.5" y2="9"/>
                </svg>
            </div>
            <div class="scard-value">${activeJobs}</div>
            <div class="scard-label">Active Jobs</div>
        </div>
        <div class="scard">
            <div class="scard-icon warning">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
                    <path d="M3 3h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
                    <line x1="5" y1="7" x2="13" y2="7"/><line x1="5" y1="10" x2="13" y2="10"/><line x1="5" y1="13" x2="9" y2="13"/>
                </svg>
            </div>
            <div class="scard-value">${state.applications.length}</div>
            <div class="scard-label">Applications</div>
        </div>
        <div class="scard">
            <div class="scard-icon success">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
                    <circle cx="9" cy="9" r="7"/><path d="M6 9l2.5 2.5 4-4"/>
                </svg>
            </div>
            <div class="scard-value">${shortlisted}</div>
            <div class="scard-label">Shortlisted</div>
        </div>
    `;
}

async function saveCompany(event) {
    event.preventDefault();
    if (state.user.role !== "ADMIN") {
        toast("error", "Only admins can add companies.");
        return;
    }
    setButtonBusy(companyButton, true, "Saving...");
    try {
        await apiRequest("/api/companies", {
            method: "POST",
            body: {
                name: document.getElementById("companyName").value.trim(),
                description: document.getElementById("companyDescription").value.trim()
            }
        });
        companyForm.reset();
        toast("success", "Company added successfully.");
        await loadDashboard();
    } catch (error) {
        toast("error", error.message);
    } finally {
        setButtonBusy(companyButton, false);
    }
}

async function saveJob(event) {
    event.preventDefault();
    if (!jobCompanyId.value) {
        toast("error", "Add a company first before posting a job.");
        return;
    }

    const jobId = document.getElementById("jobId").value;
    setButtonBusy(jobButton, true, jobId ? "Updating..." : "Posting...");

    const path = jobId ? `/api/jobs/${jobId}` : "/api/jobs";
    const method = jobId ? "PUT" : "POST";
    const deadline = document.getElementById("jobDeadline").value;

    try {
        await apiRequest(path, {
            method,
            body: {
                title: document.getElementById("jobTitle").value.trim(),
                description: document.getElementById("jobDescription").value.trim(),
                companyId: Number(jobCompanyId.value),
                eligibility: document.getElementById("jobEligibility").value.trim(),
                location: document.getElementById("jobLocation").value.trim() || null,
                salaryPackage: document.getElementById("jobSalary").value.trim() || null,
                applicationDeadline: deadline || null
            }
        });

        resetJobForm();
        toast("success", jobId ? "Job updated successfully." : "Job posted successfully.");
        await loadDashboard();
    } catch (error) {
        toast("error", error.message);
    } finally {
        setButtonBusy(jobButton, false);
    }
}

async function handleJobActions(event) {
    const editBtn = event.target.closest("[data-edit-job]");
    const toggleBtn = event.target.closest("[data-toggle-job]");
    const pipelineBtn = event.target.closest("[data-pipeline-job]");
    const deleteBtn = event.target.closest("[data-delete-job]");

    if (editBtn) {
        populateJobForm(Number(editBtn.dataset.editJob));
        return;
    }

    if (toggleBtn) {
        await toggleJobActive(Number(toggleBtn.dataset.toggleJob));
        return;
    }

    if (pipelineBtn) {
        await openPipeline(Number(pipelineBtn.dataset.pipelineJob), pipelineBtn.dataset.pipelineTitle);
        return;
    }

    if (deleteBtn) {
        await deleteJob(Number(deleteBtn.dataset.deleteJob));
    }
}

async function toggleJobActive(jobId) {
    try {
        const res = await apiRequest(`/api/jobs/${jobId}/toggle`, { method: "PATCH" });
        const updated = res.data;
        state.jobs = state.jobs.map((j) => (j.id === jobId ? updated : j));
        renderJobs();
        renderStatsBar();
        renderManagerSummary();
        toast("success", updated.active ? "Job activated." : "Job deactivated.");
    } catch (error) {
        toast("error", error.message);
    }
}

async function deleteJob(jobId) {
    const confirmed = await Swal.fire({
        title: "Delete this job?",
        text: "This cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#ef4444",
        cancelButtonText: "Cancel"
    });
    if (!confirmed.isConfirmed) return;

    try {
        await apiRequest(`/api/jobs/${jobId}`, { method: "DELETE" });
        toast("success", "Job deleted.");
        if (state.pipeline.jobId === jobId) closePipeline();
        await loadDashboard();
    } catch (error) {
        toast("error", error.message);
    }
}

function populateJobForm(jobId) {
    const job = state.jobs.find((j) => j.id === jobId);
    if (!job) return;

    document.getElementById("jobId").value = job.id;
    document.getElementById("jobTitle").value = job.title;
    document.getElementById("jobDescription").value = job.description;
    document.getElementById("jobEligibility").value = job.eligibility;
    document.getElementById("jobCompanyId").value = String(job.companyId);
    document.getElementById("jobLocation").value = job.location || "";
    document.getElementById("jobSalary").value = job.salaryPackage || "";
    document.getElementById("jobDeadline").value = job.applicationDeadline || "";
    jobButton.textContent = "Update Job";
    cancelEditButton.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetJobForm() {
    jobForm.reset();
    document.getElementById("jobId").value = "";
    if (state.companies.length) {
        jobCompanyId.value = String(state.companies[0].id);
    }
    jobButton.textContent = "Post Job";
    cancelEditButton.classList.add("hidden");
}

async function openPipeline(jobId, jobTitleText) {
    state.pipeline.jobId = jobId;
    state.pipeline.jobTitle = jobTitleText;
    pipelineTitle.textContent = `Applicants — ${jobTitleText}`;
    pipelineContent.innerHTML = "<p style='padding:16px;color:var(--muted-light)'>Loading...</p>";
    pipelinePanel.classList.remove("hidden");
    pipelinePanel.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
        const res = await apiRequest(`/api/applications/job/${jobId}`);
        state.pipeline.applications = res.data || [];
        renderPipeline();
    } catch (error) {
        pipelineContent.innerHTML = `<p style='padding:16px;color:var(--danger)'>${escapeHtml(error.message)}</p>`;
    }
}

function closePipeline() {
    pipelinePanel.classList.add("hidden");
    state.pipeline = { jobId: null, jobTitle: "", applications: [] };
}

function renderPipeline() {
    const apps = state.pipeline.applications;
    if (!apps.length) {
        pipelineContent.innerHTML = emptyState("No applications for this job yet.");
        return;
    }

    const statusOptions = ALL_STATUSES.map(
        (s) => `<option value="${s}">${STATUS_LABELS[s]}</option>`
    ).join("");

    const rows = apps
        .map((app) => {
            const initials = app.studentName
                .split(" ")
                .slice(0, 2)
                .map((p) => p.charAt(0))
                .join("");
            return `
            <tr>
                <td>
                    <div class="pl-student">
                        <div class="pl-avatar">${escapeHtml(initials)}</div>
                        <div>
                            <div class="pl-name">${escapeHtml(app.studentName)}</div>
                            <div class="pl-branch">${escapeHtml(app.studentBranch || "—")}</div>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(app.studentEmail || "—")}</td>
                <td>${escapeHtml(app.studentBranch || "—")}</td>
                <td>${app.studentCgpa != null ? app.studentCgpa : "—"}</td>
                <td>
                    <select data-app-id="${app.id}" data-current-status="${app.status}">
                        ${ALL_STATUSES.map(
                            (s) => `<option value="${s}" ${s === app.status ? "selected" : ""}>${STATUS_LABELS[s]}</option>`
                        ).join("")}
                    </select>
                </td>
                <td>${escapeHtml(formatDateTime(app.createdAt))}</td>
            </tr>`;
        })
        .join("");

    pipelineContent.innerHTML = `
        <div class="pipeline-wrap">
            <table class="pipeline-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Branch</th>
                        <th>CGPA</th>
                        <th>Status</th>
                        <th>Applied</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

async function handleStatusChange(event) {
    const select = event.target.closest("select[data-app-id]");
    if (!select) return;

    const appId = Number(select.dataset.appId);
    const prevStatus = select.dataset.currentStatus;
    const newStatus = select.value;
    if (newStatus === prevStatus) return;

    select.disabled = true;
    try {
        await apiRequest(`/api/applications/${appId}/status`, {
            method: "PATCH",
            body: { status: newStatus }
        });
        select.dataset.currentStatus = newStatus;
        state.pipeline.applications = state.pipeline.applications.map((a) =>
            a.id === appId ? { ...a, status: newStatus } : a
        );
        state.applications = state.applications.map((a) =>
            a.id === appId ? { ...a, status: newStatus } : a
        );
        renderStatsBar();
        toast("success", `Status updated to ${STATUS_LABELS[newStatus]}.`);
    } catch (error) {
        select.value = prevStatus;
        toast("error", error.message);
    } finally {
        select.disabled = false;
    }
}

function exportCsv() {
    const apps = state.pipeline.applications;
    if (!apps.length) {
        toast("warning", "No applicants to export.");
        return;
    }

    const header = ["Name", "Email", "Branch", "CGPA", "Status", "Applied At"];
    const rows = apps.map((a) => [
        a.studentName,
        a.studentEmail || "",
        a.studentBranch || "",
        a.studentCgpa != null ? a.studentCgpa : "",
        STATUS_LABELS[a.status] || a.status,
        formatDateTime(a.createdAt)
    ]);

    const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applicants-${state.pipeline.jobTitle.replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast("success", "CSV exported.");
}

function statusTone(status) {
    if (status === "SELECTED" || status === "SHORTLISTED") return "success";
    if (status === "REJECTED") return "danger";
    return "warning";
}
