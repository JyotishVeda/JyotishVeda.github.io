import { gunaMilan } from "../vedic/milan.js";
import { RASHIS } from "../vedic/rashi.js";
import { NAKSHATRAS } from "../vedic/nakshatra.js";
import { buildKundali } from "../vedic/kundali.js";
import { readBirthForm, wireBirthForm, showError, clearError } from "./birth-form.js";

function fillSelectors(root) {
  root.querySelectorAll("[data-rashi-select]").forEach((sel) => {
    RASHIS.forEach((r) => {
      const o = document.createElement("option");
      o.value = r.key;
      o.textContent = `${r.name} (${r.english})`;
      sel.appendChild(o);
    });
  });
  root.querySelectorAll("[data-nakshatra-select]").forEach((sel) => {
    NAKSHATRAS.forEach((n) => {
      const o = document.createElement("option");
      o.value = String(n.number);
      o.textContent = `${n.number}. ${n.name}`;
      sel.appendChild(o);
    });
  });
}

export function initMilanTool(rootSelector = "#milan-tool") {
  const root = document.querySelector(rootSelector);
  if (!root) return;
  fillSelectors(root);

  root.querySelectorAll("[data-birth]").forEach((section) => wireBirthForm(section));

  root.querySelectorAll("[data-derive]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const who = btn.dataset.derive;
      const section = root.querySelector(`[data-birth="${who}"]`);
      clearError(root);
      try {
        const input = readBirthForm(section);
        const k = buildKundali(input.dateUTC, input.lat, input.lon);
        root.querySelector(`[data-rashi-select][data-who="${who}"]`).value = k.janmaRashi.key;
        root.querySelector(`[data-nakshatra-select][data-who="${who}"]`).value = String(k.janmaNakshatra.number);
        section.querySelector("[data-derived]").textContent =
          `Calculated: ${k.janmaRashi.name} · ${k.janmaNakshatra.name} pada ${k.janmaNakshatra.pada}`;
      } catch (err) {
        showError(root, err.message || String(err));
      }
    });
  });

  root.querySelector("[data-run]")?.addEventListener("click", () => {
    clearError(root);
    try {
      const boy = {
        rashi: root.querySelector('[data-rashi-select][data-who="boy"]').value,
        nakshatra: Number(root.querySelector('[data-nakshatra-select][data-who="boy"]').value),
      };
      const girl = {
        rashi: root.querySelector('[data-rashi-select][data-who="girl"]').value,
        nakshatra: Number(root.querySelector('[data-nakshatra-select][data-who="girl"]').value),
      };
      render(root, gunaMilan(boy, girl));
    } catch (err) {
      showError(root, err.message || String(err));
    }
  });
}

function render(root, result) {
  const panel = root.querySelector("[data-result]");
  panel.hidden = false;

  const rows = result.kootas.map((k) => `<tr>
      <td><strong>${k.name}</strong></td>
      <td class="mono">${k.score} / ${k.max}</td>
      <td>${k.detail}</td>
      <td class="small muted">${k.note}</td>
    </tr>`).join("");

  panel.innerHTML = `
    <div class="result-head">
      <h3>Ashtakoota result</h3>
      <span class="badge ${result.total >= 18 ? "" : "badge-warn"}">${result.verdict}</span>
    </div>
    <div class="score-ring" style="--pct:${result.percent}%"><div><b>${result.total}</b><small>of 36</small></div></div>
    <p class="center small muted">${result.boy.rashi.name} · ${result.boy.nakshatra.name} &nbsp;—&nbsp; ${result.girl.rashi.name} · ${result.girl.nakshatra.name}</p>
    ${result.flags.length ? `<div class="error-msg">Flagged: ${result.flags.join(", ")}. Classical texts list exemptions for each of these; see the notes below the table.</div>` : ""}
    <div class="table-wrap"><table>
      <thead><tr><th>Koota</th><th>Score</th><th>Basis</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><th>Total</th><th class="mono">${result.total} / 36</th><th colspan="2">${result.percent}%</th></tr></tfoot>
    </table></div>`;
}
