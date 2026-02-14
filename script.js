document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js chargé");

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

  const $ = (id) => document.getElementById(id);

  const els = {
    subtitle: $("subtitle"),
    note: $("note"),
    yesBtn: $("yesBtn"),
    noBtn: $("noBtn"),
    cta: $("cta"),
    reveal: $("reveal"),
    letterBody: $("letterBody"),
    copyBtn: $("copyBtn"),
    replayBtn: $("replayBtn"),
    footRight: $("footRight"),
    hearts: $("hearts"),
    burst: $("burst"),
  };

  // Si un seul élément clé manque, ton ancien script plantait ici.
  if (!els.yesBtn || !els.noBtn || !els.subtitle) {
    console.error("IDs manquants dans index.html :", {
      yesBtn: !!els.yesBtn,
      noBtn: !!els.noBtn,
      subtitle: !!els.subtitle
    });
    return;
  }

  let noCount = 0;

  document.title = `${CONFIG.toName}, veux-tu être ma Valentine ?`;
  if (els.footRight) els.footRight.textContent = `© ${new Date().getFullYear()}`;

  if (els.letterBody) {
    els.letterBody.textContent = `${CONFIG.toName},\n\n${CONFIG.letter}\n\n— ${CONFIG.fromName}`;
  }

  spawnFloatingHearts(28);

  els.yesBtn.addEventListener("click", onYes);
  els.noBtn.addEventListener("mouseenter", onNoHover);
  els.noBtn.addEventListener("click", onNoClick);

  if (els.copyBtn) els.copyBtn.addEventListener("click", copyLetter);
  if (els.replayBtn) els.replayBtn.addEventListener("click", replay);

  window.addEventListener("resize", () => spawnFloatingHearts(28));

  function onYes() {
    if (els.note) els.note.textContent = "";
    els.subtitle.textContent = CONFIG.yesSubtitle;

    if (els.cta) els.cta.querySelectorAll("button").forEach(b => (b.disabled = true));
    if (els.reveal) els.reveal.hidden = false;

    const rect = els.yesBtn.getBoundingClientRect();
    burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 34);
  }

  function onNoHover() {
    if (isMobile()) return;

    const btn = els.noBtn;
    const card = btn.closest(".card");
    if (!card) return;

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

  function onNoClick() {
    noCount += 1;

    if (els.note) {
      const hint = CONFIG.noHints[Math.min(noCount - 1, CONFIG.noHints.length - 1)];
      els.note.textContent = hint;
    }

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

    if (noCount >= 3) {
      els.subtitle.textContent = "Je reformule : tu me rends heureux. On officialise ?";
    }
  }

  async function copyLetter() {
    if (!els.letterBody) return;
    const text = els.letterBody.textContent;
    try {
      await navigator.clipboard.writeText(text);
      if (els.note) els.note.textContent = "Message copié.";
    } catch {
      if (els.note) els.note.textContent = "Copie impossible. Sélectionne et copie manuellement.";
    }
  }

  function replay() {
    noCount = 0;

    if (els.cta) {
      els.cta.querySelectorAll("button").forEach(b => {
        b.disabled = false;
        b.style.left = "";
        b.style.top = "";
      });
    }

    if (els.reveal) els.reveal.hidden = true;
    els.subtitle.textContent = "J’ai un petit plan pour nous. Une seule question avant.";
    if (els.note) els.note.textContent = "";

    spawnFloatingHearts(28);
  }

  function spawnFloatingHearts(n) {
    if (!els.hearts) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    els.hearts.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const heart = document.createElement("div");
      heart.className = "heart";

      const left = rand(0, w);
      const delay = rand(0, 8);
      const dur = rand(10, 20);
      const size = rand(10, 22);

      heart.style.left = `${left}px`;
      heart.style.top = `${rand(0, h)}px`;
      heart.style.width = `${size}px`;
      heart.style.height = `${size}px`;
      heart.style.animationDelay = `${delay}s`;
      heart.style.animationDuration = `${dur}s`;
      heart.style.opacity = `${rand(0.12, 0.28)}`;

      els.hearts.appendChild(heart);
    }
  }

  function burstAt(x, y, count) {
    if (!els.burst) return;
    els.burst.innerHTML = "";

    for (let i = 0; i < count; i++) {
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

      els.burst.appendChild(p);

      p.animate(
        [
          { transform: "translate(-50%, -50%) rotate(45deg) scale(.9)", opacity: 0 },
          { transform: "translate(-50%, -50%) rotate(45deg) scale(1.0)", opacity: 1, offset: 0.12 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(45deg) scale(.9)`, opacity: 0 }
        ],
        { duration: rand(900, 1300), delay: rand(0, 90), easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
      );
    }
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function isMobile() { return matchMedia("(max-width: 520px)").matches; }
});
