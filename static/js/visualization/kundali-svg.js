/**
 * JyotishVeda — kundali chart rendering.
 *
 * North Indian style: the twelve bhavas are fixed on the diamond; the rashi
 * number moves. South Indian style: the twelve rashis are fixed on the grid;
 * the lagna is marked.
 */

const NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}, text) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Centre points of each of the twelve North Indian houses, on a 400×400 box. */
const NORTH_CENTRES = [
  [200, 90],   // 1
  [105, 45],   // 2
  [50, 100],   // 3
  [105, 200],  // 4
  [50, 300],   // 5
  [105, 355],  // 6
  [200, 305],  // 7
  [295, 355],  // 8
  [350, 300],  // 9
  [295, 200],  // 10
  [350, 100],  // 11
  [295, 45],   // 12
];

export function renderNorthKundali(container, kundali, options = {}) {
  const size = 400;
  container.innerHTML = "";

  const svg = el("svg", {
    class: "kundali-svg",
    viewBox: `0 0 ${size} ${size}`,
    role: "img",
    "aria-label": options.label || "North Indian kundali chart",
  });

  svg.appendChild(el("rect", { x: 2, y: 2, width: size - 4, height: size - 4, class: "house-frame", rx: 6 }));
  svg.appendChild(el("line", { x1: 2, y1: 2, x2: size - 2, y2: size - 2, class: "house-line" }));
  svg.appendChild(el("line", { x1: size - 2, y1: 2, x2: 2, y2: size - 2, class: "house-line" }));
  svg.appendChild(el("polygon", {
    points: `${size / 2},2 ${size - 2},${size / 2} ${size / 2},${size - 2} 2,${size / 2}`,
    class: "house-line",
  }));

  kundali.houses.forEach((house, i) => {
    const [cx, cy] = NORTH_CENTRES[i];
    svg.appendChild(el("text", { x: cx, y: cy - 18, class: "rashi-num", "text-anchor": "middle" },
      `${house.rashi.index + 1}`));

    const names = house.grahas.map((g) => (g.retrograde ? `${g.short}\u1d3f` : g.short));
    names.forEach((n, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      svg.appendChild(el("text", {
        x: cx + (col - 1) * 26,
        y: cy + 2 + row * 14,
        class: "graha-text",
        "text-anchor": "middle",
      }, n));
    });

    if (house.number === 1) {
      svg.appendChild(el("text", { x: cx, y: cy + 34, class: "house-num", "text-anchor": "middle" }, "La"));
    }
  });

  container.appendChild(svg);
  return svg;
}

/** Fixed grid positions for the South Indian chart, rashi 1..12. */
const SOUTH_CELLS = {
  1: [1, 0], 2: [2, 0], 3: [3, 0], 4: [3, 1],
  5: [3, 2], 6: [3, 3], 7: [2, 3], 8: [1, 3],
  9: [0, 3], 10: [0, 2], 11: [0, 1], 12: [0, 0],
};

export function renderSouthKundali(container, kundali) {
  const size = 400;
  const cell = size / 4;
  container.innerHTML = "";

  const svg = el("svg", {
    class: "kundali-svg",
    viewBox: `0 0 ${size} ${size}`,
    role: "img",
    "aria-label": "South Indian kundali chart",
  });

  const byRashi = new Map();
  kundali.houses.forEach((h) => byRashi.set(h.rashi.index + 1, h));

  for (let rashi = 1; rashi <= 12; rashi += 1) {
    const [col, row] = SOUTH_CELLS[rashi];
    const x = col * cell;
    const y = row * cell;
    const house = byRashi.get(rashi);

    svg.appendChild(el("rect", { x, y, width: cell, height: cell, class: "house-frame" }));
    svg.appendChild(el("text", { x: x + 6, y: y + 15, class: "rashi-num" }, String(rashi)));
    if (house && house.number === 1) {
      svg.appendChild(el("text", { x: x + cell - 8, y: y + 15, class: "house-num", "text-anchor": "end" }, "La"));
    }

    if (house) {
      house.grahas.forEach((g, idx) => {
        svg.appendChild(el("text", {
          x: x + 8 + (idx % 2) * 44,
          y: y + 36 + Math.floor(idx / 2) * 16,
          class: "graha-text",
        }, g.retrograde ? `${g.short}\u1d3f` : g.short));
      });
    }
  }

  container.appendChild(svg);
  return svg;
}

