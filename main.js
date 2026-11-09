(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Vídeo del inicio: horizontal en pantallas anchas, vertical en móvil
  const hv = document.getElementById("hero-video");
  if (hv) {
    const tall = window.matchMedia("(max-aspect-ratio: 4/5)").matches;
    hv.src = tall ? hv.dataset.tall : hv.dataset.wide;
    if (reduce) hv.removeAttribute("autoplay");
  }

  // Titular: cada palabra golpea la página (temblor + destello rojo)
  const main = document.getElementById("main");
  const flash = document.querySelector(".hit-flash");
  if (!reduce) {
    document.querySelectorAll(".slam").forEach(w => {
      w.addEventListener("animationend", e => {
        if (e.animationName !== "slam") return;
        main.classList.remove("is-shaking"); void main.offsetWidth; main.classList.add("is-shaking");
        if (flash) { flash.classList.remove("is-on"); void flash.offsetWidth; flash.classList.add("is-on"); }
      });
    });
    main.addEventListener("animationend", e => { if (e.animationName === "shake") main.classList.remove("is-shaking"); });
  }
  // Apertura: viernes 20 nov 2026, 10 PM a 3:30 AM, hora de Sydney (AEDT, UTC+11)
  const START = Date.parse("2026-11-20T22:00:00+11:00");
  const END = Date.parse("2026-11-21T03:30:00+11:00");

  const cd = document.getElementById("countdown");
  const live = document.getElementById("countdown-live");
  const el = k => cd && cd.querySelector(`[data-cd="${k}"]`);
  const parts = { d: el("d"), h: el("h"), m: el("m"), s: el("s") };
  const pad = n => String(n).padStart(2, "0");

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
    parts.d.textContent = pad(d); parts.h.textContent = pad(h);
    parts.m.textContent = pad(m); parts.s.textContent = pad(s);
    setTimeout(tick, 1000 - (now % 1000));
  }
  tick();

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
