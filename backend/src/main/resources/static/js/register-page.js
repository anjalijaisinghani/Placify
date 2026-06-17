import {
    apiRequest,
    dashboardPathForRole,
    resolveCurrentUser,
    saveSession,
    setFlash
} from "./api.js";
import {
    consumeFlashInto,
    hideMessage,
    setButtonBusy,
    setPageBusy,
    showMessage
} from "./common.js";

const SKILL_SUGGESTIONS = [
    "Java", "Python", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Rust", "Kotlin", "Swift",
    "React", "Angular", "Vue.js", "Next.js", "Node.js", "Spring Boot", "Django", "Flask", "FastAPI",
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase",
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
    "Git", "Linux", "REST APIs", "GraphQL", "Machine Learning", "Data Analysis",
    "HTML", "CSS", "Figma", "UI/UX", "Agile", "Scrum"
];

const messageElement = document.getElementById("pageMessage");
const registerForm = document.getElementById("registerForm");
const registerButton = document.getElementById("registerButton");
const roleInput = document.getElementById("registerRole");
const studentFields = document.getElementById("studentFields");
const skillsBox = document.getElementById("skillsBox");
const skillsTypeInput = document.getElementById("skillsTypeInput");
const skillsDropdown = document.getElementById("skillsDropdown");
const skillsHidden = document.getElementById("registerSkills");

let selectedSkills = [];

document.addEventListener("DOMContentLoaded", init);

async function init() {
    consumeFlashInto(messageElement);
    initRoleTabs();
    initSkillsInput();
    registerForm.addEventListener("submit", handleRegister);
    setPageBusy(true, "Checking session...");

    try {
        const user = await resolveCurrentUser();
        if (user) {
            window.location.replace(dashboardPathForRole(user.role));
        }
    } catch {
        // no valid session
    } finally {
        setPageBusy(false);
    }
}

function initRoleTabs() {
    const tabs = document.querySelectorAll(".auth-role-tab");
    const recruiterInfo = document.getElementById("recruiterInfo");
    const subtitle = document.querySelector(".auth-subtitle");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            const role = tab.dataset.role;
            roleInput.value = role;
            const isStudent = role === "STUDENT";
            studentFields.classList.toggle("hidden", !isStudent);
            recruiterInfo.classList.toggle("hidden", isStudent);
            subtitle.textContent = isStudent
                ? "Free for students, forever"
                : "Post jobs and manage your hiring pipeline";
            ["registerBranch", "registerResume", "registerSkills"].forEach((id) => {
                document.getElementById(id).required = isStudent;
            });
        });
    });
}

function initSkillsInput() {
    skillsTypeInput.addEventListener("input", handleSkillInput);
    skillsTypeInput.addEventListener("keydown", handleSkillKeydown);
    skillsTypeInput.addEventListener("blur", () => {
        setTimeout(() => skillsDropdown.classList.add("hidden"), 150);
    });
    skillsTypeInput.addEventListener("focus", () => {
        if (skillsTypeInput.value.trim()) {
            showDropdown(skillsTypeInput.value.trim());
        }
    });

    skillsBox.addEventListener("click", (event) => {
        if (event.target.closest(".skill-chip-remove")) {
            const chip = event.target.closest(".skill-chip");
            const skill = chip.dataset.skill;
            removeSkill(skill);
        } else if (event.target === skillsBox || event.target.classList.contains("skills-box")) {
            skillsTypeInput.focus();
        }
    });
}

function handleSkillInput() {
    const value = skillsTypeInput.value;
    if (value.endsWith(",")) {
        const skill = value.slice(0, -1).trim();
        if (skill) {
            addSkill(skill);
        }
        skillsTypeInput.value = "";
        skillsDropdown.classList.add("hidden");
        return;
    }
    const trimmed = value.trim();
    if (trimmed.length > 0) {
        showDropdown(trimmed);
    } else {
        skillsDropdown.classList.add("hidden");
    }
}

function handleSkillKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const active = skillsDropdown.querySelector(".skill-suggestion.focused");
        if (active) {
            addSkill(active.textContent);
        } else {
            const value = skillsTypeInput.value.trim();
            if (value) {
                addSkill(value);
            }
        }
        skillsTypeInput.value = "";
        skillsDropdown.classList.add("hidden");
        return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        navigateDropdown(event.key === "ArrowDown" ? 1 : -1);
    }

    if (event.key === "Backspace" && skillsTypeInput.value === "" && selectedSkills.length > 0) {
        removeSkill(selectedSkills[selectedSkills.length - 1]);
    }
}

function showDropdown(query) {
    const lower = query.toLowerCase();
    const matches = SKILL_SUGGESTIONS.filter(
        (s) => s.toLowerCase().includes(lower) && !selectedSkills.includes(s)
    ).slice(0, 8);

    if (matches.length === 0) {
        skillsDropdown.classList.add("hidden");
        return;
    }

    skillsDropdown.innerHTML = matches.map((s) => `
        <div class="skill-suggestion" data-skill="${s}">${s}</div>
    `).join("");

    skillsDropdown.querySelectorAll(".skill-suggestion").forEach((item) => {
        item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            addSkill(item.dataset.skill);
            skillsTypeInput.value = "";
            skillsDropdown.classList.add("hidden");
            skillsTypeInput.focus();
        });
    });

    skillsDropdown.classList.remove("hidden");
}

function navigateDropdown(direction) {
    const items = [...skillsDropdown.querySelectorAll(".skill-suggestion")];
    if (items.length === 0) {
        return;
    }
    const currentIndex = items.findIndex((i) => i.classList.contains("focused"));
    const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
    items.forEach((i) => i.classList.remove("focused"));
    items[nextIndex].classList.add("focused");
}

function addSkill(skill) {
    const normalised = skill.trim();
    if (!normalised || selectedSkills.includes(normalised)) {
        return;
    }
    selectedSkills.push(normalised);
    renderChips();
    syncHiddenInput();
}

function removeSkill(skill) {
    selectedSkills = selectedSkills.filter((s) => s !== skill);
    renderChips();
    syncHiddenInput();
}

function renderChips() {
    const existingChips = skillsBox.querySelectorAll(".skill-chip");
    existingChips.forEach((c) => c.remove());

    const fragment = document.createDocumentFragment();
    selectedSkills.forEach((skill) => {
        const chip = document.createElement("span");
        chip.className = "skill-chip";
        chip.dataset.skill = skill;
        chip.innerHTML = `${skill}<button class="skill-chip-remove" type="button" aria-label="Remove ${skill}">&times;</button>`;
        fragment.appendChild(chip);
    });

    skillsBox.insertBefore(fragment, skillsTypeInput);
}

function syncHiddenInput() {
    skillsHidden.value = selectedSkills.join(",");
}

async function handleRegister(event) {
    event.preventDefault();
    hideMessage(messageElement);

    const role = roleInput.value;
    if (role === "STUDENT" && selectedSkills.length === 0) {
        showMessage(messageElement, "Please add at least one skill.", "error");
        return;
    }

    setButtonBusy(registerButton, true, "Creating account...");

    const body = {
        name: document.getElementById("registerName").value.trim(),
        email: document.getElementById("registerEmail").value.trim(),
        password: document.getElementById("registerPassword").value,
        role
    };

    if (role === "STUDENT") {
        body.branch = document.getElementById("registerBranch").value.trim();
        body.resume = document.getElementById("registerResume").value.trim();
        body.skills = skillsHidden.value;
    }

    try {
        const payload = await apiRequest("/api/auth/register", {
            method: "POST",
            skipAuth: true,
            body
        });

        saveSession(payload.data);
        setFlash("success", `Welcome to Placify, ${payload.data.user.name}.`);
        window.location.replace(dashboardPathForRole(payload.data.user.role));
    } catch (error) {
        showMessage(messageElement, error.message, "error");
    } finally {
        setButtonBusy(registerButton, false);
    }
}
