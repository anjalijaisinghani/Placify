import {
    apiRequest,
    clearSession,
    consumeFlash,
    dashboardPathForRole,
    escapeHtml,
    formatDateTime,
    roleLabel,
    setFlash
} from "./api.js";

let loaderElement;

export function initializeLayout(activePage, user) {
    document.body.dataset.page = activePage;
    renderNavigation(activePage, user);
    renderHeaderActions(user);
    ensurePageLoader();
    if (user) initNotifications();
}

const NAV_ICONS = {
    dashboard: `<svg class="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="1" width="6.5" height="6.5" rx="1.5"/>
        <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5"/>
        <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5"/>
        <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5"/>
    </svg>`,
    jobs: `<svg class="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1.5" y="6" width="15" height="10" rx="1.5"/>
        <path d="M6 6V4.5A1.5 1.5 0 0 1 7.5 3h3A1.5 1.5 0 0 1 12 4.5V6"/>
        <line x1="1.5" y1="10" x2="16.5" y2="10"/>
    </svg>`,
    applications: `<svg class="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3.5 2h11A1.5 1.5 0 0 1 16 3.5v11A1.5 1.5 0 0 1 14.5 16h-11A1.5 1.5 0 0 1 2 14.5v-11A1.5 1.5 0 0 1 3.5 2z"/>
        <line x1="5.5" y1="7" x2="12.5" y2="7"/>
        <line x1="5.5" y1="10" x2="12.5" y2="10"/>
        <line x1="5.5" y1="13" x2="9" y2="13"/>
    </svg>`,
    auth: `<svg class="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="6" r="3"/>
        <path d="M2 17c0-3.866 3.134-7 7-7s7 3.134 7 7"/>
    </svg>`,
    profile: `<svg class="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="6" r="3"/>
        <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6"/>
        <path d="M12 6h2M12 9h2" stroke-width="1.4"/>
    </svg>`
};

function renderNavigation(activePage, user) {
    const nav = document.getElementById("siteNav");
    if (!nav) {
        return;
    }

    const links = [];

    if (user) {
        links.push({
            key: "dashboard",
            href: dashboardPathForRole(user.role),
            label: user.role === "STUDENT" ? "Dashboard" : `${roleLabel(user.role)} Dashboard`
        });
        links.push({key: "jobs", href: "/jobs.html", label: "Jobs"});
        links.push({key: "applications", href: "/applications.html", label: "Applications"});
        if (user.role === "STUDENT") {
            links.push({key: "profile", href: "/profile.html", label: "My Profile"});
        } else if (user.role === "RECRUITER" || user.role === "ADMIN") {
            links.push({key: "profile", href: "/recruiter-profile.html", label: "My Profile"});
        }
    } else {
        links.push({key: "auth", href: "/login.html", label: "Login"});
        links.push({key: "jobs", href: "/jobs.html", label: "Jobs"});
    }

    nav.innerHTML = links.map((link) => `
        <a class="nav-link ${link.key === activePage ? "active" : ""}" href="${link.href}">
            ${NAV_ICONS[link.key] || ""}
            ${escapeHtml(link.label)}
        </a>
    `).join("");
}

function renderHeaderActions(user) {
    const actions = document.getElementById("headerActions");
    if (!actions) {
        return;
    }

    if (!user) {
        actions.innerHTML = '<a class="button ghost sm" href="/login.html">Sign In</a>';
        return;
    }

    const initials = user.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("");

    actions.innerHTML = `
        <div class="topbar-user">
            <div class="topbar-avatar">${escapeHtml(initials)}</div>
            <div class="topbar-user-info">
                <span class="topbar-user-name">${escapeHtml(user.name)}</span>
                <span class="topbar-user-role">${escapeHtml(roleLabel(user.role))}</span>
            </div>
        </div>
        <button class="button ghost sm" id="logoutButton" type="button">Logout</button>
    `;

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            clearSession();
            setFlash("success", "Logged out successfully.");
            window.location.replace("/index.html");
        });
    }
}

function renderSidebarUser(user) {
    const el = document.getElementById("sidebarUser");
    if (!el) return;

    if (!user) {
        el.innerHTML = `<a class="sidebar-logout-btn" href="/login.html">Sign In</a>`;
        return;
    }

    const initials = user.name
        .split(" ")
        .slice(0, 2)
        .map((p) => p.charAt(0))
        .join("");

    el.innerHTML = `
        <div class="sidebar-user-card">
            <div class="sidebar-user-avatar">${escapeHtml(initials)}</div>
            <div class="sidebar-user-info">
                <span class="sidebar-user-name">${escapeHtml(user.name)}</span>
                <span class="sidebar-user-role">${escapeHtml(roleLabel(user.role))}</span>
            </div>
        </div>
        <button class="sidebar-logout-btn" id="sidebarLogout" type="button">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>
                <polyline points="11 11 14 8 11 5"/>
                <line x1="14" y1="8" x2="6" y2="8"/>
            </svg>
            Sign Out
        </button>
    `;

    document.getElementById("sidebarLogout").addEventListener("click", () => {
        clearSession();
        setFlash("success", "Logged out successfully.");
        window.location.replace("/index.html");
    });
}

export function showMessage(element, message, type = "info") {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `alert ${type}`;
    element.classList.remove("hidden");
}

export function hideMessage(element) {
    if (!element) {
        return;
    }

    element.className = "alert hidden";
    element.textContent = "";
}

