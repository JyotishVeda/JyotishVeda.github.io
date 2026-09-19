import { buildKundali } from "../vedic/kundali.js";
import { formatSignDegrees, formatDMS, lahiriAyanamsha } from "../vedic/ayanamsha.js";
import { wireBirthForm, readBirthForm, showError, clearError, reveal, cell } from "./birth-form.js";
import { tropicalLongitude } from "../vedic/grahas.js";

export function initMoonRashiTool(rootSelector = "#moon-rashi-tool") {
  const root = document.querySelector(rootSelector);
  if (!root) return;
  wireBirthForm(root);

  root.querySelector("[data-run]")?.addEventListener("click", () => {
    clearError(root);
    try {
      const input = readBirthForm(root);
      const k = buildKundali(input.dateUTC, input.lat, input.lon);
      const moonTropical = tropicalLongitude("Moon", input.dateUTC);
      const aya = lahiriAyanamsha(input.dateUTC);
      reveal(root);
      root.querySelector("[data-result-body]").innerHTML = `
        <div class="readout">
          ${cell("Janma Rashi (Vedic moon sign)", k.janmaRashi.name)}
          ${cell("Western equivalent name", k.janmaRashi.english)}
          ${cell("Rashi lord", k.janmaRashi.lord)}
          ${cell("Degree in rashi", formatSignDegrees(k.grahas.chandra.longitude))}
          ${cell("Janma Nakshatra", `${k.janmaNakshatra.name} p${k.janmaNakshatra.pada}`)}
          ${cell("Lagna (ascendant)", k.ascendant.rashi.name)}
          ${cell("Surya Rashi", k.grahas.surya.rashi.name)}
          ${cell("Ayanamsha applied", formatDMS(aya))}
        </div>
        <div class="note">
          <p class="mt0"><strong>Why this differs from your newspaper sign.</strong> The Moon's tropical longitude at your birth instant was ${moonTropical.toFixed(4)}°. Subtracting the Lahiri ayanamsha of ${aya.toFixed(4)}° gives a sidereal longitude of ${k.grahas.chandra.longitude.toFixed(4)}°, which falls in ${k.janmaRashi.name}.</p>
          <p style="margin-bottom:0">Western sun-sign columns use the tropical Sun. Indian astrology uses the sidereal Moon, so the two answers are expected to be different.</p>
        </div>`;
    } catch (err) {
      showError(root, err.message || String(err));
    }
  });
}
