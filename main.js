(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const root = document.documentElement;

  // Vídeo del inicio: horizontal en pantallas anchas, vertical en móvil. Aparece con fundido al empezar a sonar.
  const hv = document.getElementById("hero-video");
  if (hv) {
    const tall = window.matchMedia("(max-aspect-ratio: 4/5)").matches;
    hv.addEventListener("playing", () => hv.classList.add("is-playing"), { once: true });
    hv.src = tall ? hv.dataset.tall : hv.dataset.wide;
    if (reduce) { hv.removeAttribute("autoplay"); hv.classList.add("is-playing"); }
  }

  // Arranque: la animación espera a fuentes y logo (máx. 1,5 s) para que no haya saltos
  const logo = document.querySelector(".hero__logo img");
  const ready = Promise.all([
    document.fonts ? document.fonts.ready : null,
    logo && logo.decode ? logo.decode().catch(() => {}) : null
  ]);
  const timeout = new Promise(r => setTimeout(r, 1500));
  Promise.race([ready, timeout]).then(() => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready"))));

  // Titular: cada palabra golpea al llegar (el final de su animación es el impacto)
  const content = document.querySelector(".hero__content");
  const bg = document.querySelector(".hero__bg");
  const flash = document.querySelector(".hit-flash");
  const replay = (node, cls) => { if (!node) return; node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
  if (!reduce) {
    document.querySelectorAll(".slam").forEach(w => {
      w.addEventListener("animationend", e => {
        if (e.animationName !== "slam") return;
        e.stopPropagation();
        w.classList.add("is-done");
        replay(content, "is-hit"); replay(bg, "is-hit"); replay(flash, "is-on");
      });
    });
    [content, bg, flash].forEach(n => n && n.addEventListener("animationend", e => {
      if (e.target !== n) return;
      n.classList.remove("is-hit", "is-on");
    }));
  }

  // Apertura: viernes 20 nov 2026, 10 PM a 3:30 AM, hora de Sydney (AEDT, UTC+11)
  const START = Date.parse("2026-11-20T22:00:00+11:00");
  const END = Date.parse("2026-11-21T03:30:00+11:00");

  const cd = document.getElementById("countdown");
  const live = document.getElementById("countdown-live");
  const el = k => cd && cd.querySelector(`[data-cd="${k}"]`);
  const parts = { d: el("d"), h: el("h"), m: el("m"), s: el("s") };
  const pad = n => String(n).padStart(2, "0");
  // cambia el número con una caída suave solo cuando cambia
  const set = (node, v) => {
    const i = node.firstElementChild || node;
    if (i.textContent === v) return;
    i.textContent = v;
    if (!reduce) { i.classList.remove("is-tick"); void i.offsetWidth; i.classList.add("is-tick"); }
  };

  function tick() {
    if (!cd) return;
    const now = Date.now();
    if (now >= START) {
      cd.hidden = true;
      live.hidden = false;
      live.textContent = now < END ? "We’re live. Get down here." : "Thank you for an amazing Grand Opening.";
      return;
    }
    let t = Math.floor((START - now) / 1000);
    const d = Math.floor(t / 86400); t -= d * 86400;
    const h = Math.floor(t / 3600); t -= h * 3600;
    const m = Math.floor(t / 60); const s = t - m * 60;
    set(parts.d, pad(d)); set(parts.h, pad(h)); set(parts.m, pad(m)); set(parts.s, pad(s));
    setTimeout(tick, 1000 - (now % 1000));
  }
  tick();


  // Barra de entradas: aparece cuando los botones del inicio salen de pantalla
  const tb = document.getElementById("ticketbar");
  const heroActions = document.querySelector(".hero__actions");
  if (tb && heroActions && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => tb.classList.toggle("is-visible", !e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 }).observe(heroActions);
  } else if (tb) { tb.classList.add("is-visible"); }

  // Barra de navegación sólida al hacer scroll
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Aparición suave al entrar en pantalla
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((it, i) => { it.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`; io.observe(it); });
  } else {
    items.forEach(it => it.classList.add("is-in"));
  }

  // Movimiento reducido: vídeos quietos en su póster
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video").forEach(v => { v.removeAttribute("autoplay"); v.pause(); });
  }

  // Vídeos fuera de pantalla en pausa (ahorra batería en móvil)
  if ("IntersectionObserver" in window) {
    const vo = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const v = e.target;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (e.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); } else { v.pause(); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll("video").forEach(v => vo.observe(v));
  }

  // Compartir por WhatsApp: añade la dirección de la página cuando no es local
  const wa = document.getElementById("share-wa");
  if (wa && !/^(localhost|127\.)/.test(location.hostname)) {
    wa.href += encodeURIComponent(" " + location.origin + location.pathname);
  }
})();
