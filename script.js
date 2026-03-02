// ---------- helpers ----------
function norm(str){
  return (str || "")
    .trim()
    .toLowerCase()
    .replace(/[“”"]/g, '"')
    .replace(/[.!?]+$/g, "")     // allow punctuation at end
    .replace(/\s+/g, " ");
}
function rand(min,max){ return Math.random()*(max-min)+min; }
function dist(ax,ay,bx,by){ const dx=ax-bx, dy=ay-by; return Math.sqrt(dx*dx+dy*dy); }

// ---------- elements ----------
const gate = document.getElementById("gate");
const closedMap = document.getElementById("closedMap");
const gateError = document.getElementById("gateError");
const gateSparks = document.getElementById("gateSparks");
const gateBlackout = document.getElementById("gateBlackout");

const map = document.getElementById("map");
const inkMap = document.getElementById("inkMap");

const spellInput = document.getElementById("spellInput");
const castBtn = document.getElementById("castBtn");

const trailLayer = document.getElementById("trailLayer");
const sparkLayer = document.getElementById("sparkLayer");
const spellLayer = document.getElementById("spellLayer");

const bgAudio = document.getElementById("bgAudio");
const toggleAudio = document.getElementById("toggleAudio");

const manageBtn = document.getElementById("manageBtn");

// ---------- settings ----------
const SPELL = norm("Lumos Veritas");

// ---------- gate sparks ----------
function burstSparks(x,y,count=18){
  for(let i=0;i<count;i++){
    const s=document.createElement("div");
    s.className="spark";
    s.style.left=`${x}px`;
    s.style.top=`${y}px`;
    s.style.setProperty("--dx", `${Math.round(rand(-120,120))}px`);
    s.style.setProperty("--dy", `${Math.round(rand(-120,120))}px`);
    gateSparks.appendChild(s);
    setTimeout(()=>s.remove(), 950);
  }
}

function wrongSpellReset(){
  // dark flash, then reset smoothly
  gateBlackout.classList.add("on");
  setTimeout(()=> {
    gateBlackout.classList.remove("on");
    gateError.textContent = "The parchment remains silent.";
    spellInput.value = "";
    spellInput.focus();
  }, 520);
}

async function tryPlayAudio(){
  // audio only after user gesture; ignore failures
  try { await bgAudio.play(); } catch(e) {}
}

function openMapCinematic(){
  const rect = castBtn.getBoundingClientRect();
  burstSparks(rect.left + rect.width/2, rect.top + rect.height/2, 28);

  gateError.textContent = "";
  closedMap.classList.add("fold");

  setTimeout(()=> {
    gate.style.transition = "opacity 700ms ease";
    gate.style.opacity = "0";
  }, 220);

  setTimeout(()=> {
    gate.setAttribute("aria-hidden","true");
    gate.style.display="none";

    map.setAttribute("aria-hidden","false");
    map.classList.add("open");

    // start audio (if file exists + allowed)
    tryPlayAudio();

    // reveal ink like movie
    setTimeout(()=> {
      map.classList.add("reveal");
      inkMap.style.opacity = "1";
    }, 240);
  }, 900);
}

function tryCast(){
  const typed = norm(spellInput.value);
  if (typed === SPELL){
    openMapCinematic();
  } else {
    const r = spellInput.getBoundingClientRect();
    burstSparks(r.left + r.width/2, r.top + r.height/2, 10);
    wrongSpellReset();
  }
}

castBtn.addEventListener("click", tryCast);
spellInput.addEventListener("keydown", (e)=> { if(e.key==="Enter") tryCast(); });

// ---------- date line ----------
document.getElementById("dateLine").textContent =
  `Made in Ramadan • ${new Date().toLocaleDateString()}`;

// ---------- audio toggle ----------
let audioOn = true;
toggleAudio.addEventListener("click", async () => {
  if (!audioOn){
    audioOn = true;
    toggleAudio.textContent = "🔊 Sound";
    await tryPlayAudio();
  } else {
    audioOn = false;
    toggleAudio.textContent = "🔇 Sound";
    bgAudio.pause();
  }
});

// ---------- scroll to letter ----------
document.getElementById("openLetter").addEventListener("click", ()=>{
  document.getElementById("letter").scrollIntoView({behavior:"smooth"});
});

// ---------- cursor trail (footsteps + names) ----------
function footprintSVG(){
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

let last = {x:0,y:0,t:0};
let step = 0;
const labelText = "Malak ✦ Oussama";

function spawnStep(x,y,angleDeg){
  const el=document.createElement("div");
  el.className="step";
  const side = (step % 2 === 0) ? -10 : 10;
  el.style.left = `${x + side}px`;
  el.style.top  = `${y}px`;
  el.style.setProperty("--rot", `${angleDeg}deg`);
  el.style.transform = `rotate(${angleDeg}deg)`;
  el.innerHTML = `${footprintSVG()}<div class="label">${labelText}</div>`;
  trailLayer.appendChild(el);
  setTimeout(()=> el.remove(), 2500);
}

function handleMove(x,y,now){
  if (map.getAttribute("aria-hidden")==="true") return;
  if (now - last.t < 55 && dist(x,y,last.x,last.y) < 24) return;

  const dx = x - last.x;
  const dy = y - last.y;
  const d = Math.max(1, dist(x,y,last.x,last.y));
  const angle = Math.atan2(dy,dx) * (180/Math.PI) + 90;

  const back = 18;
  const bx = x - (dx/d)*back;
  const by = y - (dy/d)*back;

  spawnStep(bx,by,angle);
  step++;
  last = {x,y,t:now};
}

window.addEventListener("mousemove",(e)=> handleMove(e.clientX, e.clientY, performance.now()));
window.addEventListener("touchmove",(e)=>{
  const t=e.touches[0]; if(!t) return;
  handleMove(t.clientX, t.clientY, performance.now());
},{passive:true});

// ---------- wand sparkle trail ----------
function spawnWandSpark(x,y){
  const s=document.createElement("div");
  s.className="wspark";
  s.style.left=`${x}px`;
  s.style.top=`${y}px`;
  s.style.setProperty("--dx", `${Math.round(rand(-18,18))}px`);
  s.style.setProperty("--dy", `${Math.round(rand(-18,18))}px`);
  sparkLayer.appendChild(s);
  setTimeout(()=>s.remove(), 700);
}
window.addEventListener("mousemove",(e)=>{
  if (map.getAttribute("aria-hidden")==="true") return;
  if (Math.random() < 0.33) spawnWandSpark(e.clientX, e.clientY);
});

// ---------- house spell bursts ----------
function castSpellAt(x,y,word){
  const burst=document.createElement("div");
  burst.className="spell-burst";
  burst.style.left=`${x}px`;
  burst.style.top=`${y}px`;
  burst.innerHTML = `<div class="spell-word">${word}</div><div class="spell-ring"></div>`;
  spellLayer.appendChild(burst);
  setTimeout(()=>burst.remove(), 1200);
  for(let i=0;i<10;i++) spawnWandSpark(x+rand(-10,10), y+rand(-10,10));
}
document.querySelectorAll(".house").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const r=btn.getBoundingClientRect();
    castSpellAt(r.left+r.width/2, r.top+r.height/2, btn.dataset.spell || "Lumos");
  });
});

