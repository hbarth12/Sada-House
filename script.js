(function () {
  const events = Array.isArray(window.SADA_EVENTS) ? window.SADA_EVENTS : [];
  const featuredRoot = document.getElementById("featured-event");
  const upcomingRoot = document.getElementById("upcoming-events");
  const pastRoot = document.getElementById("past-events");
  const labels = window.SADA_LABELS || {};
  const locale = document.documentElement.lang === "ar" ? "ar-SY" : "en";
  const now = Date.now();

  const eventTime = event => event.date ? new Date(event.date).getTime() : null;
  const isPast = event => {
    const time = eventTime(event);
    return Number.isFinite(time) && time < now;
  };
  const chronological = (a, b) => {
    const aTime = eventTime(a);
    const bTime = eventTime(b);
    if (aTime !== null && bTime !== null) return aTime - bTime;
    if (aTime !== null) return -1;
    if (bTime !== null) return 1;
    return a.order - b.order;
  };

  const upcoming = events.filter(event => !isPast(event)).sort(chronological);
  const past = events.filter(isPast).sort((a, b) => eventTime(b) - eventTime(a));

  const dateParts = event => {
    const time = eventTime(event);
    if (!Number.isFinite(time)) return { eyebrow: labels.date, main: labels.tba, month: "" };
    const date = new Date(time);
    return {
      eyebrow: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
      main: new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date),
      month: new Intl.DateTimeFormat(locale, { month: "short" }).format(date)
    };
  };

  const dateMarkup = event => {
    const parts = dateParts(event);
    return `<div class="event-date" aria-label="${event.displayDate}">
      <span>${parts.eyebrow}</span>
      <strong>${parts.main}</strong>
      ${parts.month ? `<span>${parts.month}</span>` : ""}
    </div>`;
  };

  const eventMarkup = (event, pastEvent, paletteIndex) => `
    <article class="event-card tone-${(paletteIndex % 5) + 1}${pastEvent ? " past-event" : ""}" tabindex="0">
      <div class="event-summary">
        ${dateMarkup(event)}
        <div class="compact-copy">
          <p class="event-kicker">${event.type}</p>
          <h3>${event.title}</h3>
          <p>${event.heroGuest || event.guest}</p>
        </div>
        <span class="event-expand" aria-hidden="true">+</span>
      </div>
      <div class="event-details">
        <div class="event-detail-copy">
          <p class="event-description">${event.description}</p>
          <p class="event-place">${event.displayDate} · ${event.location}</p>
          <a class="event-button" href="#contact">${pastEvent ? labels.pastEvent : labels.eventDetails} <span aria-hidden="true">↗</span></a>
        </div>
        ${event.image ? `<img class="event-cover" src="${event.image}" alt="${event.imageAlt || ""}">` : ""}
      </div>
    </article>`;

  if (featuredRoot) {
    featuredRoot.innerHTML = upcoming.length
      ? upcoming.map((event, index) => eventMarkup(event, false, index)).join("")
      : `<p class="empty-state">${labels.noUpcoming}</p>`;
  }

  if (upcomingRoot) {
    upcomingRoot.innerHTML = "";
  }

  if (pastRoot) {
    pastRoot.innerHTML = past.length
      ? past.map((event, index) => eventMarkup(event, true, upcoming.length + index)).join("")
      : `<p class="empty-state">${labels.noPast}</p>`;
  }

  const bulletin = document.querySelector(".photo-bulletin");
  if (bulletin) {
    const revealBulletin = () => bulletin.classList.add("is-visible");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          revealBulletin();
          observer.disconnect();
        }
      }, { threshold: .18 });
      observer.observe(bulletin);
    } else {
      revealBulletin();
    }
  }
})();
