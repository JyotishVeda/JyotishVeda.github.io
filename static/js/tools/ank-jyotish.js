/**
 * JyotishVeda — Ank Jyotish (Indian numerology).
 *
 * Moolank  — the birth day reduced to a single digit (the ruling number)
 * Bhagyank — the whole date of birth reduced to a single digit (the destiny number)
 * Namank   — the name reduced through the Chaldean letter values used in India
 */

const GRAHA_BY_NUMBER = {
  1: { graha: "Surya (Sun)", day: "Sunday", colour: "Gold, orange", gem: "Ruby",
       theme: "leadership, authority, independent action" },
  2: { graha: "Chandra (Moon)", day: "Monday", colour: "White, cream", gem: "Pearl",
       theme: "sensitivity, cooperation, changeable moods" },
  3: { graha: "Guru (Jupiter)", day: "Thursday", colour: "Yellow, saffron", gem: "Yellow sapphire",
       theme: "teaching, optimism, expansion, advice" },
  4: { graha: "Rahu", day: "Saturday", colour: "Grey, khaki", gem: "Hessonite",
       theme: "unconventional thinking, sudden change, technology" },
  5: { graha: "Budha (Mercury)", day: "Wednesday", colour: "Green", gem: "Emerald",
       theme: "communication, trade, quickness, restlessness" },
  6: { graha: "Shukra (Venus)", day: "Friday", colour: "White, pastel blue", gem: "Diamond",
       theme: "comfort, art, relationships, aesthetics" },
  7: { graha: "Ketu", day: "Tuesday", colour: "Smoke grey", gem: "Cat's eye",
       theme: "introspection, research, detachment, intuition" },
  8: { graha: "Shani (Saturn)", day: "Saturday", colour: "Dark blue, black", gem: "Blue sapphire",
       theme: "discipline, delay, endurance, late success" },
  9: { graha: "Mangal (Mars)", day: "Tuesday", colour: "Red", gem: "Red coral",
       theme: "energy, conflict, courage, impatience" },
};

const CHALDEAN = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

function reduceToDigit(n, keepMaster = false) {
  let value = Math.abs(Math.trunc(n));
  while (value > 9) {
    if (keepMaster && (value === 11 || value === 22)) return value;
    value = String(value).split("").reduce((s, d) => s + Number(d), 0);
  }
  return value;
}

export function ankJyotish(dateString, name = "") {
  const [y, m, d] = String(dateString).split("-").map(Number);
  if (!y || !m || !d) throw new RangeError("Enter a valid date of birth.");

  const moolank = reduceToDigit(d);
  const digits = `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`
    .split("").reduce((s, c) => s + Number(c), 0);
  const bhagyank = reduceToDigit(digits);

  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const nameTotal = letters.reduce((s, ch) => s + (CHALDEAN[ch] || 0), 0);
  const namank = nameTotal ? reduceToDigit(nameTotal) : null;

  const friendly = friendlyNumbers(moolank);

  return {
    moolank,
    bhagyank,
    namank,
    nameTotal,
    moolankGraha: GRAHA_BY_NUMBER[moolank],
    bhagyankGraha: GRAHA_BY_NUMBER[bhagyank],
    namankGraha: namank ? GRAHA_BY_NUMBER[namank] : null,
    friendly,
    harmonious: friendly.includes(bhagyank),
    dateSum: digits,
  };
}

/** Friendly numbers follow the natural friendships of the ruling grahas. */
function friendlyNumbers(n) {
  const map = {
    1: [1, 2, 3, 9], 2: [1, 2, 5, 7], 3: [1, 2, 3, 9],
    4: [4, 5, 6, 8], 5: [1, 4, 5, 6], 6: [4, 5, 6, 8],
    7: [2, 5, 7, 9], 8: [4, 5, 6, 8], 9: [1, 3, 5, 9],
  };
  return map[n] || [];
}

export function initAnkTool(rootSelector = "#ank-tool") {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const dateInput = root.querySelector("[data-date]");
  if (dateInput && !dateInput.value) dateInput.value = "1995-08-15";

  root.querySelector("[data-run]")?.addEventListener("click", () => {
    const err = root.querySelector("[data-error]");
    err.hidden = true;
    try {
      const result = ankJyotish(dateInput.value, root.querySelector("[data-name]")?.value || "");
      const panel = root.querySelector("[data-result]");
      panel.hidden = false;
      panel.innerHTML = `
        <div class="result-head"><h3>Your numbers</h3>
          <span class="badge ${result.harmonious ? "" : "badge-neutral"}">${result.harmonious ? "Moolank and Bhagyank are friendly" : "Moolank and Bhagyank are not a friendly pair"}</span></div>
        <div class="readout">
          <div><span>Moolank (ruling number)</span><strong>${result.moolank}</strong></div>
          <div><span>Ruled by</span><strong>${result.moolankGraha.graha}</strong></div>
          <div><span>Bhagyank (destiny number)</span><strong>${result.bhagyank}</strong></div>
          <div><span>Ruled by</span><strong>${result.bhagyankGraha.graha}</strong></div>
          ${result.namank ? `<div><span>Namank (name number)</span><strong>${result.namank}</strong></div>
          <div><span>Name total</span><strong>${result.nameTotal}</strong></div>` : ""}
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Number</th><th>Graha</th><th>Day</th><th>Colour</th><th>Stone</th><th>Theme</th></tr></thead>
          <tbody>
            <tr><td>Moolank ${result.moolank}</td><td>${result.moolankGraha.graha}</td><td>${result.moolankGraha.day}</td><td>${result.moolankGraha.colour}</td><td>${result.moolankGraha.gem}</td><td>${result.moolankGraha.theme}</td></tr>
            <tr><td>Bhagyank ${result.bhagyank}</td><td>${result.bhagyankGraha.graha}</td><td>${result.bhagyankGraha.day}</td><td>${result.bhagyankGraha.colour}</td><td>${result.bhagyankGraha.gem}</td><td>${result.bhagyankGraha.theme}</td></tr>
            ${result.namank ? `<tr><td>Namank ${result.namank}</td><td>${result.namankGraha.graha}</td><td>${result.namankGraha.day}</td><td>${result.namankGraha.colour}</td><td>${result.namankGraha.gem}</td><td>${result.namankGraha.theme}</td></tr>` : ""}
          </tbody></table></div>
        <p class="small muted">Working: the birth day reduces to ${result.moolank}. The full date digits add to ${result.dateSum}, which reduces to ${result.bhagyank}. Friendly numbers for Moolank ${result.moolank} are ${result.friendly.join(", ")}.</p>`;
    } catch (e) {
      err.textContent = e.message || String(e);
      err.hidden = false;
    }
  });
}

