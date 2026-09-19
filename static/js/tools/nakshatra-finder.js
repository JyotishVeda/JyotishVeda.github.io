import { buildKundali, PADA_SYLLABLES } from "../vedic/kundali.js";
import { formatSignDegrees, formatDMS } from "../vedic/ayanamsha.js";
import { wireBirthForm, readBirthForm, showError, clearError, reveal, cell } from "./birth-form.js";

export function initNakshatraFinder(rootSelector = "#nakshatra-finder") {
  const root = document.querySelector(rootSelector);
  if (!root) return;
  wireBirthForm(root);

  root.querySelector("[data-run]")?.addEventListener("click", () => {
    clearError(root);
    try {
      const input = readBirthForm(root);
      const k = buildKundali(input.dateUTC, input.lat, input.lon);
      const nak = k.janmaNakshatra;
      const syllables = PADA_SYLLABLES[nak.number] || [];
      reveal(root);
      root.querySelector("[data-result-body]").innerHTML = `
        <div class="readout">
          ${cell("Janma Nakshatra", nak.name)}
          ${cell("Pada", `${nak.pada} of 4`)}
          ${cell("Nakshatra lord", nak.lord)}
          ${cell("Deity", nak.deity)}
          ${cell("Gana", nak.gana)}
          ${cell("Yoni", `${nak.yoni} (${nak.yoniGender === "M" ? "male" : "female"})`)}
          ${cell("Nadi", nak.nadi)}
          ${cell("Janma Rashi", k.janmaRashi.name)}
          ${cell("Moon degree", formatSignDegrees(k.grahas.chandra.longitude))}
          ${cell("Suggested syllable", syllables[nak.pada - 1] || "—")}
          ${cell("Ayanamsha", formatDMS(k.ayanamsha))}
          ${cell("Lagna", k.ascendant.rashi.name)}
        </div>
        <p class="small muted" style="margin-top:1rem">The Moon's sidereal longitude was ${k.grahas.chandra.longitude.toFixed(4)}°. Dividing by 13°20′ gives nakshatra ${nak.number}; the remainder divided by 3°20′ gives pada ${nak.pada}.</p>`;
    } catch (err) {
      showError(root, err.message || String(err));
    }
  });
}
