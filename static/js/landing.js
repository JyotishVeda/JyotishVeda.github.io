import { renderStarField } from "./visualization/star-field.js";
import { calculatePanchang } from "./vedic/panchang.js";
import { calculateGrahas } from "./vedic/grahas.js";
import { formatSignDegrees, formatDMS } from "./vedic/ayanamsha.js";

export function renderLanding() {
  const canvas = document.getElementById("star-field");
  if (canvas) renderStarField(canvas);

  const holder = document.getElementById("sky-grid");
  if (!holder) return;

  try {
    const now = new Date();
    const p = calculatePanchang(now, 5.5);
    const g = calculateGrahas(now);

    const dateEl = document.getElementById("sky-date");
    if (dateEl) dateEl.textContent = now.toDateString();

    holder.innerHTML = `
      <div class="sky-cell"><span>Tithi</span><strong>${p.tithi.nameInPaksha}</strong><small>${p.tithi.paksha} paksha</small></div>
      <div class="sky-cell"><span>Nakshatra</span><strong>${p.nakshatra.name}</strong><small>pada ${p.nakshatra.pada}</small></div>
      <div class="sky-cell"><span>Chandra</span><strong>${p.moonRashi.name}</strong><small>${formatSignDegrees(p.moonLongitude)}</small></div>
      <div class="sky-cell"><span>Surya</span><strong>${p.sunRashi.name}</strong><small>${formatSignDegrees(p.sunLongitude)}</small></div>
      <div class="sky-cell"><span>Guru</span><strong>${g.guru.rashi.name}</strong><small>${g.guru.retrograde ? "Vakri" : "Direct"}</small></div>
      <div class="sky-cell"><span>Shani</span><strong>${g.shani.rashi.name}</strong><small>${g.shani.retrograde ? "Vakri" : "Direct"}</small></div>`;

    const note = document.getElementById("sky-note");
    if (note) {
      note.textContent = `Calculated in your browser from the current UTC instant. Lahiri ayanamsha applied: ${formatDMS(g.ayanamsha)}.`;
    }
  } catch (e) {
    holder.innerHTML = `<p class="small muted">Live sky data could not be calculated in this browser.</p>`;
  }
}
