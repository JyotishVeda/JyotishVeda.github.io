/**
 * JyotishVeda — shared birth-input handling for every tool page.
 * All calculation runs in the visitor's browser; nothing is uploaded.
 */
import { localToUTC } from "../vedic/ayanamsha.js";
import { populatePlaceSelect, placeAt } from "../vedic/places.js";

export function wireBirthForm(root) {
  const placeSelect = root.querySelector("[data-place]");
  const customWrap = root.querySelector("[data-custom-place]");
  if (placeSelect) {
    populatePlaceSelect(placeSelect);
    const sync = () => {
      const custom = placeSelect.value === "custom";
      if (customWrap) customWrap.hidden = !custom;
    };
    placeSelect.addEventListener("change", sync);
    sync();
  }

  const dateInput = root.querySelector("[data-date]");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
}

/**
 * Read the form and return { dateUTC, lat, lon, tz, label }.
 * Throws a readable Error when something is missing.
 */
export function readBirthForm(root) {
  const date = root.querySelector("[data-date]")?.value;
  const time = root.querySelector("[data-time]")?.value || "12:00";
  const placeSelect = root.querySelector("[data-place]");

  if (!date) throw new Error("Please enter a date.");

  let lat, lon, tz, label;

  if (!placeSelect || placeSelect.value === "custom") {
    lat = parseFloat(root.querySelector("[data-lat]")?.value);
    lon = parseFloat(root.querySelector("[data-lon]")?.value);
    tz = parseFloat(root.querySelector("[data-tz]")?.value);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(tz)) {
      throw new Error("Enter latitude, longitude and UTC offset for the custom place.");
    }
    if (lat < -90 || lat > 90) throw new Error("Latitude must be between −90 and 90.");
    if (lon < -180 || lon > 180) throw new Error("Longitude must be between −180 and 180.");
    label = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
  } else {
    const place = placeAt(placeSelect.value);
    if (!place) throw new Error("Choose a place of birth.");
    ({ lat, lon, tz } = place);
    label = place.name;
  }

  const dateUTC = localToUTC(date, time, tz);
  return { dateUTC, lat, lon, tz, label, localDate: date, localTime: time };
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

export function reveal(root, selector = "[data-result]") {
  const panel = root.querySelector(selector);
  if (panel) panel.hidden = false;
  return panel;
}

export function cell(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}

