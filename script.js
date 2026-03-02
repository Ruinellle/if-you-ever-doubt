// ---------- Helpers ----------
function norm(str) {
  return (str || "")
    .trim()
    .toLowerCase()
    .replace(/[“”"]/g, '"')
    .replace(/\s+/g, " ");
}
function rand(min, max) { return Math.random() * (max - min) + min; }
function dist(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx*dx + dy*dy);
}

// ---------- Elements ----------
const gate = document.getElementById("gate");
const closedMap = document.getElementById("closedMap");
const map = document.getElementById("map");
const inkMap = document.getElementById("inkMap");

const spellInput = document.getElementById("spellInput");
const castBtn = document.getElementById("castBtn");
const gateError = document.getElementById("gateError");
const gateSparks = document.getElementById("gateSparks");

const trailLayer = document.getElementById("trailLayer");
const sparkLayer = document.getElementById("sparkLayer");
const spellLayer = document.getElementById("spellLayer");

const manageBtn = document.getElementById("manageBtn");

// ---------- Gate spell ----------
const OATH = norm("I solemnly swear that I am up to no good");

function burstSparks(x, y, count = 18) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "spark";
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty("--dx", `${Math.round(rand(-120, 120))}px`);
    s.style.setProperty("--dy", `${Math.round(rand(-120, 120))}px`);
    gateSparks.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}

function openMapCinematic() {
  const rect = castBtn.getBoundingClientRect();
  burstSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);

  gateError.textContent = "";
  closedMap.classList.add("fold");

  setTimeout(() => {
    gate.style.transition = "opacity 700ms ease";
    gate.style.opacity = "0";
  }, 220);

  setTimeout(() => {
    gate.setAttribute("aria-hidden", "true");
    gate.style.display = "none";

    map.setAttribute("aria-hidden", "false");
    map.classList.add("open");

    // Ink reveal like movie
    setTimeout(() => {
      map.classList.add("reveal");
      inkMap.style.opacity = "1";
    }, 220);
  }, 900);
}

function tryCast() {
  const typed = norm(spellInput.value);
  if (typed === OATH) {
    openMapCinematic();
  } else {
    gateError.textContent = "That didn’t work. Try the exact oath.";
    const r = spellInput.getBoundingClientRect();
    burstSparks(r.left + r.width / 2, r.top + r.height / 2, 10);
  }
}
castBtn.addEventListener("click", tryCast);
spellInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tryCast(); });

// ---------- Date line ----------
document.getElementById("dateLine").textContent =
  `Made in Ramadan • ${new Date().toLocaleDateString()}`;

// ---------- Scroll to letter ----------
document.getElementById("openLetter").addEventListener("click", () => {
  document.getElementById("letter").scrollIntoView({ behavior: "smooth" });
});

// ---------- Modal (placeholder) ----------
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
closeModal.addEventListener("click", () => modal.setAttribute("aria-hidden", "true"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.setAttribute("aria-hidden", "true"); });

// ---------- Footprints + names ----------
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

let last = { x: 0, y: 0, t: 0 };
let step = 0;

// Show BOTH names together (as you asked)
const labelText = "Malak ✦ Oussama";

function spawnStep(x, y, angleDeg) {
  const el = document.createElement("div");
  el.className = "step";

  const side = (step % 2 === 0) ? -10 : 10;
  el.style.left = `${x + side}px`;
  el.style.top = `${y}px`;
  el.style.setProperty("--rot", `${angleDeg}deg`);
  el.style.transform = `rotate(${angleDeg}deg)`;

  el.innerHTML = `${footprintSVG()}<div class="label">${labelText}</div>`;
  trailLayer.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

function handleMove(x, y, now) {
  if (map.getAttribute("aria-hidden") === "true") return;

  // density control
  if (now - last.t < 55 && dist(x, y, last.x, last.y) < 24) return;

  const dx = x - last.x;
  const dy = y - last.y;
  const d = Math.max(1, dist(x, y, last.x, last.y));
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

  const back = 18;
  const bx = x - (dx / d) * back;
  const by = y - (dy / d) * back;

  spawnStep(bx, by, angle);
  step++;
  last = { x, y, t: now };
}

window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY, performance.now()));
window.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (!t) return;
  handleMove(t.clientX, t.clientY, performance.now());
}, { passive: true });

// ---------- Wand sparkle trail ----------
function spawnWandSpark(x, y) {
  const s = document.createElement("div");
  s.className = "wspark";
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  s.style.setProperty("--dx", `${Math.round(rand(-18, 18))}px`);
  s.style.setProperty("--dy", `${Math.round(rand(-18, 18))}px`);
  sparkLayer.appendChild(s);
  setTimeout(() => s.remove(), 720);
}

window.addEventListener("mousemove", (e) => {
  if (map.getAttribute("aria-hidden") === "true") return;
  if (Math.random() < 0.35) spawnWandSpark(e.clientX, e.clientY);
});

// ---------- House spells ----------
function castSpellAt(x, y, word) {
  const burst = document.createElement("div");
  burst.className = "spell-burst";
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  burst.innerHTML = `<div class="spell-word">${word}</div><div class="spell-ring"></div>`;
  spellLayer.appendChild(burst);
  setTimeout(() => burst.remove(), 1200);

  // extra spark shower for drama
  for (let i = 0; i < 10; i++) spawnWandSpark(x + rand(-8, 8), y + rand(-8, 8));
}

document.querySelectorAll(".house").forEach(btn => {
  btn.addEventListener("click", () => {
    const rect = btn.getBoundingClientRect();
    castSpellAt(rect.left + rect.width / 2, rect.top + rect.height / 2, btn.getAttribute("data-spell") || "Lumos");
  });
});

// ---------- Mischief Managed (fold shut + return to gate) ----------
manageBtn.addEventListener("click", () => {
  // Spell word near the button
  const r = manageBtn.getBoundingClientRect();
  castSpellAt(r.left + r.width / 2, r.top, "Mischief Managed");

  // Fold map closed
  map.classList.add("closing");

  setTimeout(() => {
    map.setAttribute("aria-hidden", "true");
    map.classList.remove("open", "reveal", "closing");
    gate.style.display = "flex";
    gate.style.opacity = "1";
    gate.setAttribute("aria-hidden", "false");
    // reset input
    spellInput.value = "";
    gateError.textContent = "";
    closedMap.classList.remove("fold");
  }, 950);
});
