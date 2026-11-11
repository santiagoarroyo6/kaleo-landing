// Botones "Get Ticket": abren el pago de Humanitix en una ventana dentro de la web.
// Sin JS (o si el navegador no tiene <dialog>) el enlace lleva directo a la pantalla de entradas.
(() => {
  const dlg = document.getElementById("checkout");
  if (!dlg || typeof dlg.showModal !== "function") return;
  const body = dlg.querySelector(".checkout__body");
  let frame = null;

  const open = href => {
    if (!frame) {
      const u = new URL(href);
      u.searchParams.set("w", "true"); // modo widget: solo entradas y pago, sin la página del evento
      frame = document.createElement("iframe");
      frame.src = u.toString();
      frame.title = "KALEO tickets";
      frame.allow = "payment";
      frame.addEventListener("load", () => dlg.classList.add("is-loaded"), { once: true });
      body.appendChild(frame);
    }
    dlg.showModal();
    document.documentElement.classList.add("checkout-open");
  };

  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-checkout]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    open(a.href);
  });

  dlg.querySelector(".checkout__close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); }); // tocar fuera cierra
  dlg.addEventListener("close", () => document.documentElement.classList.remove("checkout-open"));
})();
