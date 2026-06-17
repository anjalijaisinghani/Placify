import {
    apiRequest,
    clearPendingJob,
    escapeHtml,
    formatDate,
    formatDateTime,
    getPendingJob,
    requireAuth,
    titleCase,
    truncate
} from "./api.js";
import {
    consumeFlashInto,
    emptyState,
    initializeLayout,
    renderLoadingCards,
    renderLoadingStats,
    renderLoadingSummary,
    renderStats,
    setPageBusy,
    setButtonBusy
} from "./common.js";

function toast(icon, title) {
    Swal.fire({
        icon,
        title,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true
    });
}

// Timeline steps (REJECTED and SELECTED are outcome nodes, not progress steps)
const PROGRESS_STEPS = [
    { key: "APPLIED",     label: "Applied" },
    { key: "IN_REVIEW",   label: "Under Review" },
    { key: "SHORTLISTED", label: "Shortlisted" },
    { key: "INTERVIEW",   label: "Interview" }
];
const STEP_INDEX = { APPLIED: 0, IN_REVIEW: 1, SHORTLISTED: 2, INTERVIEW: 3 };

const CHECK_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 6 5 9 10 3"/></svg>`;
const CROSS_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/></svg>`;
const STAR_SVG  = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.4 2.9L11 4.4l-2.5 2.4.6 3.4L6 8.8l-3.1 1.4.6-3.4L1 4.4l3.6-.5z"/></svg>`;

function renderTimeline(status, updatedAt) {
    const isSelected = status === "SELECTED";
    const isRejected = status === "REJECTED";
    const activeIdx = STEP_INDEX[status] ?? -1;

    const stepsHtml = PROGRESS_STEPS.map((step, i) => {
        let cls;
        if (isSelected) {
            cls = "done";
        } else if (isRejected) {
            cls = i === 0 ? "done" : "pending"; // only "Applied" is guaranteed done on reject
        } else {
            if (i < activeIdx) cls = "done";
            else if (i === activeIdx) cls = "active";
            else cls = "pending";
        }

        const nodeContent = cls === "done" ? CHECK_SVG : i + 1;
        const connector = i < PROGRESS_STEPS.length - 1
            ? `<div class="tl-connector ${cls === "done" ? "done" : ""}"></div>`
            : "";

        return `
            <div class="tl-step ${cls}">
                <div class="tl-node">${nodeContent}</div>
                <span class="tl-label">${step.label}</span>
            </div>
            ${connector}
        `;
    }).join("");

    const outcomeCls  = isSelected ? "outcome-success" : isRejected ? "outcome-danger" : "outcome-pending";
    const outcomeIcon = isSelected ? STAR_SVG : isRejected ? CROSS_SVG : "?";
    const outcomeLabel = isSelected ? "Offered" : isRejected ? "Rejected" : "Decision";
    const connectorCls = isSelected ? "done" : "";

    const updatedLine = updatedAt
        ? `<p class="tl-updated">Last updated ${escapeHtml(formatDateTime(updatedAt))}</p>`
        : "";

    return `
        <div class="app-timeline">
            ${stepsHtml}
            <div class="tl-connector ${connectorCls}"></div>
            <div class="tl-step ${outcomeCls}">
                <div class="tl-node">${outcomeIcon}</div>
                <span class="tl-label">${outcomeLabel}</span>
            </div>
        </div>
        ${updatedLine}
    `;
}

const state = {
    user: null,
    jobs: [],
    applications: [],
    selectedJob: null
};

const statsGrid = document.getElementById("statsGrid");
const applicationsSummary = document.getElementById("applicationsSummary");
const studentView = document.getElementById("studentView");
const managerView = document.getElementById("managerView");
const selectedJobCard = document.getElementById("selectedJobCard");
const applyForm = document.getElementById("applyForm");
const applyButton = document.getElementById("applyButton");
const studentApplicationsGrid = document.getElementById("studentApplicationsGrid");
const managerFilterForm = document.getElementById("managerFilterForm");
const managerJobFilter = document.getElementById("managerJobFilter");
const managerStatusFilter = document.getElementById("managerStatusFilter");
const applicationsTableBody = document.getElementById("applicationsTableBody");
const resetManagerFiltersButton = document.getElementById("resetManagerFiltersButton");

