import { apiRequest, escapeHtml, requireAuth } from "./api.js";
import { emptyState, initializeLayout, setButtonBusy, setPageBusy } from "./common.js";

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
const profileCompany = document.getElementById("profileCompany");
const profilePosition = document.getElementById("profilePosition");
const profileExperience = document.getElementById("profileExperience");
const profileLinkedIn = document.getElementById("profileLinkedIn");
const profileBio = document.getElementById("profileBio");

document.addEventListener("DOMContentLoaded", init);

async function init() {
    setPageBusy(true, "Loading profile...");
    const user = await requireAuth(["RECRUITER", "ADMIN"]);
    if (!user) { setPageBusy(false); return; }

    state.user = user;
    initializeLayout("profile", user);

    profileForm.addEventListener("submit", handleSave);
    [profileCompany, profilePosition, profileExperience, profileLinkedIn, profileBio].forEach(
        (el) => el.addEventListener("input", syncSaveButton)
    );

    try {
        const payload = await apiRequest("/api/recruiters/me");
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
    return (
        profileCompany.value.trim() !== state.baseline.company ||
        profilePosition.value.trim() !== state.baseline.position ||
        profileExperience.value.trim() !== state.baseline.experience ||
        profileLinkedIn.value.trim() !== state.baseline.linkedIn ||
        profileBio.value.trim() !== state.baseline.bio
    );
}

function syncSaveButton() {
    profileSaveBtn.disabled = !hasChanges();
}

function renderSnapshot() {
    const p = state.profile;
    const initials = state.user.name
        .split(" ").slice(0, 2).map((w) => w.charAt(0)).join("");

    const expLabel = p?.experienceYears != null
        ? `${p.experienceYears} yr${p.experienceYears !== 1 ? "s" : ""} experience`
        : null;

    const linkedInHtml = p?.linkedIn
        ? `<a href="${escapeHtml(p.linkedIn)}" target="_blank" rel="noopener">${escapeHtml(p.linkedIn)}</a>`
        : "Not set";

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
                <span class="profile-meta-label">Company</span>
                <span class="profile-meta-value">${escapeHtml(p?.company || "Not set")}</span>
            </div>
            <div class="profile-meta-item">
                <span class="profile-meta-label">Position</span>
                <span class="profile-meta-value">${escapeHtml(p?.position || "Not set")}</span>
            </div>
            <div class="profile-meta-item">
                <span class="profile-meta-label">Experience</span>
                <span class="profile-meta-value">${expLabel ? escapeHtml(expLabel) : "Not set"}</span>
            </div>
            <div class="profile-meta-item">
                <span class="profile-meta-label">LinkedIn</span>
                <span class="profile-meta-value">${linkedInHtml}</span>
            </div>
            ${p?.bio ? `
            <div class="profile-meta-item" style="grid-column:1/-1">
                <span class="profile-meta-label">Bio</span>
                <span class="profile-meta-value">${escapeHtml(p.bio)}</span>
            </div>` : ""}
        </div>
    `;
}

function populateForm() {
    profileCompany.value = state.profile?.company || "";
    profilePosition.value = state.profile?.position || "";
    profileExperience.value = state.profile?.experienceYears != null ? state.profile.experienceYears : "";
    profileLinkedIn.value = state.profile?.linkedIn || "";
    profileBio.value = state.profile?.bio || "";

    state.baseline = {
        company: profileCompany.value.trim(),
        position: profilePosition.value.trim(),
        experience: profileExperience.value.trim(),
        linkedIn: profileLinkedIn.value.trim(),
        bio: profileBio.value.trim()
    };
    syncSaveButton();
}

async function handleSave(event) {
    event.preventDefault();
    setButtonBusy(profileSaveBtn, true, "Saving...");

    const expRaw = profileExperience.value.trim();

    try {
        const payload = await apiRequest("/api/recruiters/me", {
            method: "PUT",
            body: {
                company: profileCompany.value.trim() || null,
                position: profilePosition.value.trim() || null,
                experienceYears: expRaw ? parseInt(expRaw, 10) : null,
                linkedIn: profileLinkedIn.value.trim() || null,
                bio: profileBio.value.trim() || null
            }
        });

        state.profile = payload.data;
        state.baseline = {
            company: profileCompany.value.trim(),
            position: profilePosition.value.trim(),
            experience: profileExperience.value.trim(),
            linkedIn: profileLinkedIn.value.trim(),
            bio: profileBio.value.trim()
        };
        renderSnapshot();
        toast("success", "Profile updated successfully.");
    } catch (error) {
        toast("error", error.message);
    } finally {
        setButtonBusy(profileSaveBtn, false);
        syncSaveButton();
    }
}
