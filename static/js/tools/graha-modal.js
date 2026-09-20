/**
 * VedicJyoti / JyotishVeda — graha detail popup.
 *
 * Injects one modal into the page (idempotent) and populates it with the
 * output of interpretGrahaPlacement() whenever a graha is activated from the
 * chart or the graha table.
 */
import { interpretGrahaPlacement } from "../vedic/graha-interpretations.js";
import { formatSignDegrees } from "../vedic/ayanamsha.js";

let overlay = null;
let dialog = null;
let lastFocused = null;

function ensureModal() {
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.className = "graha-modal-overlay";
  overlay.setAttribute("hidden", "");

  dialog = document.createElement("div");
  dialog.className = "graha-modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.tabIndex = -1;

  dialog.innerHTML = `
    <button type="button" class="graha-modal-close" aria-label="Close">✕</button>
    <div class="graha-modal-head">
      <span class="graha-modal-symbol" data-gm-symbol></span>
      <div>
        <p class="graha-modal-kicker" data-gm-kicker></p>
        <h3 data-gm-title></h3>
      </div>
    </div>
    <div class="graha-modal-badges" data-gm-badges></div>
    <div class="graha-modal-body" data-gm-body></div>
    <p class="graha-modal-foot">A traditional interpretive reading, assembled from your chart's actual sign, house, dignity and nakshatra — offered for study and reflection, not as prediction, medical, legal or financial advice.</p>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeGrahaModal();
  });
  dialog.querySelector(".graha-modal-close").addEventListener("click", closeGrahaModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hasAttribute("hidden")) closeGrahaModal();
  });

  return overlay;
}

const SYMBOLS = {
  surya: "☉", chandra: "☽", mangal: "♂", budha: "☿", guru: "♃",
  shukra: "♀", shani: "♄", rahu: "☊", ketu: "☋",
};

export function openGrahaModal(kundali, grahaKey) {
  ensureModal();
  const r = interpretGrahaPlacement(kundali, grahaKey);

  dialog.querySelector("[data-gm-symbol]").textContent = SYMBOLS[grahaKey] || "✦";
  dialog.querySelector("[data-gm-kicker]").textContent = `GRAHA READING · ${r.english.toUpperCase()}`;
  dialog.querySelector("[data-gm-title]").textContent = `${r.name} in ${r.rashi.name}, ${r.house}${ordSuffix(r.house)} house`;

  const badges = [
    `<span class="pill">${r.dignityLabel}</span>`,
    `<span class="pill">${r.bhavaName}</span>`,
    `<span class="pill">${r.nakshatra.name} · p${r.nakshatra.pada}</span>`,
    r.retrograde ? `<span class="pill pill-warn">Retrograde</span>` : `<span class="pill">Direct</span>`,
    `<span class="pill mono">${formatSignDegrees(r.longitude)}</span>`,
  ].join("");
  dialog.querySelector("[data-gm-badges]").innerHTML = badges;

  dialog.querySelector("[data-gm-body]").innerHTML = r.paragraphs.map((p) => `<p>${p}</p>`).join("");

  lastFocused = document.activeElement;
  overlay.removeAttribute("hidden");
  document.body.classList.add("graha-modal-open");
  dialog.focus();
}

export function closeGrahaModal() {
  if (!overlay) return;
  overlay.setAttribute("hidden", "");
  document.body.classList.remove("graha-modal-open");
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

/**
 * Wire click/keyboard activation for every element carrying data-graha-open
 * inside `root`. Call this once after each render that adds new graha nodes
 * (the chart SVG and the graha table are both re-rendered per run).
 */
export function wireGrahaTriggers(root, getKundali) {
  ensureModal();
  root.addEventListener("click", (e) => {
    const el = e.target.closest("[data-graha-open]");
    if (!el || !root.contains(el)) return;
    const kundali = getKundali();
    if (!kundali) return;
    openGrahaModal(kundali, el.dataset.grahaOpen);
  });
  root.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = e.target.closest("[data-graha-open]");
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    const kundali = getKundali();
    if (!kundali) return;
    openGrahaModal(kundali, el.dataset.grahaOpen);
  });
}

function ordSuffix(n) {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