// ---------- slideshow ----------
const slidesEl = document.querySelector(".slides");
const slideEls = Array.from(document.querySelectorAll(".slide"));
const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");
const dotsEl  = document.getElementById("dots");
const popEl   = document.getElementById("pop");

let idx = 0;
let autoTimer = null;

function renderDots(){
  dotsEl.innerHTML = "";
  slideEls.forEach((_,i)=>{
    const d=document.createElement("div");
    d.className = "dot" + (i===idx ? " on" : "");
    dotsEl.appendChild(d);
  });
}
function goTo(i){
  idx = (i + slideEls.length) % slideEls.length;
  slidesEl.style.transform = `translateX(${-idx * 100}%)`;
  renderDots();
}
function startAuto(){
  stopAuto();
  autoTimer = setInterval(()=> goTo(idx+1), 4200);
}
function stopAuto(){
  if(autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}
prevBtn.addEventListener("click", ()=> { goTo(idx-1); startAuto(); });
nextBtn.addEventListener("click", ()=> { goTo(idx+1); startAuto(); });

slideEls.forEach((slide)=>{
  slide.addEventListener("mouseenter", ()=>{
    const msg = slide.dataset.pop || "";
    popEl.textContent = msg;
    popEl.classList.remove("show");
    void popEl.offsetWidth; // restart animation
    popEl.classList.add("show");
  });
});

goTo(0);
startAuto();

// ---------- envelope letter modal ----------
const letterModal = document.getElementById("letterModal");
const letterClose = document.getElementById("letterClose");
const envelope = document.getElementById("envelope");
const paperTitle = document.getElementById("paperTitle");
const paperBody = document.getElementById("paperBody");

const letterContent = {
  angry: {
    title: "mli tkoun m3eseb",
    body: `I know mli kat3eseb it's only because of how much you care !
hanta ghmed 3inik relax your shoulders, reje3 3en9ek lour, rtah ou dir fbalk bli koun knti hdaya koun 3n9tek.
ps. tghoubicha makatjich m3ak 3winatk zwinin mli kadhek !!`
  },
  anx: {
    title: "mli tkoun mn9ele9",
    body: `If we disagree on something , know bli i still choose you!
don't let one moment earse everything else 3afak...
I will do my best to stick by your side and build even more in the future insha'Allah`
  },
  tired: {
    title: "mli tkoun 3yaan",
    body: `3rfti , you don't have to hold it all lwe9t kamel, rtah! tahaja maghathreb.. li lik lik.
You're doing so great Masha'Allah 3lik ou Allah ywef9ek f li jay ! Fighting..
ps. Dir wahd 5 minutes breathing ghmed 3inik ou tnefes b chwiya , dir relaunch , you need iiiit ..`
  },
  happy: {
    title: "mli tkoun frhan",
    body: `Waaaaa ziin!
إذا ضحِكتَ، أزهرتِ الدنيا بأسرِها
وكأنَّ الفرحَ خُلِقَ على صورتِك
يا بهجةَ الأيامِ إن أقبلتَ،
ويا سِرَّ النورِ إن استيقظَ في عينيك
فابقَ سعيدًا…
فإنَّ سُرورَكَ عيدٌ لقلبي..`
  },
  miss: {
    title: "mli twehechni",
    body: `Hta Ana twehechtek. twehecht rihtek..
ou feeling your shoulder next to mine..
ntla9aw?`
  },
  nomore: {
    title: "mli matb9ach katbghini",
    body: `Chtk bhala hliti hadi ???? -.-`
  }
};

function openLetter(key){
  const L = letterContent[key];
  if(!L) return;

  paperTitle.textContent = L.title;
  paperBody.textContent = L.body;

  letterModal.setAttribute("aria-hidden","false");
  envelope.classList.remove("open");
  // small delay so CSS transitions trigger nicely
  setTimeout(()=> envelope.classList.add("open"), 40);
}

function closeLetter(){
  envelope.classList.remove("open");
  setTimeout(()=> {
    letterModal.setAttribute("aria-hidden","true");
  }, 260);
}

document.querySelectorAll(".cap").forEach(btn=>{
  btn.addEventListener("click", ()=> openLetter(btn.dataset.key));
});

letterClose.addEventListener("click", closeLetter);
letterModal.addEventListener("click", (e)=>{
  if(e.target === letterModal) closeLetter();
});

// ---------- Mischief Managed (fold shut + back to gate) ----------
manageBtn.addEventListener("click", ()=>{
  const r=manageBtn.getBoundingClientRect();
  castSpellAt(r.left + r.width/2, r.top, "Mischief Managed");

  map.classList.add("closing");
  setTimeout(()=>{
    // stop audio
    bgAudio.pause();

    map.setAttribute("aria-hidden","true");
    map.classList.remove("open","reveal","closing");

    gate.style.display="flex";
    gate.style.opacity="1";
    gate.setAttribute("aria-hidden","false");

    spellInput.value="";
    gateError.textContent="";
    closedMap.classList.remove("fold");
  }, 950);
});