export function consumeFlashInto(element) {
    const flash = consumeFlash();
    if (flash) {
        showMessage(element, flash.message, flash.type);
    }
}

export function renderStats(container, items) {
    if (!container) {
        return;
    }

    container.innerHTML = items.map((item) => `
        <article class="stat-card">
            <span class="stat-label">${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(String(item.value))}</strong>
        </article>
    `).join("");
}

export function emptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

export function setButtonBusy(button, busy, busyLabel = "Please wait...") {
    if (!button) {
        return;
    }

    if (busy) {
        if (!button.dataset.originalLabel) {
            button.dataset.originalLabel = button.textContent;
        }
        button.textContent = busyLabel;
        button.disabled = true;
        return;
    }

    button.disabled = false;
    button.textContent = button.dataset.originalLabel || button.textContent;
    delete button.dataset.originalLabel;
}

export function setPageBusy(busy, label = "Loading workspace...") {
    ensurePageLoader();

    if (!loaderElement) {
        return;
    }

    loaderElement.querySelector(".page-loader-copy").textContent = label;
    loaderElement.classList.toggle("visible", busy);
}

export function renderLoadingCards(container, count = 3) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading-grid">
            ${Array.from({length: count}, () => `
                <article class="loading-card">
                    <span class="loading-chip"></span>
                    <span class="loading-line medium"></span>
                    <span class="loading-line long"></span>
                    <span class="loading-line long"></span>
                    <span class="loading-line short"></span>
                </article>
            `).join("")}
        </div>
    `;
}

export function renderLoadingStats(container, count = 4) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading-stats">
            ${Array.from({length: count}, () => `
                <article class="loading-stat">
                    <span class="loading-chip"></span>
                    <span class="loading-line medium"></span>
                    <span class="loading-line short"></span>
                </article>
            `).join("")}
        </div>
    `;
}

export function renderLoadingSummary(container, count = 3) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading-summary">
            ${Array.from({length: count}, () => `
                <article class="loading-summary-item">
                    <span class="loading-line medium"></span>
                    <span class="loading-line long"></span>
                </article>
            `).join("")}
        </div>
    `;
}

function ensurePageLoader() {
    if (loaderElement || !document.body) {
        return;
    }

    loaderElement = document.createElement("div");
    loaderElement.className = "page-loader";
    loaderElement.setAttribute("aria-live", "polite");
    loaderElement.innerHTML = `
        <span class="page-loader-spinner" aria-hidden="true"></span>
        <span class="page-loader-copy">Loading workspace...</span>
    `;
    document.body.appendChild(loaderElement);
}

function initNotifications() {
    const bellBtn = document.querySelector(".topbar-notify");
    if (!bellBtn) return;

    // Wrap bell in a relative container so dropdown can be positioned off it
    const wrap = document.createElement("div");
    wrap.className = "notif-wrap";
    bellBtn.parentNode.insertBefore(wrap, bellBtn);
    wrap.appendChild(bellBtn);

    const dot = bellBtn.querySelector(".topbar-notify-dot");

    // Dropdown panel
    const dropdown = document.createElement("div");
    dropdown.className = "notif-dropdown";
    dropdown.id = "notifDropdown";
    wrap.appendChild(dropdown);

    let pollTimer = null;

    async function refreshCount() {
        try {
            const payload = await apiRequest("/api/notifications/unread-count");
            const count = Number(payload.data) || 0;
            if (dot) {
                dot.textContent = count > 9 ? "9+" : count > 0 ? String(count) : "";
                dot.style.display = count > 0 ? "flex" : "none";
            }
        } catch { /* silent — user may not be logged in */ }
    }

    async function openDropdown() {
        dropdown.classList.add("open");
        dropdown.innerHTML = `<div class="notif-empty">Loading…</div>`;
        try {
            const payload = await apiRequest("/api/notifications");
            const items = payload.data || [];
            renderDropdown(items);
            // Mark all read after viewing
            await apiRequest("/api/notifications/read-all", { method: "PATCH" });
            if (dot) { dot.textContent = ""; dot.style.display = "none"; }
        } catch {
            dropdown.innerHTML = `<div class="notif-empty">Could not load notifications.</div>`;
        }
    }

    function renderDropdown(items) {
        if (!items.length) {
            dropdown.innerHTML = `
                <div class="notif-dropdown-header"><strong>Notifications</strong></div>
                <div class="notif-empty">You're all caught up.</div>
            `;
            return;
        }

        const listHtml = items.map((n) => `
            <div class="notif-item ${n.read ? "read" : "unread"}" data-ref="${n.referenceId || ""}">
                <span class="notif-dot"></span>
                <div class="notif-body">
                    <p class="notif-msg">${escapeHtml(n.message)}</p>
                    <p class="notif-time">${escapeHtml(formatDateTime(n.createdAt))}</p>
                </div>
            </div>
        `).join("");

        dropdown.innerHTML = `
            <div class="notif-dropdown-header">
                <strong>Notifications</strong>
            </div>
            <div class="notif-list">${listHtml}</div>
        `;
    }

    bellBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (dropdown.classList.contains("open")) {
            dropdown.classList.remove("open");
        } else {
            openDropdown();
        }
    });

    document.addEventListener("click", (e) => {
        if (!wrap.contains(e.target)) {
            dropdown.classList.remove("open");
        }
    });

    refreshCount();
    pollTimer = setInterval(refreshCount, 30000);

    // Clean up interval if page unloads
    window.addEventListener("pagehide", () => clearInterval(pollTimer));
}
