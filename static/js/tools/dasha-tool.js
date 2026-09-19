import { buildKundali } from "../vedic/kundali.js";
import { vimshottariMahadashas, antardashas, currentDasha, formatDate, describeDuration } from "../vedic/dasha.js";
import { wireBirthForm, readBirthForm, showError, clearError, reveal, cell } from "./birth-form.js";

export function initDashaTool(rootSelector = "#dasha-tool") {
  const root = document.querySelector(rootSelector);
  if (!root) return;
  wireBirthForm(root);

  root.querySelector("[data-run]")?.addEventListener("click", () => {
    clearError(root);
    try {
      const input = readBirthForm(root);
      const k = buildKundali(input.dateUTC, input.lat, input.lon);
      const result = vimshottariMahadashas(input.dateUTC, k.grahas.chandra.longitude);
      const now = new Date();
      const running = currentDasha(result, now);

      reveal(root);

      const items = result.periods.map((p) => {
        const isCurrent = running && now >= p.start && now < p.end && running.maha.lord === p.lord;
        const pct = ((now - p.start) / (p.end - p.start)) * 100;
        return `<li class="${isCurrent ? "is-current" : ""}">
          <b>${p.lord} <span class="muted">${p.english}</span></b>
          <div class="dasha-bar"><i style="width:${Math.max(0, Math.min(100, now >= p.end ? 100 : pct)).toFixed(1)}%"></i></div>
          <small>${formatDate(p.start)} → ${formatDate(p.end)} · ${describeDuration(p.years ?? p.fullYears)}</small>
        </li>`;
      }).join("");

      let antarHtml = "";
      if (running) {
        const subs = antardashas({
          ...running.maha,
          start: running.maha.partial
            ? new Date(running.maha.start.getTime() - (running.maha.fullYears - running.maha.years) * 365.2425 * 86400000)
            : running.maha.start,
        });
        antarHtml = `<h3>Antardashas inside the running ${running.maha.lord} mahadasha</h3>
          <ul class="dasha-list">${subs.map((s) => {
            const cur = now >= s.start && now < s.end;
            return `<li class="${cur ? "is-current" : ""}"><b>${running.maha.lord} / ${s.lord}</b>
              <div class="dasha-bar"><i style="width:${cur ? Math.min(100, ((now - s.start) / (s.end - s.start)) * 100).toFixed(1) : now >= s.end ? 100 : 0}%"></i></div>
              <small>${formatDate(s.start)} → ${formatDate(s.end)}</small></li>`;
          }).join("")}</ul>`;
      }

      root.querySelector("[data-result-body]").innerHTML = `
        <div class="readout">
          ${cell("Janma Nakshatra", `${result.nakshatra.name} p${result.nakshatra.pada}`)}
          ${cell("Nakshatra lord", result.nakshatra.lord)}
          ${cell("Fraction already crossed", `${(result.nakshatra.fractionElapsed * 100).toFixed(2)}%`)}
          ${cell("Balance at birth", result.balanceText)}
          ${running ? cell("Running mahadasha", running.maha.lord) : ""}
          ${running && running.antar ? cell("Running antardasha", running.antar.lord) : ""}
        </div>
        <h3>Mahadasha sequence (120 years)</h3>
        <ul class="dasha-list">${items}</ul>
        ${antarHtml}`;
    } catch (err) {
      showError(root, err.message || String(err));
    }
  });
}
