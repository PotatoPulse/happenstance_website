
/* ==========================================================
   Copy email address
   ========================================================== */

document.querySelectorAll(".contact-copy").forEach(button => {
    button.addEventListener("click", async () => {
        const email = button.dataset.email;
        const value = button.querySelector(".contact-value");

        await navigator.clipboard.writeText(email);

        const original = value.textContent;
        value.textContent = "Copied";

        setTimeout(() => {
            value.textContent = original;
        }, 1500);
    });
});


/* ==========================================================
   Upcoming shows
   ========================================================== */

let allShows = [];

async function loadShows() {
    const container = document.querySelector("#shows-list");

    if (!container) return;

    try {
        const response = await fetch("static/data/shows.csv", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error("Could not load shows");
        }

        const csv = await response.text();

        const rows = csv.trim().split(/\r?\n/).slice(1);

        allShows = rows
            .filter(row => row.trim())
            .map(row => {
                const [venue, city, datetime, tickets] =
                    row.split(",");

                return {
                    venue: venue.trim(),
                    city: city.trim(),
                    date: new Date(datetime.trim()),
                    tickets: tickets.trim()
                };
            })
            .filter(show =>
                !isNaN(show.date.getTime())
            )
            .sort((a, b) => a.date - b.date);

        renderShows();

    } catch (error) {
        console.error("Error loading shows:", error);

        container.textContent =
            "Shows are temporarily unavailable.";
    }
}


/* ==========================================================
   Render shows
   ========================================================== */

function renderShows() {
    const container = document.querySelector("#shows-list");

    if (!container) return;

    container.replaceChildren();

    const now = Date.now();

    const upcomingShows = allShows.filter(show =>
        show.date.getTime() > now
    );

    if (upcomingShows.length === 0) {
        const empty = document.createElement("div");
        empty.className = "shows-empty";

        empty.innerHTML = `
            <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <rect x="3" y="5" width="18" height="16" rx="2"/>
                <path d="M16 3v4M8 3v4M3 10h18"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01"/>
            </svg>

            <p class="shows-empty-title">
                No upcoming shows announced.
            </p>

            <p class="shows-empty-subtitle">
                Stay tuned. More dates are on the way.
            </p>
        `;

        container.appendChild(empty);
        return;
    }

    upcomingShows.forEach(show => {

        const row = document.createElement("div");
        row.className = "show-row";

        // Date
        const dateBox = document.createElement("div");
        dateBox.className = "show-date";

        const day = document.createElement("span");
        day.className = "show-day";

        const month = document.createElement("span");
        month.className = "show-month";

        day.textContent = new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            timeZone: "Europe/Amsterdam"
        }).format(show.date);

        month.textContent = new Intl.DateTimeFormat("en-GB", {
            month: "short",
            year: "numeric",
            timeZone: "Europe/Amsterdam"
        }).format(show.date).toUpperCase();

        dateBox.append(day, month);

        // Venue and city
        const info = document.createElement("div");
        info.className = "show-info";

        const venue = document.createElement("span");
        venue.className = "show-venue";
        venue.textContent = show.venue;

        const city = document.createElement("span");
        city.className = "show-city";
        city.textContent = show.city;

        info.append(venue, city);

        // Ticket link
        const tickets = document.createElement("a");
        tickets.className = "show-tickets";
        tickets.textContent = "Tickets ↗\uFE0E";

        const url = show.tickets;

        try {
            const parsed = new URL(url);

            if (
                parsed.protocol === "https:" ||
                parsed.protocol === "http:"
            ) {
                tickets.href = parsed.href;
                tickets.target = "_blank";
                tickets.rel = "noopener noreferrer";
            } else {
                throw new Error("Invalid ticket URL");
            }

        } catch {
            tickets.removeAttribute("href");
            tickets.textContent = "TBA";
            tickets.classList.add("show-tickets-disabled");
        }

        row.append(dateBox, info, tickets);
        container.appendChild(row);
    });
}


/* ==========================================================
   Initialize
   ========================================================== */

// Load shows when the page opens
loadShows();

// Recheck every minute so expired shows disappear
// even if someone leaves the website open.
setInterval(renderShows, 60 * 1000);