document.addEventListener("DOMContentLoaded", init);

async function init() {
    setPageBusy(true, "Loading applications...");
    const user = await requireAuth(["STUDENT", "ADMIN", "RECRUITER"]);
    if (!user) { setPageBusy(false); return; }

    state.user = user;
    initializeLayout("applications", user);

    const msgEl = document.getElementById("pageMessage");
    if (msgEl) consumeFlashInto(msgEl);

    renderLoadingSummary(applicationsSummary, 3);
    renderLoadingStats(statsGrid, 4);

    if (user.role === "STUDENT") {
        configureStudentView();
        bindStudentEvents();
        renderLoadingCards(selectedJobCard, 1);
        renderLoadingCards(studentApplicationsGrid, 3);
        await loadStudentView();
        setPageBusy(false);
        return;
    }

    configureManagerView();
    bindManagerEvents();
    await loadManagerView();
    setPageBusy(false);
}

function configureStudentView() {
    document.getElementById("applicationsBadge").textContent = "Student Applications";
    document.getElementById("applicationsTitle").textContent = "Submit and track your applications.";
    document.getElementById("applicationsSubtitle").textContent =
        "Selected jobs appear here for quick submission, and your recent applications stay visible below.";
    managerView.classList.add("hidden");
    studentView.classList.remove("hidden");
}

function configureManagerView() {
    const roleTitle = state.user.role === "ADMIN" ? "Admin Application Review" : "Recruiter Application Review";
    document.getElementById("applicationsBadge").textContent = roleTitle;
    document.getElementById("applicationsTitle").textContent = "Review candidate pipelines and update statuses.";
    document.getElementById("applicationsSubtitle").textContent =
        "Filter applications by job or status, then move candidates through the process from one page.";
    studentView.classList.add("hidden");
    managerView.classList.remove("hidden");
}

function bindStudentEvents() {
    applyForm.addEventListener("submit", submitApplication);
}

function bindManagerEvents() {
    managerFilterForm.addEventListener("submit", handleManagerFilter);
    resetManagerFiltersButton.addEventListener("click", resetManagerFilters);
    applicationsTableBody.addEventListener("click", updateApplicationStatus);
}

async function loadStudentView() {
    try {
        const [applicationsPayload, selectedJob] = await Promise.all([
            apiRequest("/api/applications/my"),
            loadSelectedJob()
        ]);

        state.applications = applicationsPayload.data || [];
        state.selectedJob = selectedJob;

        renderStudentSummary();
        renderSelectedJob();
        renderStudentStats();
        renderStudentApplications();
    } catch (error) {
        toast("error", error.message);
    }
}

async function loadSelectedJob() {
    const queryJobId = new URLSearchParams(window.location.search).get("jobId");
    const jobId = Number(queryJobId || getPendingJob());
    if (!jobId) return null;

    try {
        const payload = await apiRequest(`/api/jobs/${jobId}`);
        return payload.data;
    } catch {
        clearPendingJob();
        return null;
    }
}

function renderStudentSummary() {
    applicationsSummary.innerHTML = `
        <div class="summary-item">
            <strong>Name</strong>
            <p>${escapeHtml(state.user.name)}</p>
        </div>
        <div class="summary-item">
            <strong>Email</strong>
            <p>${escapeHtml(state.user.email)}</p>
        </div>
        <div class="summary-item">
            <strong>Total Applications</strong>
            <p>${escapeHtml(state.applications.length)}</p>
        </div>
    `;
}

