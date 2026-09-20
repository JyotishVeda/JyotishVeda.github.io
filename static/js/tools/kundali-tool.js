import { buildKundali, PADA_SYLLABLES } from "../vedic/kundali.js";
import { formatDMS, formatSignDegrees } from "../vedic/ayanamsha.js";
import { vimshottariMahadashas, currentDasha, formatDate, describeDuration } from "../vedic/dasha.js";
import { renderNorthKundali, renderSouthKundali } from "../visualization/kundali-svg.js";
import { wireBirthForm, readBirthForm, showError, clearError, reveal, cell } from "./birth-form.js";
import { wireGrahaTriggers } from "./graha-modal.js";

export function initKundaliTool(rootSelector = "#kundali-tool") {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  wireBirthForm(root);

  let lastKundali = null;
  let style = "north";

  wireGrahaTriggers(root, () => lastKundali);

  root.querySelector("[data-run]")?.addEventListener("click", () => {
    clearError(root);
    try {
      const input = readBirthForm(root);
      const kundali = buildKundali(input.dateUTC, input.lat, input.lon);
      lastKundali = kundali;
      render(root, kundali, input, style);
    } catch (err) {
      showError(root, err.message || String(err));
    }
  });

  root.querySelectorAll("[data-style]").forEach((btn) => {
    btn.addEventListener("click", () => {
      style = btn.dataset.style;
      root.querySelectorAll("[data-style]").forEach((b) => b.classList.toggle("is-active", b === btn));
      if (lastKundali) drawChart(root, lastKundali, style);
    });
  });
}

function drawChart(root, kundali, style) {
  const holder = root.querySelector("[data-chart]");
  if (!holder) return;
  if (style === "south") renderSouthKundali(holder, kundali);
  else renderNorthKundali(holder, kundali);
}

function render(root, kundali, input, style) {
  reveal(root);
  drawChart(root, kundali, style);

  const asc = kundali.ascendant;
  const moon = kundali.grahas.chandra;
  const syllables = PADA_SYLLABLES[kundali.janmaNakshatra.number] || [];

  root.querySelector("[data-summary]").innerHTML = `
    <div class="readout">
      ${cell("Lagna (ascendant)", `${asc.rashi.name} ${formatSignDegrees(asc.longitude)}`)}
      ${cell("Janma Rashi (Moon)", `${moon.rashi.name} ${formatSignDegrees(moon.longitude)}`)}
      ${cell("Janma Nakshatra", `${kundali.janmaNakshatra.name}, pada ${kundali.janmaNakshatra.pada}`)}
      ${cell("Nakshatra lord", kundali.janmaNakshatra.lord)}
      ${cell("Name syllable", syllables[kundali.janmaNakshatra.pada - 1] || "—")}
      ${cell("Ayanamsha (Lahiri)", formatDMS(kundali.ayanamsha))}
      ${cell("Birth place", input.label)}
      ${cell("UTC instant", kundali.dateUTC.toISOString().replace(".000Z", "Z"))}
    </div>`;

  const rows = kundali.grahas.order.map((key) => {
    const g = kundali.grahas[key];
    return `<tr class="graha-row" data-graha-open="${key}" tabindex="0" role="button" aria-label="${g.name} details">
      <td><strong>${g.name}</strong> <span class="muted">(${g.english})</span></td>
      <td>${g.rashi.name}</td>
      <td class="mono">${formatSignDegrees(g.longitude)}</td>
      <td>${g.house}</td>
      <td>${g.nakshatra.name} <span class="muted">p${g.nakshatra.pada}</span></td>
      <td>${g.retrograde ? "Vakri (R)" : "Direct"}</td>
      <td class="graha-row-more">Details →</td>
    </tr>`;
  }).join("");

  root.querySelector("[data-grahas]").innerHTML = `
    <p class="field-note">Tap any graha — in the chart or in this table — for a full reading of that placement.</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>Bhava</th><th>Nakshatra</th><th>Motion</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;

  const houseRows = kundali.houses.map((h) => `<tr>
      <td>${h.number}</td>
      <td>${h.rashi.name} <span class="muted">(${h.rashi.english})</span></td>
      <td>${h.rashi.lord}</td>
      <td>${h.grahas.length ? h.grahas.map((g) => g.name).join(", ") : "<span class=\"muted\">empty</span>"}</td>
    </tr>`).join("");

  root.querySelector("[data-houses]").innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Bhava</th><th>Rashi</th><th>Lord</th><th>Occupants</th></tr></thead>
      <tbody>${houseRows}</tbody>
    </table></div>`;

  const dasha = vimshottariMahadashas(kundali.dateUTC, moon.longitude);
  const now = new Date();
  const running = currentDasha(dasha, now);

  const dashaRows = dasha.periods.map((p) => {
    const isCurrent = running && running.maha.lord === p.lord && now >= p.start && now < p.end;
    const pct = Math.max(0, Math.min(100, ((now - p.start) / (p.end - p.start)) * 100));
    return `<li class="${isCurrent ? "is-current" : ""}">
      <b>${p.lord} <span class="muted">(${p.english})</span></b>
      <div class="dasha-bar"><i style="width:${isCurrent ? pct.toFixed(1) : now >= p.end ? 100 : 0}%"></i></div>
      <small>${formatDate(p.start)} → ${formatDate(p.end)}</small>
    </li>`;
  }).join("");

  root.querySelector("[data-dasha]").innerHTML = `
    <p class="small muted">Balance of the first mahadasha at birth: <strong>${dasha.balanceText}</strong> of ${dasha.periods[0].lord}, because the Moon had crossed ${(dasha.nakshatra.fractionElapsed * 100).toFixed(1)}% of ${dasha.nakshatra.name}.</p>
    ${running ? `<p class="small">Running now: <strong>${running.maha.lord}</strong> mahadasha${running.antar ? ` / <strong>${running.antar.lord}</strong> antardasha (to ${formatDate(running.antar.end)})` : ""}.</p>` : ""}
    <ul class="dasha-list">${dashaRows}</ul>`;
}
