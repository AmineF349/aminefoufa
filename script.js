/* Personnalisation rapide */
const CONFIG = {
  toName: "Shana",
  fromName: "Ton mari",
  letter: [
    "Je choisis encore toi, sans hésiter.",
    "Ce soir, je veux te prendre par la main, ralentir, et te rappeler à quel point tu comptes.",
    "Si tu dis oui : on se fait notre Saint-Valentin, à notre façon."
  ].join("\n\n"),
  yesSubtitle: "Décision validée. On passe au plan.",
  noHints: [
    "Erreur de saisie probable.",
    "Relecture conseillée.",
    "Dernière chance avant exécution du plan quand même."
  ],
};

const els = {
  subtitle: document.getElementById("subtitle"),
  note: document.getElementById("note"),
  yesBtn: document.getElementById("yesBtn"),
  noBtn: document.getElementById("noBtn"),
  cta: document.getElementById("cta"),
  reveal: document.getElementById("reveal"),
  letterBody: document.getElementById("letterBody"),
  copyBtn: document.getElementById("copyBtn"),
  replayBtn: document.getElementById("replayBtn"),
  footRight: document.getElementById("footRight"),
  hearts: document.getElementById("hearts"),
  burst: document.getElementById("burst"),
};

let noCount = 0;

init();

function init(){
  document.title = `${CONFIG.toName}, veux-tu être ma Valentine ?`;
  els.footRight.textContent = `© ${new Date().getFullYear()}`;

  // Inject the letter
  els.letterBody.textContent = `${CONFIG.toName},\n\n${CONFIG.letter}\n\n— ${CONFIG.fromName}`;

  // Floating hearts background
  spawnFloatingHearts(28);

  // Buttons
  els.yesBtn.addEventListener("click", onYes);
  els.noBtn.addEventListener("mouseenter", onNoHover);
  els.noBtn.addEventListener("click", onNoClick);

  // Utilities
  els.copyBtn.addEventListener("click", copyLetter);
  els.replayBtn.addEventListener("click", replay);
}

function spawnFloatingHearts(n){
  const w = window.innerWidth;
  const h = window.innerHeight;

  els.hearts.innerHTML = "";
  for(let i=0;i<n;i++){
    const heart = document.createElement("div");
    heart.className = "heart";

    const left = rand(0, w);
    const delay = rand(0, 8);
    const dur = rand(10, 20);
    const size = rand(10, 22);
    const drift = rand(-40, 40);

    heart.style.left = `${left}px`;
    heart.style.top = `${rand(0, h)}px`;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.animationDuration = `${dur}s`;
    heart.style.opacity = `${rand(0.12, 0.28)}`;
    heart.style.filter = `hue-rotate(${rand(-10, 10)}deg)`;

    // add gentle horizontal drift using CSS translate via custom property
    heart.style.setProperty("--drift", `${drift}px`);
    // Not used in keyframes directly; simulate by nudging left a bit every few hearts
    heart.style.marginLeft = `${drift}px`;

    els.hearts.appendChild(heart);
  }
}

function onYes(){
  els.note.textContent = "";
  els.subtitle.textContent = CONFIG.yesSubtitle;

  els.cta.querySelectorAll("button").forEach(b => b.disabled = true);

  // Reveal letter
  els.reveal.hidden = false;

  // Burst
  const rect = els.yesBtn.getBoundingClientRect();
  burstAt(rect.left + rect.width/2, rect.top + rect.height/2, 34);

  // Micro animation
  els.yesBtn.style.transform = "translateY(-1px) scale(1.02)";
  setTimeout(() => els.yesBtn.style.transform = "", 280);
}

function onNoHover(){
  // Keep it tasteful: small evasive move, not impossible.
  if (isMobile()) return;

  const btn = els.noBtn;
  const card = btn.closest(".card");
  const cardRect = card.getBoundingClientRect();

  const pad = 18;
  const maxX = cardRect.width - btn.offsetWidth - pad * 2;
  const maxY = 120;

  const x = rand(pad, pad + Math.max(0, maxX));
  const y = rand(0, maxY);

  btn.style.position = "relative";
  btn.style.left = `${x - (btn.offsetLeft || 0)}px`;
  btn.style.top  = `${y - (btn.offsetTop || 0)}px`;
}

function onNoClick(){
  noCount += 1;

  const hint = CONFIG.noHints[Math.min(noCount - 1, CONFIG.noHints.length - 1)];
  els.note.textContent = hint;

  // small shake
  els.noBtn.animate(
    [
      { transform: "translateX(0px)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0px)" },
    ],
    { duration: 320, easing: "ease-out" }
  );

  // After a few "no", make "yes" visually more obvious
  if(noCount >= 2){
    els.yesBtn.style.boxShadow = "0 26px 70px rgba(255,59,122,.36)";
  }
  if(noCount >= 3){
    els.subtitle.textContent = "Je reformule : tu me rends heureux. On officialise ?";
  }
}

function burstAt(x, y, count){
  els.burst.innerHTML = "";

  for(let i=0;i<count;i++){
    const p = document.createElement("div");
    p.className = "particle";

    const angle = rand(0, Math.PI * 2);
    const dist = rand(40, 220);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    const size = rand(8, 14);
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;

    const delay = rand(0, 90);

    els.burst.appendChild(p);

    p.animate(
      [
        { transform: "translate(-50%, -50%) rotate(45deg) scale(.9)", opacity: 0 },
        { transform: "translate(-50%, -50%) rotate(45deg) scale(1.0)", opacity: 1, offset: 0.12 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(45deg) scale(.9)`, opacity: 0 }
      ],
      { duration: rand(900, 1300), delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
    );
  }
}

async function copyLetter(){
  const text = els.letterBody.textContent;
  try{
    await navigator.clipboard.writeText(text);
    els.note.textContent = "Message copié.";
  }catch{
    els.note.textContent = "Copie impossible. Sélectionne et copie manuellement.";
  }
}

function replay(){
  noCount = 0;
  els.cta.querySelectorAll("button").forEach(b => {
    b.disabled = false;
    b.style.left = "";
    b.style.top = "";
  });

  els.reveal.hidden = true;
  els.subtitle.textContent = "J’ai un petit plan pour nous. Une seule question avant.";
  els.note.textContent = "";

  spawnFloatingHearts(28);
}

function rand(min, max){
  return Math.random() * (max - min) + min;
}

function isMobile(){
  return matchMedia("(max-width: 520px)").matches || /Mobi|Android/i.test(navigator.userAgent);
}

window.addEventListener("resize", () => spawnFloatingHearts(28));
