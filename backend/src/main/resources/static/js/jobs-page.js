import {
    apiRequest,
    buildQuery,
    clearPendingJob,
    dashboardPathForRole,
    escapeHtml,
    formatDate,
    resolveCurrentUser,
    setFlash,
    setPendingJob,
    truncate
} from "./api.js";
import {
    consumeFlashInto,
    emptyState,
    initializeLayout,
    renderLoadingCards,
    setPageBusy,
    showMessage
} from "./common.js";

const BOOKMARK_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/></svg>`;

const state = {
    user: null,
    companies: [],
    jobs: [],
    savedJobIds: new Set(),
    activeTab: "all"
};

const messageElement = document.getElementById("pageMessage");
const jobsMeta = document.getElementById("jobsMeta");
const jobsGrid = document.getElementById("jobsGrid");
const filterForm = document.getElementById("filterForm");
const filterCompanyId = document.getElementById("filterCompanyId");
const resetFiltersButton = document.getElementById("resetFiltersButton");

document.addEventListener("DOMContentLoaded", init);

async function init() {
    setPageBusy(true, "Loading job board...");
    try {
        state.user = await resolveCurrentUser();
    } catch {
        state.user = null;
    }

    initializeLayout("jobs", state.user);
    consumeFlashInto(messageElement);
    clearPendingJob();
    renderToolbarAction();
    injectTabRow();
    bindEvents();
    jobsMeta.textContent = "Loading roles...";
    renderLoadingCards(jobsGrid, 6);

    const loads = [loadCompanies(), loadJobs()];
    if (state.user?.role === "STUDENT") loads.push(loadSavedIds());
    await Promise.all(loads);
    setPageBusy(false);
}

function injectTabRow() {
    if (state.user?.role !== "STUDENT") return;
    const toolbar = document.querySelector(".toolbar");
    if (!toolbar) return;

    const tabRow = document.createElement("div");
    tabRow.className = "tab-row";
    tabRow.innerHTML = `
        <button class="tab-btn active" data-tab="all" type="button">All Jobs</button>
        <button class="tab-btn" data-tab="saved" type="button">Saved Jobs</button>
    `;
    toolbar.after(tabRow);

    tabRow.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-tab]");
        if (!btn || btn.classList.contains("active")) return;
        tabRow.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeTab = btn.dataset.tab;
        renderLoadingCards(jobsGrid, 6);
        if (state.activeTab === "saved") {
            await loadSavedJobs();
        } else {
            await loadJobs();
        }
    });
}

function bindEvents() {
    filterForm.addEventListener("submit", handleFilterSubmit);
    resetFiltersButton.addEventListener("click", resetFilters);
    jobsGrid.addEventListener("click", handleJobActions);
}

async function loadCompanies() {
    try {
        const payload = await apiRequest("/api/companies", { skipAuth: true });
        state.companies = payload.data || [];
        renderCompanyOptions();
    } catch (error) {
        showMessage(messageElement, error.message, "error");
    }
}

async function loadJobs() {
    try {
        const params = {
            title: document.getElementById("filterTitle").value.trim(),
            companyId: filterCompanyId.value,
            eligibility: document.getElementById("filterEligibility").value.trim(),
            active: document.getElementById("filterActive").value
        };
        const payload = await apiRequest(`/api/jobs${buildQuery(params)}`, { skipAuth: true });
        state.jobs = payload.data || [];
        renderJobs(state.jobs);
    } catch (error) {
        showMessage(messageElement, error.message, "error");
    }
}

async function loadSavedIds() {
    try {
        const payload = await apiRequest("/api/students/me/saved-jobs/ids");
        state.savedJobIds = new Set(payload.data || []);
    } catch { /* silent */ }
}

async function loadSavedJobs() {
    try {
        const payload = await apiRequest("/api/students/me/saved-jobs");
        const jobs = payload.data || [];
        renderJobs(jobs, true);
    } catch (error) {
        showMessage(messageElement, error.message, "error");
    }
}

function renderToolbarAction() {
    const el = document.getElementById("jobsToolbarAction");
    if (!el) return;
    if (!state.user) {
        el.innerHTML = `<a class="button secondary" href="/login.html">Sign In</a>`;
    } else if (state.user.role === "STUDENT") {
        el.innerHTML = `<a class="button secondary" href="/student-dashboard.html">My Dashboard</a>`;
    } else {
        el.innerHTML = `<a class="button secondary" href="${dashboardPathForRole(state.user.role)}">Dashboard</a>`;
    }
}

function renderCompanyOptions() {
    filterCompanyId.innerHTML = `
        <option value="">All companies</option>
        ${state.companies.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}
    `;
}

function renderJobs(jobs, isSavedTab = false) {
    jobsMeta.textContent = isSavedTab
        ? `${jobs.length} saved role${jobs.length === 1 ? "" : "s"}`
        : `${jobs.length} role${jobs.length === 1 ? "" : "s"} found`;

    if (!jobs.length) {
        jobsGrid.innerHTML = emptyState(
            isSavedTab ? "No saved jobs yet. Bookmark roles you want to revisit." : "No jobs matched the selected filters."
        );
        return;
    }

    jobsGrid.innerHTML = jobs.map((job) => {
        const isSaved = state.savedJobIds.has(job.id);
        const showBookmark = state.user?.role === "STUDENT";

        return `
            <article class="card">
                <div class="card-head-row">
                    <div class="card-head">
                        <div class="chip-row">
                            <span class="status-pill ${job.active ? "success" : "warning"}">
                                ${job.active ? "Active" : "Inactive"}
                            </span>
                            <span class="micro-pill">${escapeHtml(job.companyName)}</span>
                        </div>
                        <h3>${escapeHtml(job.title)}</h3>
                        <p class="card-summary">${escapeHtml(truncate(job.description, 150))}</p>
                    </div>
                    ${showBookmark ? `
                        <button class="bookmark-btn ${isSaved ? "saved" : ""}"
                                data-bookmark-job="${job.id}"
                                type="button"
                                aria-label="${isSaved ? "Remove bookmark" : "Save job"}">
                            ${BOOKMARK_ICON}
                        </button>
                    ` : ""}
                </div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span>Eligibility</span>
                        <strong>${escapeHtml(job.eligibility)}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Deadline</span>
                        <strong>${escapeHtml(formatDate(job.applicationDeadline))}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Location</span>
                        <strong>${escapeHtml(job.location || "Remote")}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Package</span>
                        <strong>${escapeHtml(job.salaryPackage || "Confidential")}</strong>
                    </div>
                </div>
                <div class="panel-actions">
                    ${renderActionButton(job)}
                </div>
            </article>
        `;
    }).join("");
}

function renderActionButton(job) {
    if (!job.active) return '<button class="button ghost" type="button" disabled>Closed</button>';
    if (!state.user) return '<a class="button primary" href="/index.html">Login to Apply</a>';
    if (state.user.role === "STUDENT") {
        return `<button class="button primary" data-apply-job="${job.id}" type="button">Apply for Job</button>`;
    }
    return `<a class="button secondary" href="${dashboardPathForRole(state.user.role)}">Open Dashboard</a>`;
}

async function handleFilterSubmit(event) {
    event.preventDefault();
    await loadJobs();
}

async function resetFilters() {
    filterForm.reset();
    document.getElementById("filterActive").value = "true";
    await loadJobs();
}

async function handleJobActions(event) {
    const applyBtn = event.target.closest("[data-apply-job]");
    if (applyBtn) {
        handleApply(applyBtn);
        return;
    }

    const bookmarkBtn = event.target.closest("[data-bookmark-job]");
    if (bookmarkBtn) {
        await toggleBookmark(bookmarkBtn);
    }
}

function handleApply(button) {
    if (!state.user) {
        setFlash("error", "Please login as a student to apply.");
        window.location.href = "/index.html";
        return;
    }
    if (state.user.role !== "STUDENT") {
        setFlash("error", "Only students can apply for jobs.");
        window.location.href = dashboardPathForRole(state.user.role);
        return;
    }
    const jobId = Number(button.dataset.applyJob);
    setPendingJob(jobId);
    window.location.href = `/applications.html?jobId=${jobId}`;
}

async function toggleBookmark(button) {
    const jobId = Number(button.dataset.bookmarkJob);
    const isSaved = state.savedJobIds.has(jobId);

    // Optimistic UI update
    if (isSaved) {
        state.savedJobIds.delete(jobId);
        button.classList.remove("saved");
        button.setAttribute("aria-label", "Save job");
        button.querySelector("svg").style.fill = "";
    } else {
        state.savedJobIds.add(jobId);
        button.classList.add("saved");
        button.setAttribute("aria-label", "Remove bookmark");
    }

    try {
        if (isSaved) {
            await apiRequest(`/api/students/me/saved-jobs/${jobId}`, { method: "DELETE" });
        } else {
            await apiRequest(`/api/students/me/saved-jobs/${jobId}`, { method: "POST" });
        }
        // If on saved tab and unbookmarked, remove the card
        if (isSaved && state.activeTab === "saved") {
            button.closest("article")?.remove();
            const remaining = jobsGrid.querySelectorAll("article").length;
            jobsMeta.textContent = `${remaining} saved role${remaining === 1 ? "" : "s"}`;
            if (!remaining) jobsGrid.innerHTML = emptyState("No saved jobs yet. Bookmark roles you want to revisit.");
        }
    } catch {
        // Revert on failure
        if (isSaved) {
            state.savedJobIds.add(jobId);
            button.classList.add("saved");
        } else {
            state.savedJobIds.delete(jobId);
            button.classList.remove("saved");
        }
    }
}
