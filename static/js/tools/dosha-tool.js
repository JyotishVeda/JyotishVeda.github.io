import { buildKundali } from "../vedic/kundali.js";
import { mangalDosha, sadeSati, kaalSarp } from "../vedic/dosha.js";
import { formatSignDegrees } from "../vedic/ayanamsha.js";
import { wireBirthForm, readBirthForm, showError, clearError, reveal, cell } from "./birth-form.js";

export function initDoshaTool(rootSelector = "#dosha-tool") {
  const root = document.querySelector(rootSelector);
  if (!root) return;
  wireBirthForm(root);

  root.querySelector("[data-run]")?.addEventListener("click", () => {
    clearError(root);
    try {
      const input = readBirthForm(root);
      const k = buildKundali(input.dateUTC, input.lat, input.lon);
      const mangal = mangalDosha(k);
      const sade = sadeSati(k.janmaRashi, new Date());
      const sarp = kaalSarp(k);

      reveal(root);

      const mangalRows = mangal.results.map((r) => `<tr>
        <td>${r.label}</td><td>${r.house}</td>
        <td>${r.afflicted ? '<span style="color:#ff9d8b">affected</span>' : '<span style="color:#7fe3bf">clear</span>'}</td>
      </tr>`).join("");

      root.querySelector("[data-result-body]").innerHTML = `
        <div class="readout">
          ${cell("Lagna", k.ascendant.rashi.name)}
          ${cell("Janma Rashi", k.janmaRashi.name)}
          ${cell("Mangal position", `${k.grahas.mangal.rashi.name} ${formatSignDegrees(k.grahas.mangal.longitude)}`)}
          ${cell("Shani now", `${sade.saturn.rashi.name}${sade.retrograde ? " (Vakri)" : ""}`)}
        </div>

        <h3>Mangal (Kuja) Dosha</h3>
        <p><strong>${mangal.severity}.</strong> Mars is counted as afflicting when it sits in house ${mangal.houses.join(", ")} from a reference point.</p>
        <div class="table-wrap"><table>
          <thead><tr><th>Counted from</th><th>Mars in house</th><th>Result</th></tr></thead>
          <tbody>${mangalRows}</tbody></table></div>
        ${mangal.cancellations.length ? `<div class="note"><strong>Mitigating factors present:</strong><ul>${mangal.cancellations.map((c) => `<li>${c}</li>`).join("")}</ul></div>` : ""}

        <h3>Shani Sade Sati</h3>
        <p>Saturn currently transits ${sade.saturn.rashi.name}, which is house ${sade.position} counted from your janma rashi ${k.janmaRashi.name}.</p>
        <p>${sade.active ? `<strong>Sade Sati is running.</strong> ${sade.phase}.` : sade.dhaiya ? `<strong>Dhaiya is running.</strong> ${sade.dhaiya}.` : "Neither Sade Sati nor a Dhaiya period is running right now."}</p>

        <h3>Kaal Sarp Yoga</h3>
        <p>${sarp.present
          ? `All seven non-nodal grahas fall on one side of the Rahu–Ketu axis (${sarp.side}), so the classical Kaal Sarp condition is met. Rahu sits in ${sarp.rahuRashi.name} and Ketu in ${sarp.ketuRashi.name}.`
          : `The seven non-nodal grahas are not confined to one side of the Rahu–Ketu axis, so the classical Kaal Sarp condition is not met.`}</p>
        <p class="small muted">${sarp.note}</p>`;
    } catch (err) {
      showError(root, err.message || String(err));
    }
  });
}
