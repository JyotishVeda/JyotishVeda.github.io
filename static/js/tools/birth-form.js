/**
 * JyotishVeda — shared birth-input handling for every tool page.
 *
 * Birthplace workflow:
 *   typed place
 *      ↓
 *   Nominatim geocoding
 *      ↓
 *   latitude + longitude
 *      ↓
 *   timezone lookup
 *      ↓
 *   historical UTC offset
 *      ↓
 *   local birth time → UTC
 *
 * Birth details can optionally be remembered in this browser's
 * localStorage. Nothing stored here is sent to our server.
 *
 * Multiple independent profiles are supported:
 *   primary
 *   partner
 */

import { localToUTC } from "../vedic/ayanamsha.js";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const STORAGE_PREFIX = "vj-birth:";

function storageKey(profile = "primary") {
  return STORAGE_PREFIX + profile;
}

/* -------------------------------------------------------------------------- */
/* Local birth-memory                                                         */
/* -------------------------------------------------------------------------- */

export function loadSavedBirth(profile = "primary") {
  try {
    const raw = window.localStorage.getItem(storageKey(profile));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBirth(profile, data) {
  try {
    window.localStorage.setItem(
      storageKey(profile),
      JSON.stringify({
        ...data,
        savedAt: Date.now()
      })
    );
  } catch {
    /* localStorage may be unavailable; calculation must still work */
  }
}

export function clearSavedBirth(profile = "primary") {
  try {
    window.localStorage.removeItem(storageKey(profile));
  } catch {
    /* best effort only */
  }
}

/* -------------------------------------------------------------------------- */
/* Formatting / timezone helpers                                              */
/* -------------------------------------------------------------------------- */

function formatCoordinate(value, positive, negative) {
  const direction = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
}

function getUTCOffsetHours(date, time, timeZone) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const probe = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute
    )
  );

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(probe);

  const offsetPart = parts.find(
    (part) => part.type === "timeZoneName"
  );

  if (!offsetPart) {
    throw new Error(`Could not determine UTC offset for ${timeZone}.`);
  }

  const match = offsetPart.value.match(
    /^GMT([+-])(\d{2}):(\d{2})$/
  );

  if (!match) {
    if (offsetPart.value === "GMT") return 0;
    throw new Error(`Could not parse timezone offset: ${offsetPart.value}`);
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);

  return sign * (hours + minutes / 60);
}

