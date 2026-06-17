import {
    apiRequest,
    dashboardPathForRole,
    getPendingJob,
    clearPendingJob,
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

const messageElement = document.getElementById("pageMessage");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");

document.addEventListener("DOMContentLoaded", init);

async function init() {
    consumeFlashInto(messageElement);
    loginForm.addEventListener("submit", handleLogin);
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

async function handleLogin(event) {
    event.preventDefault();
    hideMessage(messageElement);
    setButtonBusy(loginButton, true, "Signing in...");

    try {
        const payload = await apiRequest("/api/auth/login", {
            method: "POST",
            skipAuth: true,
            body: {
                email: document.getElementById("loginEmail").value.trim(),
                password: document.getElementById("loginPassword").value
            }
        });

        saveSession(payload.data);

        const pendingJob = getPendingJob();
        if (pendingJob) {
            clearPendingJob();
            setFlash("success", `Welcome back, ${payload.data.user.name}.`);
            window.location.replace(`/jobs.html`);
            return;
        }

        setFlash("success", `Welcome back, ${payload.data.user.name}.`);
        window.location.replace(dashboardPathForRole(payload.data.user.role));
    } catch (error) {
        showMessage(messageElement, error.message, "error");
    } finally {
        setButtonBusy(loginButton, false);
    }
}
