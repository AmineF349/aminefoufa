(() => {
  const root = document.documentElement;

  // ---------- Theme ----------
  const THEME_KEY = "site-theme";
  const themeToggle = document.getElementById("themeToggle");

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    if (themeToggle) themeToggle.setAttribute("aria-label", `Basculer thème (actuel: ${theme})`);
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
    });
  }

  // ---------- Active nav ----------
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length) {
    const ioNav = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      const id = "#" + visible.target.id;
      navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === id));
    }, { rootMargin: "-20% 0px -70% 0px", threshold: [0.08, 0.15, 0.25] });

    sections.forEach(sec => ioNav.observe(sec));
  }

  // ---------- Reveal on scroll ----------
  const revealEls = Array.from(document.querySelectorAll(".card, .panel, .tl-body, .metric, .hero-card"));
  revealEls.forEach(el => el.classList.add("reveal"));

  if (revealEls.length) {
    const ioReveal = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          ioReveal.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => ioReveal.observe(el));
  }

  // ---------- Projects filtering ----------
  const pills = Array.from(document.querySelectorAll(".pill"));
  const search = document.getElementById("projectSearch");
  const emptyState = document.getElementById("emptyState");

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function getActiveFilter() {
    const active = pills.find(p => p.classList.contains("is-active"));
    return active ? active.dataset.filter : "all";
  }

  function applyProjectsFilter() {
    const filter = getActiveFilter();
    const q = normalize(search ? search.value : "");

    const projects = Array.from(document.querySelectorAll(".project"));
    let shown = 0;

    projects.forEach(card => {
      const tags = (card.dataset.tags || "").split(",").map(t => t.trim());
      const h3 = card.querySelector("h3");
      const title = normalize(card.dataset.title || (h3 ? h3.textContent : "") || "");
      const text = normalize(card.textContent || "");

      const matchesFilter = (filter === "all") ? true : tags.includes(filter);
      const matchesSearch = q.length === 0 ? true : (title.includes(q) || text.includes(q));

      const show = matchesFilter && matchesSearch;
      card.hidden = !show;
      if (show) shown += 1;
    });

    if (emptyState) emptyState.hidden = shown !== 0;
  }

  if (pills.length) {
    pills.forEach(p => {
      p.addEventListener("click", () => {
        pills.forEach(x => x.classList.remove("is-active"));
        p.classList.add("is-active");
        applyProjectsFilter();
      });
    });
  }

  if (search) search.addEventListener("input", applyProjectsFilter);
  applyProjectsFilter();

  // ---------- Copy email ----------
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
      const email = copyEmailBtn.dataset.email || "";
      if (!email) return;

      try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.textContent = "Email copié";
        setTimeout(() => (copyEmailBtn.textContent = "Copier email"), 1200);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        copyEmailBtn.textContent = "Email copié";
        setTimeout(() => (copyEmailBtn.textContent = "Copier email"), 1200);
      }
    });
  }

  // ---------- Contact form (mailto) ----------
  const form = document.getElementById("contactForm");
  const hint = document.getElementById("formHint");
  const DEST_EMAIL = "votre.email@domaine.tld";

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const subject = String(fd.get("subject") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !subject || !message) {
        if (hint) hint.textContent = "Champs manquants.";
        return;
      }

      const body = [
        `Nom: ${name}`,
        "",
        message,
        "",
        "--",
        "Envoyé depuis le site"
      ].join("\n");

      const url = `mailto:${encodeURIComponent(DEST_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;

      if (hint) hint.textContent = "Ouverture de ton client email…";
    });
  }

  // ---------- Footer year + back to top ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
})();
