import { buildKundali } from "../vedic/kundali.js";
import { buildRemedyPlan } from "../vedic/remedies.js";
import { formatSignDegrees } from "../vedic/ayanamsha.js";
import { wireBirthForm, readBirthForm, showError, clearError, reveal, cell } from "./birth-form.js";

const APPROACH_BADGE_CLASS = {
  strengthen: "pill-ok", maintain: "", balance: "pill-neutral", pacify: "pill-warn",
};

export function initUpcharTool(rootSelector = "#upchar-tool") {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  wireBirthForm(root);

  root.querySelector("[data-run]")?.addEventListener("click", () => {
    clearError(root);
    try {
      const input = readBirthForm(root);
      const kundali = buildKundali(input.dateUTC, input.lat, input.lon);
      const plan = buildRemedyPlan(kundali);
      render(root, kundali, plan, input);
    } catch (err) {
      showError(root, err.message || String(err));
    }
  });
}

function grahaCard(p, { emphasised = false } = {}) {
  const prof = p.profile;
  return `
    <div class="remedy-card ${emphasised ? "remedy-card-emphasis" : ""}">
      <div class="result-head">
        <h3 style="margin:0">${p.name} <span class="muted small">(${p.english})</span></h3>
        <span class="pill ${APPROACH_BADGE_CLASS[p.approach] || ""}">${p.approachLabel}</span>
      </div>
      <div class="pill-row" style="margin-top:.2rem">
        <span class="pill">${p.rashi.name}, house ${p.house}</span>
        <span class="pill">${p.dignityLabel}</span>
        <span class="pill">${p.natureLabel}</span>
        ${p.retrograde ? `<span class="pill pill-warn">Retrograde</span>` : ""}
      </div>
      <p class="small muted" style="margin-top:.7rem">${p.rationale}</p>

      <div class="readout" style="margin-top:.9rem">
        ${cell("Deity", prof.deity)}
        ${cell("Mantra", prof.mantra)}
        ${cell("Japa", prof.japa)}
        ${cell("Day", prof.day)}
        ${cell("Yantra", prof.yantra)}
        ${cell("Direction", prof.direction)}
      </div>

      <h4>Gemstone (Ratna)</h4>
      ${p.approach === "pacify"
        ? `<p class="small">A gemstone is <strong>not recommended</strong> for a graha approached through pacification. Focus on the mantra, charity and lifestyle notes below instead. ${p.nature === "shadow" ? "" : `If you still wish to explore it, do so only with a qualified practitioner's review.`}</p>`
        : `<p class="small"><strong>${prof.gemstone}</strong> (substitute: ${prof.substituteGem}), set in ${prof.metal}. ${prof.gemstoneCaution}</p>`}

      <div class="grid grid-2" style="margin-top:.6rem">
        <div>
          <h4>Favour</h4>
          <p class="small"><strong>Colors:</strong> ${prof.colorsFavor.join(", ")}<br>
          <strong>Add to life:</strong> ${prof.addToLife.join("; ")}.<br>
          <strong>Charity (daan):</strong> ${prof.charity.join(", ")}.</p>
        </div>
        <div>
          <h4>Avoid</h4>
          <p class="small"><strong>Colors:</strong> ${prof.colorsAvoid.join(", ")}<br>
          <strong>Steer clear of:</strong> ${prof.avoidInLife.join("; ")}.</p>
        </div>
      </div>
      <p class="small muted" style="margin-top:.4rem">${prof.fasting}</p>
    </div>`;
}

function render(root, kundali, plan, input) {
  reveal(root);

  root.querySelector("[data-summary]").innerHTML = `
    <div class="readout">
      ${cell("Lagna", `${plan.lagna.rashi.name} ${formatSignDegrees(plan.lagna.longitude)}`)}
      ${cell("Birth place", input.label)}
      ${cell("Grahas needing most attention", plan.grahaPlans.slice(0, 3).map((p) => p.name).join(", "))}
    </div>`;

  const dashaBox = root.querySelector("[data-dasha-remedy]");
  if (plan.dashaPlan && plan.dashaPlan.mahaPlan) {
    const { mahaLord, antarLord, mahaPlan, antarPlan } = plan.dashaPlan;
    dashaBox.innerHTML = `
      <p>You are currently running the <strong>${mahaLord}</strong> mahadasha${antarLord ? ` / <strong>${antarLord}</strong> antardasha` : ""}. Classical guidance weighs the mahadasha lord's remedies most heavily, with the antardasha lord's remedies as a secondary, lighter layer for as long as this specific antardasha runs.</p>
      <h3 style="margin-top:1.2rem">Mahadasha lord — ${mahaLord}</h3>
      ${grahaCard(mahaPlan, { emphasised: true })}
      ${antarPlan && antarPlan.key !== mahaPlan.key ? `<h3 style="margin-top:1.2rem">Antardasha lord — ${antarLord}</h3>${grahaCard(antarPlan, { emphasised: true })}` : ""}
    `;
  } else {
    dashaBox.innerHTML = `<p class="small muted">The running dasha could not be determined for this chart.</p>`;
  }

  root.querySelector("[data-priority]").innerHTML = plan.grahaPlans
    .map((p) => `<span class="pill ${APPROACH_BADGE_CLASS[p.approach] || ""}">${p.name} — ${p.approachLabel}</span>`)
    .join(" ");

  root.querySelector("[data-all-grahas]").innerHTML = plan.grahaPlans.map((p) => grahaCard(p)).join("");
}
