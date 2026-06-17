import {
    apiRequest,
    apiUpload,
    consumeFlash,
    escapeHtml,
    requireAuth
} from "./api.js";
import {
    emptyState,
    initializeLayout,
    setButtonBusy,
    setPageBusy
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

const state = { user: null, profile: null, baseline: null };

const profileSnapshot = document.getElementById("profileSnapshot");
const profileForm = document.getElementById("profileForm");
const profileSaveBtn = document.getElementById("profileSaveBtn");
const profileBranch = document.getElementById("profileBranch");
const profileSkills = document.getElementById("profileSkills");
const profileCgpa = document.getElementById("profileCgpa");
const resumeFile = document.getElementById("resumeFile");
const resumeZone = document.getElementById("resumeZone");
const resumeZoneLabel = document.getElementById("resumeZoneLabel");
const resumeCurrentHint = document.getElementById("resumeCurrentHint");

document.addEventListener("DOMContentLoaded", init);

async function init() {
    setPageBusy(true, "Loading profile...");
    const user = await requireAuth(["STUDENT"]);
    if (!user) { setPageBusy(false); return; }

    state.user = user;
    initializeLayout("profile", user);

    const flash = consumeFlash();
    if (flash) toast(flash.type === "success" ? "success" : "error", flash.message);

    profileForm.addEventListener("submit", handleSave);
    resumeFile.addEventListener("change", handleFileChange);
    profileBranch.addEventListener("input", syncSaveButton);
    profileSkills.addEventListener("input", syncSaveButton);
    profileCgpa.addEventListener("input", syncSaveButton);

    try {
        const payload = await apiRequest("/api/students/me");
        state.profile = payload.data;
        renderSnapshot();
        populateForm();
    } catch (error) {
        toast("error", error.message);
    } finally {
        setPageBusy(false);
    }
}

function hasChanges() {
    if (!state.baseline) return false;
    if (resumeFile.files.length > 0) return true;
    return (
        profileBranch.value.trim() !== state.baseline.branch ||
        profileSkills.value.trim() !== state.baseline.skills ||
        profileCgpa.value.trim() !== state.baseline.cgpa
    );
}

function syncSaveButton() {
    profileSaveBtn.disabled = !hasChanges();
}

function renderSnapshot() {
    if (!state.profile) {
        profileSnapshot.innerHTML = emptyState("Profile not found.");
        return;
    }

    const initials = state.user.name
        .split(" ").slice(0, 2).map((p) => p.charAt(0)).join("");

    const skillTags = (state.profile.skills || "")
        .split(",").map((s) => s.trim()).filter(Boolean)
        .map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`)
        .join("");

    profileSnapshot.innerHTML = `
        <div class="profile-avatar-row">
            <div class="profile-avatar">${escapeHtml(initials)}</div>
            <div>
                <div class="profile-card-name">${escapeHtml(state.user.name)}</div>
                <div class="profile-card-sub">${escapeHtml(state.user.email)}</div>
            </div>
        </div>
        <div class="profile-meta-row">
            <div class="profile-meta-item">
                <span class="profile-meta-label">Branch</span>
                <span class="profile-meta-value">${escapeHtml(state.profile.branch || "Not set")}</span>
            </div>
            <div class="profile-meta-item">
                <span class="profile-meta-label">CGPA</span>
                <span class="profile-meta-value">${state.profile.cgpa != null ? escapeHtml(String(state.profile.cgpa)) : "Not set"}</span>
            </div>
            <div class="profile-meta-item">
                <span class="profile-meta-label">Resume</span>
                <span class="profile-meta-value">
                    ${state.profile.resume
                        ? `<a href="${escapeHtml(state.profile.resume)}" target="_blank" rel="noopener">View Resume &rarr;</a>`
                        : "Not uploaded"}
                </span>
            </div>
            <div class="profile-meta-item">
                <span class="profile-meta-label">Skills</span>
                ${skillTags
                    ? `<div class="skill-tags">${skillTags}</div>`
                    : `<span class="profile-meta-value">No skills added</span>`}
            </div>
        </div>
    `;
}

function populateForm() {
    profileBranch.value = state.profile?.branch || "";
    profileSkills.value = state.profile?.skills || "";
    profileCgpa.value = state.profile?.cgpa != null ? state.profile.cgpa : "";
    state.baseline = {
        branch: profileBranch.value.trim(),
        skills: profileSkills.value.trim(),
        cgpa: profileCgpa.value.trim()
    };
    syncResumeHint();
    syncSaveButton();
}

function syncResumeHint() {
    if (state.profile?.resume) {
        const filename = state.profile.resume.split("/").pop();
        resumeCurrentHint.innerHTML = `Current: <a href="${escapeHtml(state.profile.resume)}" target="_blank" rel="noopener">${escapeHtml(filename)}</a>`;
    } else {
        resumeCurrentHint.textContent = "No resume uploaded yet.";
    }
}

function handleFileChange() {
    const file = resumeFile.files[0];
    if (!file) { resetZone(); return; }

    if (file.type !== "application/pdf") {
        toast("error", "Only PDF files are allowed.");
        resetZone();
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        toast("error", "File size must not exceed 2 MB.");
        resetZone();
        return;
    }
    resumeZoneLabel.textContent = file.name;
    resumeZone.classList.add("has-file");
    syncSaveButton();
}

function resetZone() {
    resumeFile.value = "";
    resumeZoneLabel.textContent = "Click to choose PDF";
    resumeZone.classList.remove("has-file");
    syncSaveButton();
}

async function handleSave(event) {
    event.preventDefault();
    setButtonBusy(profileSaveBtn, true, "Saving...");

    try {
        const file = resumeFile.files[0];
        if (file) {
            setButtonBusy(profileSaveBtn, true, "Uploading resume...");
            const formData = new FormData();
            formData.append("file", file);
            const uploadPayload = await apiUpload("/api/students/me/resume", formData);
            state.profile = uploadPayload.data;
            resetZone();
        }

        setButtonBusy(profileSaveBtn, true, "Saving...");
        const cgpaRaw = profileCgpa.value.trim();
        const payload = await apiRequest("/api/students/me", {
            method: "PUT",
            body: {
                branch: profileBranch.value.trim(),
                skills: profileSkills.value.trim(),
                resume: state.profile?.resume || "",
                cgpa: cgpaRaw ? parseFloat(cgpaRaw) : null
            }
        });

        state.profile = payload.data;
        state.baseline = {
            branch: profileBranch.value.trim(),
            skills: profileSkills.value.trim(),
            cgpa: profileCgpa.value.trim()
        };
        renderSnapshot();
        syncResumeHint();
        toast("success", "Profile updated successfully.");
    } catch (error) {
        toast("error", error.message);
    } finally {
        setButtonBusy(profileSaveBtn, false);
        syncSaveButton();
    }
}
