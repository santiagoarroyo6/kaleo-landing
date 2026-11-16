// KALEO · origen de la venta. Cada canal o promotor tiene su enlace a la web:
//   kaleoevent.com.au/?s=sms        -> código SMS en Humanitix
//   kaleoevent.com.au/?s=adsbrasil  -> código ADSBRASIL
// Sin ?s= los botones llevan el código WEB. El origen se recuerda 7 días en ese móvil
// (si llega por otro enlace de seguimiento, gana el último). checkout.js abre ese mismo
// enlace dentro de la web, así que el código viaja hasta el pago.
// Para añadir un promotor: crea el código en Humanitix (Promote > Access codes) y añádelo aquí.
(() => {
  const CODES = {
    sms: "SMS",
    adsbrasil: "ADSBRASIL"
  };
  const KEY = "kaleoSrc", DAYS = 7;
  const pick = s => {
    s = (s || "").toLowerCase();
    if (CODES[s]) return s;
    if (s.startsWith("sms")) return "sms"; // sms1, sms2… cuentan como SMS
    return null;
  };
  let src = null;
  try {
    const fromUrl = pick(new URLSearchParams(location.search).get("s"));
    if (fromUrl) localStorage.setItem(KEY, JSON.stringify({ s: fromUrl, t: Date.now() }));
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && Date.now() - saved.t < DAYS * 864e5) src = pick(saved.s);
  } catch (e) {}
  if (!src) return;
  document.querySelectorAll("a[data-ticket]").forEach(a => {
    const u = new URL(a.href); u.searchParams.set("accesscode", CODES[src]); a.href = u.toString();
  });
})();
