// KALEO · origen de la venta: si la persona llegó desde un SMS (?s=sms), los botones de
// entradas llevan el código SMS de Humanitix; si no, el código WEB. Se recuerda 7 días en ese móvil.
(() => {
  const BASE = "https://events.humanitix.com/kaleo-wolrdwide-latin-party-every-friday-reggaeton-and-latin-hits-town-hall?accesscode=";
  const KEY = "kaleoSrc", DAYS = 7;
  let src = null;
  try {
    const s = (new URLSearchParams(location.search).get("s") || "").toLowerCase();
    if (s.startsWith("sms")) localStorage.setItem(KEY, JSON.stringify({ s: "sms", t: Date.now() }));
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && Date.now() - saved.t < DAYS * 864e5) src = saved.s;
  } catch (e) {}
  if (src !== "sms") return;
  document.querySelectorAll("a[data-ticket]").forEach(a => { a.href = BASE + "SMS"; });
})();
