import { calculatePanchang, approximateTithiEnd } from "../vedic/panchang.js";
import { formatDMS, formatSignDegrees, localToUTC } from "../vedic/ayanamsha.js";
import { calculateGrahas } from "../vedic/grahas.js";
import { populatePlaceSelect, placeAt } from "../vedic/places.js";
import { showError, clearError } from "./birth-form.js";

export function initPanchangTool(rootSelector = "#panchang-tool") {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const dateInput = root.querySelector("[data-date]");
  const placeSelect = root.querySelector("[data-place]");
  if (placeSelect) populatePlaceSelect(placeSelect);
  if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);

  const run = () => {
    clearError(root);
    try {
      const place = placeAt(placeSelect.value) || { lat: 28.6139, lon: 77.209, tz: 5.5, name: "Delhi, India" };
      const dateUTC = localToUTC(dateInput.value, "06:00", place.tz);
      render(root, dateUTC, place);
    } catch (err) {
      showError(root, err.message || String(err));
    }
  };

  root.querySelector("[data-run]")?.addEventListener("click", run);
  run();
}

function render(root, dateUTC, place) {
  const p = calculatePanchang(dateUTC, place.tz);
  const grahas = calculateGrahas(dateUTC);
  const end = approximateTithiEnd(dateUTC);

  root.querySelector("[data-panchang]").innerHTML = `
    <div class="panchang-grid">
      <div class="panchang-cell"><span>Vara</span><strong>${p.vara.name}</strong><small>${p.vara.english} · lord ${p.vara.lord}</small></div>
      <div class="panchang-cell"><span>Tithi</span><strong>${p.tithi.paksha} ${p.tithi.nameInPaksha}</strong><small>#${p.tithi.number} of 30 · ${(p.tithi.progress * 100).toFixed(0)}% elapsed</small></div>
      <div class="panchang-cell"><span>Nakshatra</span><strong>${p.nakshatra.name}</strong><small>pada ${p.nakshatra.pada} · lord ${p.nakshatra.lord}</small></div>
      <div class="panchang-cell"><span>Yoga</span><strong>${p.yoga.name}</strong><small>#${p.yoga.number} of 27</small></div>
      <div class="panchang-cell"><span>Karana</span><strong>${p.karana.name}</strong><small>half-tithi #${p.karana.number} of 60</small></div>
      <div class="panchang-cell"><span>Chandra Rashi</span><strong>${p.moonRashi.name}</strong><small>${formatSignDegrees(p.moonLongitude)}</small></div>
      <div class="panchang-cell"><span>Surya Rashi</span><strong>${p.sunRashi.name}</strong><small>${formatSignDegrees(p.sunLongitude)}</small></div>
      <div class="panchang-cell"><span>Moon illumination</span><strong>${p.moonPhasePercent}%</strong><small>elongation ${p.tithi.elongation.toFixed(2)}°</small></div>
    </div>
    <p class="small muted" style="margin-top:1rem">Computed for 06:00 local time at ${place.name} (UTC${place.tz >= 0 ? "+" : ""}${place.tz}). Ayanamsha ${formatDMS(grahas.ayanamsha)}. ${end ? `The running tithi changes at approximately ${end.toLocaleString(undefined, { timeZone: "UTC" })} UTC.` : ""}</p>`;

  const rows = grahas.order.map((k) => {
    const g = grahas[k];
    return `<tr><td>${g.name} <span class="muted">(${g.english})</span></td><td>${g.rashi.name}</td><td class="mono">${formatSignDegrees(g.longitude)}</td><td>${g.nakshatra.name}</td><td>${g.retrograde ? "Vakri" : "Direct"}</td></tr>`;
  }).join("");

  root.querySelector("[data-transits]").innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>Nakshatra</th><th>Motion</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
}
