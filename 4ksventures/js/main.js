/* ==========================================================================
   4KS VENTURES — MAIN.JS
   Shared behaviour across every page: mobile nav, current-page highlight,
   WhatsApp deep link, and the contact form (mailto handoff for now).
   ========================================================================== */
console.log("🔥 MAIN.JS IS WORKING!");

const WHATSAPP_NUMBER = "0182668370"; // digits only; WhatsApp number for the business

document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    markActiveNavLink();
    wireWhatsappLinks();
    wireContactForm();
});

function normalizePagePath(path) {
    if (!path) return "home";

    const normalized = String(path)
        .replace(/\\/g, "/")
        .split("?")[0]
        .split("#")[0]
        .replace(/\/+/g, "/")
        .replace(/\/$/, "");

    if (!normalized || normalized === "/") return "home";

    const lastSegment = normalized.split("/").pop();
    const pageName = (lastSegment || "home").replace(/\.html$/i, "") || "home";

    if (pageName === "index") return "home";
    if (pageName === "home") return "home";
    return pageName || "home";
}

function isMatchingNavTarget(href) {
    const current = normalizePagePath(location.pathname);
    const target = normalizePagePath(href);
    const equivalentPages = new Set([current]);

    if (current === "home") {
        equivalentPages.add("home");
        equivalentPages.add("home.html");
    }

    if (target === "home") equivalentPages.add("home.html");

    return equivalentPages.has(target);
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    const closeMenu = () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "\u2630";
    };

    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.textContent = isOpen ? "\u2715" : "\u2630";
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });
}

/* ---------- Highlight the current page in the nav ---------- */
function markActiveNavLink() {
    document.querySelectorAll(".main-nav a").forEach((link) => {
        const href = link.getAttribute("href");

        if (isMatchingNavTarget(href)) {
            link.setAttribute("aria-current", "page");
        }
    });
}

/* ---------- WhatsApp links ---------- */
function wireWhatsappLinks() {
    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
        const msg = el.getAttribute("data-whatsapp") || "Hello 4KS Ventures, I'd like some help with";
        el.setAttribute("href", `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
    });
}

/* ---------- Contact form ---------- */
function wireContactForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const email = String(data.get("email") || "").trim();
        const phone = String(data.get("phone") || "").trim();
        const service = String(data.get("service") || "General enquiry").trim() || "General enquiry";
        const message = String(data.get("message") || "").trim();

        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            `Service: ${service}`,
            "",
            message,
        ].join("\n");

        const mailto = `mailto:info@4ksventures.com?subject=${encodeURIComponent(
      "Website enquiry - " + service
    )}&body=${encodeURIComponent(body)}`;

        window.location.href = mailto;
    });
}