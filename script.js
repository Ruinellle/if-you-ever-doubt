// Date line
const dateLine = document.getElementById("dateLine");
dateLine.textContent = `Made in Ramadan • ${new Date().toLocaleDateString()}`;

// Scroll to letter
document.getElementById("openLetter").addEventListener("click", () => {
  document.getElementById("letter").scrollIntoView({ behavior: "smooth" });
});

// Time capsule modal (placeholder texts for now)
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

const letters = {
  angry: { title: "When you’re angry", body: "Add your text here later… 🕯" },
  miss: { title: "When you miss me", body: "Add your text here later… 💙" },
  tired: { title: "When you’re tired", body: "Add your text here later… 🌙" },
  ramadan: { title: "Ramadan", body: "Add your text here later… 🤲" }
};

document.querySelectorAll(".cap").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-open");
    modalTitle.textContent = letters[key].title;
    modalBody.textContent = letters[key].body;
    modal.setAttribute("aria-hidden", "false");
  });
});

closeModal.addEventListener("click", () => {
  modal.setAttribute("aria-hidden", "true");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.setAttribute("aria-hidden", "true");
});

// ----------------------------
// Marauder’s Map Footprints 🐾
// ----------------------------
const layer = document.getElementById("footprintsLayer");

// Simple footprint SVG (ink)
function footprintSVG() {
  return `
  <svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="rgba(43,23,18,.75)" d="M20 6c6 0 10 6 10 14s-4 14-10 14S10 28 10 20 14 6 20 6z"/>
    <circle cx="8" cy="28" r="4" fill="rgba(43,23,18,.65)"/>
    <circle cx="32" cy="28" r="4" fill="rgba(43,23,18,.65)"/>
    <circle cx="12" cy="40" r="3.5" fill="rgba(43,23,18,.55)"/>
    <circle cx="28" cy="40" r="3.5" fill="rgba(43,23,18,.55)"/>
    <circle cx="20" cy="48" r="3.2" fill="rgba(43,23,18,.50)"/>
  </svg>`;
}

// Throttle so we don't spawn too many
let last = { x: 0, y: 0, t: 0 };
let step = 0;

function dist(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx*dx + dy*dy);
}

function spawnFootprint(x, y, angleDeg, isLeft) {
  const fp = document.createElement("div");
  fp.className = `fp ${isLeft ? "left" : "right"} fade`;
  fp.innerHTML = footprintSVG();

  // Offset left/right so it looks like walking
  const side = isLeft ? -8 : 8;

  fp.style.left = `${x + side}px`;
  fp.style.top = `${y}px`;
  fp.style.transform = `rotate(${angleDeg}deg)`;

  layer.appendChild(fp);

  // Remove later
  setTimeout(() => fp.remove(), 2800);
}

window.addEventListener("mousemove", (e) => {
  const now = performance.now();
  const x = e.clientX;
  const y = e.clientY;

  // Only place steps if moved enough + time passed
  if (now - last.t < 40 && dist(x, y, last.x, last.y) < 18) return;

  // Angle based on movement direction
  const dx = x - last.x;
  const dy = y - last.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 to orient footprint

  // Place footprint slightly behind cursor so it "follows"
  const back = 14;
  const bx = x - (dx / (Math.max(1, dist(x, y, last.x, last.y)))) * back;
  const by = y - (dy / (Math.max(1, dist(x, y, last.x, last.y)))) * back;

  // Alternate left/right
  const isLeft = (step % 2 === 0);
  spawnFootprint(bx, by, angle, isLeft);

  step++;
  last = { x, y, t: now };
});

// Mobile touch support
window.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (!t) return;
  const x = t.clientX;
  const y = t.clientY;
  const now = performance.now();

  if (now - last.t < 55 && dist(x, y, last.x, last.y) < 22) return;

  const dx = x - last.x;
  const dy = y - last.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

  const back = 16;
  const d = Math.max(1, dist(x, y, last.x, last.y));
  const bx = x - (dx / d) * back;
  const by = y - (dy / d) * back;

  const isLeft = (step % 2 === 0);
  spawnFootprint(bx, by, angle, isLeft);

  step++;
  last = { x, y, t: now };
}, { passive: true });
