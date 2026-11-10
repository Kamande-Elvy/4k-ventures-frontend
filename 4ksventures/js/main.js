/* ==========================================================================
   4KS VENTURES — MAIN.JS
   Shared behaviour on every page: mobile menu, current-page highlight,
   office open/closed status, the visa document checker, the enquiry form,
   the destinations row, the pinned "how it works" story and reveals.
   ========================================================================== */

const BUSINESS = {
    whatsapp: "254182668370", // international format, digits only
    email: "4ksventure226@gmail.com",
    // Monday to Friday, 08:30 to 17:30, Nairobi time
    hours: { days: [1, 2, 3, 4, 5], open: 8 * 60 + 30, close: 17 * 60 + 30 },
};

const whatsappUrl = (message) =>
    `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;

document.documentElement.classList.replace("no-js", "js");

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    markCurrentPage();
    initOfficeStatus();
    initChecker();
    initForms();
    initDragRow();
    initStory();
    initReveals();
    setYear();
});

/* ---------- Mobile menu ---------- */
function initMenu() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "Close" : "Menu";
    };

    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
            setOpen(false);
            toggle.focus();
        }
    });
}

/* ---------- Current page in the nav ---------- */
function pageName(path) {
    const last = String(path).split(/[?#]/)[0].replace(/\/+$/, "").split("/").pop() || "home";
    const name = last.replace(/\.html$/i, "");
    return name === "index" || name === "" ? "home" : name;
}

function markCurrentPage() {
    const current = pageName(location.pathname);
    const groups = { "visa-uae": "services", "visa-us": "services" };
    document.querySelectorAll(".nav a").forEach((link) => {
        const target = pageName(link.getAttribute("href"));
        if (target === current || target === groups[current]) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

/* ---------- Is the office open right now? (Nairobi time) ---------- */
function nairobiNow() {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Nairobi",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function officeStatus() {
    const { day, minutes } = nairobiNow();
    const { days, open, close } = BUSINESS.hours;
    const isWorkday = days.includes(day);

    if (isWorkday && minutes >= open && minutes < close) {
        return { open: true, text: "Open now, until 5:30 pm" };
    }
    if (isWorkday && minutes < open) {
        return { open: false, text: "Closed. Opens today at 8:30 am" };
    }
    const nextIsMonday = day === 5 || day === 6 || day === 0;
    return {
        open: false,
        text: nextIsMonday ? "Closed. Opens Monday at 8:30 am" : "Closed. Opens tomorrow at 8:30 am",
    };
}

function initOfficeStatus() {
    const nodes = document.querySelectorAll("[data-office-status]");
    if (!nodes.length) return;
    const paint = () => {
        const status = officeStatus();
        nodes.forEach((node) => {
            node.dataset.open = String(status.open);
            const label = node.querySelector("[data-status-text]");
            if (label) label.textContent = status.text;
        });
    };
    paint();
    setInterval(paint, 60 * 1000);
}

/* ---------- Visa document checker ---------- */
const VISAS = {
    uae: {
        name: "UAE / Dubai",
        purposes: {
            tourist: {
                label: "Tourist visit",
                items: [
                    "Passport valid for at least 6 months from your travel date",
                    "A clear scan of your passport bio page",
                    "Recent passport photo on a white background",
                    "Confirmed return or onward flight booking",
                    "Hotel booking, or your host's address and Emirates ID copy",
                    "Recent bank statements that show you can cover the trip",
                    "Copy of your Kenyan national ID",
                ],
            },
            business: {
                label: "Business visit",
                items: [
                    "Passport valid for at least 6 months from your travel date",
                    "A clear scan of your passport bio page",
                    "Recent passport photo on a white background",
                    "Invitation letter from the UAE company you are visiting",
                    "Letter from your employer, or your business registration certificate",
                    "Return flight and hotel bookings",
                    "Recent bank statements",
                ],
            },
        },
    },
    us: {
        name: "United States",
        purposes: {
            tourist: {
                label: "Visitor (B1/B2)",
                items: [
                    "Passport valid for at least 6 months beyond your stay",
                    "DS-160 confirmation page (we help you fill it in)",
                    "Visa fee (MRV) payment receipt",
                    "Interview appointment confirmation",
                    "One 5 × 5 cm photo on a white background",
                    "Proof of ties to Kenya: employment letter, payslips, business or property papers",
                    "Recent bank statements",
                    "Previous passports and visas, if you have any",
                    "Your trip plan: purpose, dates and where you will stay",
                ],
            },
            student: {
                label: "Student (F-1)",
                items: [
                    "Passport valid for at least 6 months beyond your stay",
                    "Form I-20 from your US school",
                    "SEVIS I-901 fee receipt",
                    "DS-160 confirmation page",
                    "Visa fee receipt and interview appointment confirmation",
                    "Your admission letter",
                    "Proof of funds for tuition and living costs",
                    "Academic transcripts and certificates (KCSE, diplomas, degrees)",
                    "One 5 × 5 cm photo on a white background",
                ],
            },
        },
    },
};

function initChecker() {
    const root = document.querySelector("[data-checker]");
    if (!root) return;

    const list = root.querySelector("[data-checker-list]");
    const title = root.querySelector("[data-checker-title]");
    const count = root.querySelector("[data-checker-count]");
    const send = root.querySelector("[data-checker-send]");
    const print = root.querySelector("[data-checker-print]");
    const purposeRow = root.querySelector("[data-checker-purposes]");
    const state = {
        country: root.dataset.country || "uae",
        purpose: "tourist",
    };

    const current = () => VISAS[state.country].purposes[state.purpose];

    const updateCount = () => {
        const boxes = [...list.querySelectorAll("input")];
        const done = boxes.filter((b) => b.checked).length;
        count.textContent = `${done} of ${boxes.length}`;
    };

    const renderPurposes = () => {
        const purposes = VISAS[state.country].purposes;
        if (!purposes[state.purpose]) state.purpose = Object.keys(purposes)[0];
        purposeRow.innerHTML = "";
        Object.entries(purposes).forEach(([key, p]) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "chip";
            b.textContent = p.label;
            b.setAttribute("aria-pressed", String(key === state.purpose));
            b.addEventListener("click", () => {
                state.purpose = key;
                render();
            });
            purposeRow.appendChild(b);
        });
    };

    const render = () => {
        root.querySelectorAll("[data-country-choice]").forEach((b) => {
            b.setAttribute("aria-pressed", String(b.dataset.countryChoice === state.country));
        });
        renderPurposes();
        const visa = current();
        title.textContent = `${VISAS[state.country].name}: ${visa.label}`;
        list.innerHTML = "";
        visa.items.forEach((item, i) => {
            const li = document.createElement("li");
            const id = `doc-${state.country}-${state.purpose}-${i}`;
            li.innerHTML = `<label for="${id}"><input type="checkbox" id="${id}"><span></span></label>`;
            li.querySelector("span").textContent = item;
            list.appendChild(li);
        });
        updateCount();
    };

    root.querySelectorAll("[data-country-choice]").forEach((b) => {
        b.addEventListener("click", () => {
            state.country = b.dataset.countryChoice;
            render();
        });
    });

    list.addEventListener("change", updateCount);

    send?.addEventListener("click", () => {
        const visa = current();
        const boxes = [...list.querySelectorAll("label")];
        const have = boxes.filter((l) => l.querySelector("input").checked).map((l) => `- ${l.textContent.trim()}`);
        const need = boxes.filter((l) => !l.querySelector("input").checked).map((l) => `- ${l.textContent.trim()}`);
        const message = [
            `Hello 4KS Ventures, I'm preparing a ${VISAS[state.country].name} ${visa.label} visa.`,
            have.length ? `\nI already have:\n${have.join("\n")}` : "",
            need.length ? `\nI still need help with:\n${need.join("\n")}` : "",
        ].join("\n");
        window.open(whatsappUrl(message), "_blank", "noopener");
    });

    print?.addEventListener("click", () => window.print());

    render();
}