function formatUTCOffset(hours) {
  if (hours === 0) return "UTC +00:00";

  const sign = hours >= 0 ? "+" : "-";
  const absolute = Math.abs(hours);
  const wholeHours = Math.floor(absolute);
  const minutes = Math.round(
    (absolute - wholeHours) * 60
  );

  return `UTC ${sign}${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Place-result UI                                                            */
/* -------------------------------------------------------------------------- */

function setPlaceResult(root, place) {
  const result = root.querySelector("[data-place-result]");
  const label = root.querySelector("[data-place-label]");
  const coords = root.querySelector("[data-place-coords]");
  const timezone = root.querySelector("[data-place-timezone]");

  if (label) {
    label.textContent = place.label;
  }

  if (coords) {
    coords.textContent =
      `${formatCoordinate(place.lat, "N", "S")} · ` +
      `${formatCoordinate(place.lon, "E", "W")}`;
  }

  if (timezone) {
    timezone.textContent =
      `${place.timeZone} · ${formatUTCOffset(place.tz)}`;
  }

  if (result) {
    result.hidden = false;
  }
}

function clearPlaceResult(root) {
  const result = root.querySelector("[data-place-result]");
  if (result) {
    result.hidden = true;
  }

  const error = root.querySelector("[data-place-error]");
  if (error) {
    error.hidden = true;
    error.textContent = "";
  }

  const lat = root.querySelector("[data-lat]");
  const lon = root.querySelector("[data-lon]");
  const tz = root.querySelector("[data-tz]");
  const timezone = root.querySelector("[data-timezone]");

  if (lat) lat.value = "";
  if (lon) lon.value = "";
  if (tz) tz.value = "";
  if (timezone) timezone.value = "";

  root.dataset.placeResolved = "false";
  root.dataset.placeLabel = "";
  root.dataset.placeTimezone = "";
}

function showPlaceError(root, message) {
  const error = root.querySelector("[data-place-error]");
  if (!error) return;

  error.textContent = message;
  error.hidden = false;
}

/* -------------------------------------------------------------------------- */
/* Find place                                                                 */
/* -------------------------------------------------------------------------- */

async function findPlace(root) {
  const input = root.querySelector("[data-place]");
  const button = root.querySelector("[data-find-place]");

  const query = input?.value.trim();

  if (!query) {
    showPlaceError(root, "Enter a place of birth first.");
    return;
  }

  const date = root.querySelector("[data-date]")?.value;
  const time = root.querySelector("[data-time]")?.value || "12:00";

  if (!date) {
    showPlaceError(
      root,
      "Enter the date of birth before finding the place."
    );
    return;
  }

  clearPlaceResult(root);

  if (button) {
    button.disabled = true;
    button.textContent = "Finding…";
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      addressdetails: "1",
      limit: "1"
    });

    const response = await fetch(
      `${NOMINATIM_URL}?${params.toString()}`,
      {
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `Place search failed (${response.status}).`
      );
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      throw new Error(
        "Place not found. Try adding the district, state or country."
      );
    }

    const result = results[0];

    const lat = Number(result.lat);
    const lon = Number(result.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error(
        "The place search returned invalid coordinates."
      );
    }

    if (lat < -90 || lat > 90) {
      throw new Error(
        "Latitude returned by the place service is invalid."
      );
    }

    if (lon < -180 || lon > 180) {
      throw new Error(
        "Longitude returned by the place service is invalid."
      );
    }

    if (typeof window.tzlookup !== "function") {
      throw new Error(
        "Timezone lookup is unavailable. Please reload the page and try again."
      );
    }

    const timeZone = window.tzlookup(lat, lon);

    if (!timeZone) {
      throw new Error(
        "Could not determine the timezone for this location."
      );
    }

    const tz = getUTCOffsetHours(
      date,
      time,
      timeZone
    );

    const place = {
      label: result.display_name || query,
      lat,
      lon,
      tz,
      timeZone
    };

    root.dataset.placeResolved = "true";
    root.dataset.placeLabel = place.label;
    root.dataset.placeTimezone = place.timeZone;

    const latInput = root.querySelector("[data-lat]");
    const lonInput = root.querySelector("[data-lon]");
    const tzInput = root.querySelector("[data-tz]");
    const timezoneInput = root.querySelector("[data-timezone]");

    if (latInput) latInput.value = String(lat);
    if (lonInput) lonInput.value = String(lon);
    if (tzInput) tzInput.value = String(tz);
    if (timezoneInput) timezoneInput.value = timeZone;

    setPlaceResult(root, place);

  } catch (error) {
    root.dataset.placeResolved = "false";
    showPlaceError(
      root,
      error.message || String(error)
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Find place";
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Saved birth details                                                        */
/* -------------------------------------------------------------------------- */

function applySavedBirth(root, saved) {
  if (!saved) return;

  const dateInput = root.querySelector("[data-date]");
  const timeInput = root.querySelector("[data-time]");
  const placeInput = root.querySelector("[data-place]");

  if (dateInput && saved.date) {
    dateInput.value = saved.date;
  }

  if (timeInput && saved.time) {
    timeInput.value = saved.time;
  }

  if (placeInput && saved.place) {
    placeInput.value = saved.place;
  }

  const latInput = root.querySelector("[data-lat]");
  const lonInput = root.querySelector("[data-lon]");
  const tzInput = root.querySelector("[data-tz]");
  const timezoneInput = root.querySelector("[data-timezone]");

  if (latInput && Number.isFinite(Number(saved.lat))) {
    latInput.value = String(saved.lat);
  }

  if (lonInput && Number.isFinite(Number(saved.lon))) {
    lonInput.value = String(saved.lon);
  }

  if (tzInput && Number.isFinite(Number(saved.tz))) {
    tzInput.value = String(saved.tz);
  }

  if (timezoneInput && saved.timeZone) {
    timezoneInput.value = saved.timeZone;
  }

  if (
    saved.lat !== undefined &&
    saved.lon !== undefined &&
    saved.tz !== undefined &&
    saved.timeZone
  ) {
    const place = {
      label: saved.label || saved.place || "Saved place",
      lat: Number(saved.lat),
      lon: Number(saved.lon),
      tz: Number(saved.tz),
      timeZone: saved.timeZone
    };

    root.dataset.placeResolved = "true";
    root.dataset.placeLabel = place.label;
    root.dataset.placeTimezone = place.timeZone;

    setPlaceResult(root, place);
  }
}

function setupSavedBirthUI(
  root,
  { profile = "primary" } = {}
) {
  const banner = root.querySelector("[data-saved-banner]");
  const bannerText = root.querySelector(
    "[data-saved-banner-text]"
  );
  const forgetButton = root.querySelector("[data-forget]");

  const rememberBox = root.querySelector("[data-remember]");

  const saved = loadSavedBirth(profile);

  if (saved) {
    applySavedBirth(root, saved);

    if (rememberBox) {
      rememberBox.checked = true;
    }

    if (bannerText) {
      const placeLabel =
        saved.label ||
        saved.place ||
        "saved place";

      const dateText = saved.date || "";
      const timeText = saved.time
        ? ` ${saved.time}`
        : "";

      bannerText.textContent =
        `Using details saved on this device: ${placeLabel} · ${dateText}${timeText}`;
    }

    if (banner) {
      banner.hidden = false;
    }
  }

  if (forgetButton) {
    forgetButton.addEventListener("click", () => {
      clearSavedBirth(profile);

      if (banner) {
        banner.hidden = true;
      }

      const dateInput = root.querySelector("[data-date]");
      const timeInput = root.querySelector("[data-time]");
      const placeInput = root.querySelector("[data-place]");

      if (dateInput) {
        dateInput.value =
          new Date().toISOString().slice(0, 10);
      }

      if (timeInput) {
        timeInput.value = "12:00";
      }

      if (placeInput) {
        placeInput.value = "";
      }

      clearPlaceResult(root);

      if (rememberBox) {
        rememberBox.checked = true;
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Shared birth-form wiring                                                   */
/* -------------------------------------------------------------------------- */

export function wireBirthForm(
  root,
  { profile = "primary" } = {}
) {
  const placeInput = root.querySelector("[data-place]");
  const findButton = root.querySelector("[data-find-place]");
  const dateInput = root.querySelector("[data-date]");

  if (placeInput) {
    placeInput.addEventListener("input", () => {
      root.dataset.placeResolved = "false";
      clearPlaceResult(root);
    });
  }

  if (findButton) {
    findButton.addEventListener("click", () => {
      findPlace(root);
    });
  }

  if (dateInput && !dateInput.value) {
    dateInput.value =
      new Date().toISOString().slice(0, 10);
  }

  dateInput?.addEventListener("change", () => {
    if (root.dataset.placeResolved === "true") {
      root.dataset.placeResolved = "false";
      clearPlaceResult(root);
    }
  });

  setupSavedBirthUI(root, { profile });
}

/**
 * Read the form and return:
 * { dateUTC, lat, lon, tz, label, timeZone }
 */
export function readBirthForm(
  root,
  { profile = "primary" } = {}
) {
  const date = root.querySelector("[data-date]")?.value;
  const time =
    root.querySelector("[data-time]")?.value || "12:00";

  if (!date) {
    throw new Error("Please enter a date.");
  }

  const resolved =
    root.dataset.placeResolved === "true";

  if (!resolved) {
    throw new Error(
      "Find and confirm the place of birth first."
    );
  }

  const lat = Number(
    root.querySelector("[data-lat]")?.value
  );

  const lon = Number(
    root.querySelector("[data-lon]")?.value
  );

  const storedTz = Number(
    root.querySelector("[data-tz]")?.value
  );

  const timeZone =
    root.querySelector("[data-timezone]")?.value;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    !timeZone
  ) {
    throw new Error(
      "Please find the place of birth before generating the chart."
    );
  }

  if (lat < -90 || lat > 90) {
    throw new Error(
      "Latitude must be between −90 and 90."
    );
  }

  if (lon < -180 || lon > 180) {
    throw new Error(
      "Longitude must be between −180 and 180."
    );
  }

  const tz = getUTCOffsetHours(
    date,
    time,
    timeZone
  );

  const label =
    root.dataset.placeLabel ||
    `${formatCoordinate(lat, "N", "S")} · ${formatCoordinate(lon, "E", "W")}`;

  const dateUTC = localToUTC(
    date,
    time,
    tz
  );

  /* ------------------------------------------------------ */
  /* Remember / forget birth details                         */
  /* ------------------------------------------------------ */

  const rememberBox =
    root.querySelector("[data-remember]");

  const remember =
    !rememberBox || rememberBox.checked;

  if (remember) {
    saveBirth(profile, {
      date,
      time,
      place:
        root.querySelector("[data-place]")?.value?.trim() ||
        "",
      label,
      lat,
      lon,
      tz,
      timeZone
    });
  } else {
    clearSavedBirth(profile);
  }

  return {
    dateUTC,
    lat,
    lon,
    tz,
    timeZone,
    label,
    localDate: date,
    localTime: time
  };
}

export function showError(root, message) {
  const box = root.querySelector("[data-error]");
  if (!box) return;

  box.textContent = message;
  box.hidden = false;
}

export function clearError(root) {
  const box = root.querySelector("[data-error]");
  if (box) box.hidden = true;
}

export function reveal(
  root,
  selector = "[data-result]"
) {
  const panel = root.querySelector(selector);
  if (panel) panel.hidden = false;
  return panel;
}

export function cell(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}
