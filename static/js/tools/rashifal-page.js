import { dailyRashifal, weeklyRashifal } from "../vedic/rashifal.js";
import { RASHIS } from "../vedic/rashi.js";

export function initRashifal(rootSelector = "#rashifal", fixedRashi = null) {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const pills = root.querySelector("[data-pills]");
  let active = fixedRashi || root.dataset.rashi || "mesha";
  let mode = "daily";

  if (pills) {
    RASHIS.forEach((r) => {
      const b = document.createElement("button");
      b.className = "pill" + (r.key === active ? " is-active" : "");
      b.type = "button";
      b.textContent = `${r.symbol} ${r.name}`;
      b.addEventListener("click", () => {
        active = r.key;
        pills.querySelectorAll(".pill").forEach((p) => p.classList.remove("is-active"));
        b.classList.add("is-active");
        draw();
      });
      pills.appendChild(b);
    });
  }

  root.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
      draw();
    });
  });

  function stars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  function draw() {
    const body = root.querySelector("[data-body]");
    try {
      if (mode === "weekly") {
        const week = weeklyRashifal(active, new Date());
        body.innerHTML = `
          <h2>${week.rashi.name} — week ahead</h2>
          <p class="small muted">Best day: ${week.best.date.toDateString()} · slowest day: ${week.worst.date.toDateString()}</p>
          ${week.days.map((d) => `
            <div class="card" style="margin-bottom:.7rem">
              <h3 style="margin-top:0">${d.date.toDateString()} <span class="muted small">${stars(d.rating.stars)} ${d.rating.label}</span></h3>
              <p style="margin-bottom:.4rem">${d.sections.general}</p>
              <p class="small muted" style="margin-bottom:0">Work: ${d.sections.career} &nbsp;·&nbsp; Relationships: ${d.sections.love}</p>
            </div>`).join("")}`;
        return;
      }

      const r = dailyRashifal(active, new Date());
      body.innerHTML = `
        <div class="result-head">
          <h2 style="margin:0">${r.rashi.symbol} ${r.rashi.name} — ${r.date.toDateString()}</h2>
          <span class="badge ${r.rating.stars >= 3 ? "" : "badge-warn"}">${stars(r.rating.stars)} ${r.rating.label}</span>
        </div>
        <p>${r.sections.general}</p>
        <div class="grid-2 grid">
          <div class="card"><h3>Work and money</h3><p>${r.sections.career}</p></div>
          <div class="card"><h3>Relationships</h3><p>${r.sections.love}</p></div>
          <div class="card"><h3>Health</h3><p>${r.sections.health}</p></div>
          <div class="card"><h3>Longer background</h3><p>${r.sections.background}</p></div>
        </div>
        <div class="readout" style="margin-top:1rem">
          <div><span>Moon from your rashi</span><strong>House ${r.houses.moon}</strong></div>
          <div><span>Sun from your rashi</span><strong>House ${r.houses.sun}</strong></div>
          <div><span>Colour</span><strong>${r.lucky.colour}</strong></div>
          <div><span>Number</span><strong>${r.lucky.number}</strong></div>
          <div><span>Direction</span><strong>${r.lucky.direction}</strong></div>
          <div><span>Tithi</span><strong>${r.panchang.tithi.paksha} ${r.panchang.tithi.nameInPaksha}</strong></div>
        </div>`;
    } catch (e) {
      body.innerHTML = `<div class="error-msg">${e.message || e}</div>`;
    }
  }

  draw();
}
