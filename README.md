# KALEO · web de la apertura (vista previa para Tavo)

Web estática de una página para la **Grand Opening del viernes 20 nov 2026**, 10 PM – 3:30 AM,
561 George St (downstairs at Cheers Bar). **Versión 4 (9 nov): estilo discoteca oscuro**, a petición del dueño
("que la gente diga wow, aquí hay fiesta"; referencias: iRock, Home The Venue, Perro Negro). Fondo negro y rojo,
fotos reales de la fiesta teñidas de rojo en el inicio, haces de luz, láseres, humo, destello y ecualizador en CSS,
cintas de texto en movimiento, botón "BIG OPENING" en la barra de arriba. La v3 (crema, estilo flyer) quedó en el
historial de git (commit eef78b6).
**Entradas (11 nov):** los botones Get Ticket abren el pago de Humanitix dentro de la web (ventana con iframe en modo widget `?w=true`, fecha del 20 nov fijada con `dateId=6af3ddf4823547a7dbb0559b`). Código en `site/checkout.js`; sin JS el enlace va directo a `/tickets`. Para otra fecha, cambiar el `dateId` en `index.html` y `faq.html`. Texto público en inglés.

## Estructura
- `site/` es la web: `index.html`, `styles.css`, `main.js`, `assets/` (logos, fotos, vídeos, fuente).
- `Dockerfile` + `nginx.conf`: contenedor nginx listo para EasyPanel (puerto 80).

## Vista previa pública
https://santiagoarroyo6.github.io/kaleo-landing/ (GitHub Pages, rama `gh-pages` = contenido de `site/`).
Para actualizarla: commit en `main` y después `git subtree push --prefix site origin gh-pages`.
Al pasar a dominio propio: cambiar `og:url`, `og:image` y `image` del JSON-LD en `site/index.html`.

## Probar en local
`node serve.cjs site 8765` y abrir http://localhost:8765
(no usar `python -m http.server`: en Windows corta conexiones y algunas imágenes salen vacías)

## Desplegar en EasyPanel
Servicio App → fuente Dockerfile (o subir esta carpeta) → puerto 80 → dominio.

## Antes de hacerla pública
- Quitar `noindex` (meta en `index.html`, `X-Robots-Tag` en `nginx.conf`, `robots.txt`).
- Poner dominio definitivo y añadir `sitemap.xml`, `llms.txt` y URL absoluta en `og:image`.
- Añadir Instagram, contacto y enlace de entradas cuando existan.
- Confirmar con el venue el uso del nombre "Cheers Bar".

## De dónde sale cada asset
- Cabecera: logo lacado `LOGO_KALEO_FINAL/E_LACADO_FISICO/KALEO_LOGO_E_LACADO_ROJO_IMPRESION_6000px.png` (1400 px WebP).
- Pinceladas: `02_HERRAMIENTAS_IA/KALEO_WEB_PINCELADAS_FINAL.py` (gratis). Palmeras en capa: `KALEO_WEB_PALMAS_FINAL.py`.
- Imagen para compartir (oscura, v4): `02_HERRAMIENTAS_IA/KALEO_WEB_OG_OSCURO_FINAL.py`. Humo: `KALEO_WEB_HUMO_FINAL.py`.
- Pinceladas y palmeras (v3) ya no se usan en la página; siguen en `site/assets/img/`.
- El vídeo de fuego de la primera versión se retiró (8 nov): está en `_SALIDAS/KALEO_WEB/RETIRADOS_DE_LA_WEB/`.
- Vídeo y fotos del venue: `KALEO/VIDEO NEW VENUE MATERIAL/video para cortar Kaleo.mp4` (seg. 105–114; fotos en 40, 66, 86, 184 s).
- Fotos de la gente: `KALEO/KALEO FOTOS/SIN_MARCA/` (capturas ~700 px; cambiar por originales en alta).
- Fondos de palmeras: mismo script (gratis, procedural). Gemini no tenía saldo el 6 ni el 8 nov.
- Iconos: generados con Pillow desde el logo C.
- Tipografías: Montserrat y Anton (OFL), en `site/assets/fonts/`.

## Revisión del 8 nov (3 agentes: UX, fondos, textos)
- Orden: cabecera, manifiesto, Family, Venue (vídeo + "How to get there" con mapa), The Night, FAQ, cierre.
- Sin fotos del venue (pedido del dueño). Retiradas a `_SALIDAS/KALEO_WEB/RETIRADOS_DE_LA_WEB/`.
- Textos: solo lo confirmado. Se quitó "every Friday", "bigger room", "full light rig" y el Instagram sin enlace.
- Botones que no son de compra: "Add to calendar" (`site/kaleo-grand-opening.ics`) y "Share on WhatsApp".
- Pinceladas v2 (`KALEO_WEB_PINCELADAS_FINAL.py`), palmeras en capas cercana/lejana/luz (`KALEO_WEB_PALMAS_CAPAS_FINAL.py`), grano de papel, bordes rasgados y destellos en el titular.
- Pendiente del cliente: si es semanal, Instagram, entradas (dónde, cuándo, precio), dress code, DJs, reservas, dominio.