function renderStudentStats() {
    renderStats(statsGrid, [
        { label: "Applied Jobs",  value: state.applications.length },
        { label: "Shortlisted",   value: state.applications.filter((a) => a.status === "SHORTLISTED").length },
        { label: "Interview",     value: state.applications.filter((a) => a.status === "INTERVIEW").length },
        { label: "Selected",      value: state.applications.filter((a) => a.status === "SELECTED").length }
    ]);
}

function renderSelectedJob() {
    if (!state.selectedJob) {
        selectedJobCard.innerHTML = emptyState("Choose a job from the listings page to start an application.");
        applyForm.classList.add("hidden");
        return;
    }

    if (!state.selectedJob.active) {
        state.selectedJob = null;
        selectedJobCard.innerHTML = emptyState("The selected job is no longer active.");
        applyForm.classList.add("hidden");
        clearPendingJob();
        return;
    }

    document.getElementById("selectedJobId").value = state.selectedJob.id;
    applyForm.classList.remove("hidden");
    selectedJobCard.innerHTML = `
        <article class="card">
            <div class="card-head">
                <div class="chip-row">
                    <span class="status-pill ${state.selectedJob.active ? "success" : "warning"}">
                        ${state.selectedJob.active ? "Active" : "Inactive"}
                    </span>
                    <span class="micro-pill">${escapeHtml(state.selectedJob.companyName)}</span>
                </div>
                <h3>${escapeHtml(state.selectedJob.title)}</h3>
                <p class="card-summary">${escapeHtml(truncate(state.selectedJob.description, 150))}</p>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span>Eligibility</span>
                    <strong>${escapeHtml(state.selectedJob.eligibility)}</strong>
                </div>
                <div class="detail-item">
                    <span>Deadline</span>
                    <strong>${escapeHtml(formatDate(state.selectedJob.applicationDeadline))}</strong>
                </div>
                <div class="detail-item">
                    <span>Location</span>
                    <strong>${escapeHtml(state.selectedJob.location || "Remote")}</strong>
                </div>
                <div class="detail-item">
                    <span>Company</span>
                    <strong>${escapeHtml(state.selectedJob.companyName)}</strong>
                </div>
            </div>
        </article>
    `;
}

function renderStudentApplications() {
    if (!state.applications.length) {
        studentApplicationsGrid.innerHTML = emptyState("No applications submitted yet.");
        return;
    }

    studentApplicationsGrid.innerHTML = state.applications.map((app) => `
        <article class="card">
            <div class="card-head">
                <div class="chip-row">
                    <span class="micro-pill">${escapeHtml(app.companyName)}</span>
                </div>
                <h3>${escapeHtml(app.jobTitle)}</h3>
                <p class="tl-applied-date">Applied ${escapeHtml(formatDateTime(app.createdAt))}</p>
            </div>
            ${renderTimeline(app.status, app.updatedAt !== app.createdAt ? app.updatedAt : null)}
        </article>
    `).join("");
}

async function submitApplication(event) {
    event.preventDefault();
    setButtonBusy(applyButton, true, "Applying...");

    try {
        const jobId = Number(document.getElementById("selectedJobId").value);
        await apiRequest("/api/applications", { method: "POST", body: { jobId } });

        clearPendingJob();
        state.selectedJob = null;
        window.history.replaceState({}, "", "/applications.html");
        toast("success", "Application submitted successfully.");
        await loadStudentView();
    } catch (error) {
        toast("error", error.message);
    } finally {
        setButtonBusy(applyButton, false);
    }
}

async function loadManagerView() {
    try {
        const jobId = new URLSearchParams(window.location.search).get("jobId");
        const [jobsPayload, applicationsPayload] = await Promise.all([
            apiRequest("/api/jobs"),
            jobId ? apiRequest(`/api/applications/job/${jobId}`) : apiRequest("/api/applications")
        ]);

        state.jobs = jobsPayload.data || [];
        state.applications = applicationsPayload.data || [];

        renderManagerSummary();
        renderManagerStats();
        renderManagerFilters(jobId);
        renderManagerTable();
    } catch (error) {
        toast("error", error.message);
    }
}