/* ---------- Enquiry forms (sent to the business inbox) ---------- */
function initForms() {
    document.querySelectorAll("form[data-enquiry]").forEach((form) => {
        const status = form.querySelector(".form-status");
        const button = form.querySelector("button[type=submit]");

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            const data = Object.fromEntries(new FormData(form).entries());
            if (data._honey) return; // a bot filled the hidden field

            const service = data.service || "General enquiry";
            const lines = Object.entries(data)
                .filter(([k, v]) => !k.startsWith("_") && String(v).trim())
                .map(([k, v]) => `${k[0].toUpperCase()}${k.slice(1)}: ${v}`);
            const whatsappText = `Hello 4KS Ventures, I'd like help with: ${service}\n\n${lines.join("\n")}`;

            button.disabled = true;
            const label = button.textContent;
            button.textContent = "Sending…";
            status.textContent = "";

            try {
                const response = await fetch(`https://formsubmit.co/ajax/${BUSINESS.email}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({
                        ...data,
                        _subject: `Website enquiry: ${service}`,
                        _template: "table",
                        _captcha: "false",
                    }),
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok || String(result.success) !== "true") throw new Error("not sent");

                form.reset();
                status.textContent = "Thank you. We have your message and will reply within one working day.";
            } catch {
                status.innerHTML = "";
                status.append("We couldn't send that just now. ");
                const link = document.createElement("a");
                link.href = whatsappUrl(whatsappText);
                link.target = "_blank";
                link.rel = "noopener";
                link.textContent = "Send it on WhatsApp instead";
                status.append(link);
            } finally {
                button.disabled = false;
                button.textContent = label;
            }
        });
    });
}

/* ---------- Destinations drag row ---------- */
function initDragRow() {
    document.querySelectorAll("[data-row]").forEach((section) => {
        const row = section.querySelector(".drag-row");
        const bar = section.querySelector(".row-progress span");
        const prev = section.querySelector("[data-row-prev]");
        const next = section.querySelector("[data-row-next]");
        if (!row) return;

        const step = () => (row.querySelector(".moment")?.offsetWidth || 300) + 32;
        prev?.addEventListener("click", () => row.scrollBy({ left: -step(), behavior: "smooth" }));
        next?.addEventListener("click", () => row.scrollBy({ left: step(), behavior: "smooth" }));

        const paint = () => {
            const max = row.scrollWidth - row.clientWidth;
            const visible = row.clientWidth / row.scrollWidth;
            const progress = max > 0 ? row.scrollLeft / max : 1;
            if (bar) bar.style.transform = `scaleX(${Math.min(1, visible + (1 - visible) * progress)})`;
        };
        row.addEventListener("scroll", paint, { passive: true });
        window.addEventListener("resize", paint);
        paint();
    });
}

/* ---------- Pinned story: the picture follows the step being read ---------- */
function initStory() {
    const story = document.querySelector("[data-story]");
    if (!story || !("IntersectionObserver" in window)) return;
    const steps = [...story.querySelectorAll(".story-steps li")];
    const images = [...story.querySelectorAll(".story-frame img")];

    const activate = (index) => {
        steps.forEach((s, i) => s.classList.toggle("is-active", i === index));
        images.forEach((img, i) => img.classList.toggle("is-active", i === Math.min(index, images.length - 1)));
    };

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) activate(steps.indexOf(e.target));
            });
        },
        { rootMargin: "-45% 0px -45% 0px" }
    );
    steps.forEach((s) => io.observe(s));
    activate(0);
}

/* ---------- Reveal sections as they enter (once) ---------- */
function initReveals() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-in"));
        return;
    }
    let fired = false;
    const io = new IntersectionObserver(
        (entries) => {
            fired = true;
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("is-in");
                    io.unobserve(e.target);
                }
            });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
    // Safety net: if the observer never reports, show everything.
    setTimeout(() => {
        if (!fired) items.forEach((el) => el.classList.add("is-in"));
    }, 3000);
}

function setYear() {
    document.querySelectorAll("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));
}
