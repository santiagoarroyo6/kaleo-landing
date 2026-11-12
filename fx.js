// KALEO · efectos (9 nov 2026): humo rojo en WebGL que reacciona al dedo/ratón,
// scroll de cine en el manifiesto y neón del 20.11. Todo se apaga con "reducir movimiento".
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  /* ---------------- 1. Humo rojo en WebGL ---------------- */
  function smoke(host) {
    if (!host || reduce) return;
    const canvas = document.createElement("canvas");
    canvas.className = "smoke";
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    const vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
    const fs = `
precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform float hit; uniform float act;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);
  for(int i=0;i<${coarse ? 3 : 4};i++){v+=a*n(p);p=R*p*2.03;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r; float asp=r.x/r.y;
  vec2 p=vec2(uv.x*asp,uv.y)*2.4;
  vec2 mp=vec2(m.x*asp,m.y)*2.4; vec2 d=p-mp; float md=exp(-dot(d,d)*1.6)*act;
  p+=normalize(d+1e-4)*md*.55;                       // el humo se aparta del dedo
  vec2 q=vec2(fbm(p+vec2(0.,t*.06)),fbm(p+vec2(5.2,1.3)-t*.05));
  vec2 w=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+t*.03),fbm(p+3.5*q+vec2(8.3,2.8)-t*.04));
  float f=fbm(p+3.*w+vec2(0.,-t*.09));
  float body=smoothstep(.35,.95,f);
  float low=mix(1.,.45,smoothstep(.0,.9,uv.y));      // más humo abajo
  vec3 deep=vec3(.22,.05,.01), red=vec3(.66,.18,.03), hot=vec3(.95,.42,.14);
  vec3 col=mix(deep,red,body); col=mix(col,hot,smoothstep(.75,1.,f)*.6);
  float a=body*low*.75;
  col+=hot*md*.55; a+=md*.35;                        // foco donde tocas
  a*=1.+hit*.9; col*=1.+hit*.6;                      // pulso con cada golpe del titular
  gl_FragColor=vec4(col*a,a);
}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return;
    const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = k => gl.getUniformLocation(pr, k);
    const uR = U("r"), uT = U("t"), uM = U("m"), uHit = U("hit"), uAct = U("act");

    host.appendChild(canvas);
    host.classList.add("has-smoke");

    // resolución baja a propósito: el humo es suave y así va fluido en móvil
    const scale = coarse ? .25 : .4;
    const resize = () => {
      const w = Math.max(2, Math.round(host.clientWidth * scale)), h2 = Math.max(2, Math.round(host.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h2) { canvas.width = w; canvas.height = h2; gl.viewport(0, 0, w, h2); }
    };
    resize(); window.addEventListener("resize", resize, { passive: true });

    const target = { x: .5, y: .35, a: 0 }, cur = { x: .5, y: .35, a: 0 };
    const move = (x, y) => { const b = host.getBoundingClientRect(); target.x = (x - b.left) / b.width; target.y = 1 - (y - b.top) / b.height; target.a = 1; };
    window.addEventListener("pointermove", e => move(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
    window.addEventListener("pointerdown", e => { move(e.clientX, e.clientY); hit = Math.max(hit, .6); }, { passive: true });

    let hit = 0;
    window.addEventListener("kaleo:hit", () => { hit = 1; });

    let on = true, raf = 0, last = performance.now(), t = Math.random() * 50;
    const frame = now => {
      raf = 0; if (!on) return;
      if (coarse && now - last < 30) { raf = requestAnimationFrame(frame); return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      cur.x += (target.x - cur.x) * Math.min(1, dt * 5); cur.y += (target.y - cur.y) * Math.min(1, dt * 5);
      target.a = Math.max(0, target.a - dt * .35); cur.a += (target.a - cur.a) * Math.min(1, dt * 4);
      hit = Math.max(0, hit - dt * 3.2);
      gl.uniform2f(uR, canvas.width, canvas.height); gl.uniform1f(uT, t);
      gl.uniform2f(uM, cur.x, cur.y); gl.uniform1f(uHit, hit); gl.uniform1f(uAct, cur.a);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && on) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    // pausa cuando no se ve (batería)
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting && !document.hidden;
      if (on) start(); else { cancelAnimationFrame(raf); raf = 0; }
    }).observe(host);
    document.addEventListener("visibilitychange", () => { on = !document.hidden; if (on) start(); });
    start();
  }
  smoke(document.querySelector(".hero__bg"));

  /* ---------------- 2. Scroll de cine: las palabras vienen hacia ti y te atraviesan ---------------- */
  const cine = document.querySelector(".cine");
  if (cine && !reduce) {
    cine.classList.add("is-on");
    const words = [...cine.querySelectorAll(".cine__word")];
    const glow = cine.querySelector(".cine__glow");
    const flashEl = cine.querySelector(".cine__flash");
    const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const ease = x => 1 - Math.pow(1 - x, 3);
    let ticking = false;
    const update = () => {
      ticking = false;
      const b = cine.getBoundingClientRect(), vh = window.innerHeight;
      const p = clamp(-b.top / (b.height - vh));
      const n = words.length;
      words.forEach((w, i) => {
        const l = clamp((p - i * .28) / .44);           // 0..1 para cada palabra, solapadas
        let s, o;
        if (l < .45) { const k = ease(l / .45); s = .25 + .75 * k; o = clamp(l / .25); }
        else { const k = (l - .45) / .55; s = Math.pow(9, k * k * 1.15); o = 1 - clamp((k - .45) / .45); }
        if (l <= 0) o = 0;
        w.style.transform = `translate3d(-50%,-50%,0) scale(${s.toFixed(4)})`;
        w.style.opacity = o.toFixed(3);
      });
      if (glow) glow.style.opacity = (.35 + .65 * Math.sin(p * Math.PI)).toFixed(3);
      if (flashEl) { const k = clamp((p - .88) / .08); flashEl.style.opacity = (Math.sin(k * Math.PI) * .7).toFixed(3); }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---------------- 3. El 20.11 se enciende como un letrero de neón ---------------- */
  const date = document.querySelector(".night__date");
  if (date) {
    if (reduce || !("IntersectionObserver" in window)) date.classList.add("is-lit");
    else {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { date.classList.add("is-lit"); io.disconnect(); } }, { threshold: .5 });
      io.observe(date);
    }
  }
})();