function renderManagerSummary() {
    applicationsSummary.innerHTML = `
        <div class="summary-item">
            <strong>Name</strong>
            <p>${escapeHtml(state.user.name)}</p>
        </div>
        <div class="summary-item">
            <strong>Role</strong>
            <p>${escapeHtml(state.user.role)}</p>
        </div>
        <div class="summary-item">
            <strong>Applications Loaded</strong>
            <p>${escapeHtml(state.applications.length)}</p>
        </div>
    `;
}

function renderManagerStats() {
    renderStats(statsGrid, [
        { label: "Applications", value: state.applications.length },
        { label: "Jobs",         value: state.jobs.length },
        { label: "Shortlisted",  value: state.applications.filter((a) => a.status === "SHORTLISTED").length },
        { label: "Selected",     value: state.applications.filter((a) => a.status === "SELECTED").length }
    ]);
}

function renderManagerFilters(preselectedJobId) {
    managerJobFilter.innerHTML = `
        <option value="">All jobs</option>
        ${state.jobs.map((job) => `
            <option value="${job.id}" ${String(job.id) === String(preselectedJobId || "") ? "selected" : ""}>
                ${escapeHtml(job.title)} — ${escapeHtml(job.companyName)}
            </option>
        `).join("")}
    `;
}

const ALL_STATUSES = ["APPLIED", "IN_REVIEW", "SHORTLISTED", "INTERVIEW", "REJECTED", "SELECTED"];
const STATUS_LABELS = {
    APPLIED: "Applied", IN_REVIEW: "Under Review", SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview", REJECTED: "Rejected", SELECTED: "Selected"
};

function renderManagerTable() {
    const statusFilter = managerStatusFilter.value;
    const filtered = state.applications.filter((a) => !statusFilter || a.status === statusFilter);

    if (!filtered.length) {
        applicationsTableBody.innerHTML = `
            <tr><td colspan="6">${emptyState("No applications matched the selected filters.")}</td></tr>
        `;
        return;
    }

    applicationsTableBody.innerHTML = filtered.map((app) => `
        <tr>
            <td>${escapeHtml(app.studentName)}</td>
            <td>${escapeHtml(app.jobTitle)}</td>
            <td>${escapeHtml(app.companyName)}</td>
            <td>
                <select id="status-${app.id}">
                    ${ALL_STATUSES.map((s) => `
                        <option value="${s}" ${s === app.status ? "selected" : ""}>${escapeHtml(STATUS_LABELS[s])}</option>
                    `).join("")}
                </select>
            </td>
            <td>${escapeHtml(formatDateTime(app.createdAt))}</td>
            <td class="table-actions">
                <button class="button secondary" data-update-status="${app.id}" type="button">Save</button>
            </td>
        </tr>
    `).join("");
}

async function handleManagerFilter(event) {
    event.preventDefault();
    try {
        const jobId = managerJobFilter.value;
        const payload = await apiRequest(jobId ? `/api/applications/job/${jobId}` : "/api/applications");
        state.applications = payload.data || [];
        renderManagerStats();
        renderManagerTable();
    } catch (error) {
        toast("error", error.message);
    }
}

async function resetManagerFilters() {
    managerFilterForm.reset();
    window.history.replaceState({}, "", "/applications.html");
    await loadManagerView();
}

async function updateApplicationStatus(event) {
    const button = event.target.closest("[data-update-status]");
    if (!button) return;

    const applicationId = Number(button.dataset.updateStatus);
    const select = document.getElementById(`status-${applicationId}`);
    setButtonBusy(button, true, "Saving...");

    try {
        await apiRequest(`/api/applications/${applicationId}/status`, {
            method: "PATCH",
            body: { status: select.value }
        });
        toast("success", "Status updated.");
        await handleManagerFilter(new Event("submit"));
    } catch (error) {
        toast("error", error.message);
    } finally {
        setButtonBusy(button, false);
    }
}
