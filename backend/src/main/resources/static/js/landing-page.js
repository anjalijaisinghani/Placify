import { dashboardPathForRole, getToken, resolveCurrentUser } from "./api.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    initMobileNav();

    if (!getToken()) {
        return;
    }

    try {
        const user = await resolveCurrentUser();
        if (user) {
            window.location.replace(dashboardPathForRole(user.role));
        }
    } catch {
        // token invalid — stay on landing page
    }
}

function initMobileNav() {
    const toggle = document.querySelector(".l-nav-toggle");
    const links = document.querySelector(".l-nav-links");
    const actions = document.querySelector(".l-nav-actions");

    if (!toggle || !links) {
        return;
    }

    toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        if (actions) {
            actions.classList.toggle("open", open);
        }
        toggle.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", (event) => {
        if (!toggle.contains(event.target) && !links.contains(event.target)) {
            links.classList.remove("open");
            if (actions) {
                actions.classList.remove("open");
            }
            toggle.setAttribute("aria-expanded", "false");
        }
    });
}
