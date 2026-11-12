// KALEO · origen de la venta: si la persona llegó desde un SMS (?s=sms), los botones de
// entradas llevan el código SMS de Humanitix; si no, el código WEB. Se recuerda 7 días en ese móvil.
// checkout.js abre ese mismo enlace dentro de la web, así que el código viaja al pago.
(() => {
  const KEY = "kaleoSrc", DAYS = 7;
  let src = null;
  try {
    const s = (new URLSearchParams(location.search).get("s") || "").toLowerCase();
    if (s.startsWith("sms")) localStorage.setItem(KEY, JSON.stringify({ s: "sms", t: Date.now() }));
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && Date.now() - saved.t < DAYS * 864e5) src = saved.s;
  } catch (e) {}
  if (src !== "sms") return;
  document.querySelectorAll("a[data-ticket]").forEach(a => {
    const u = new URL(a.href); u.searchParams.set("accesscode", "SMS"); a.href = u.toString();
  });
})();
