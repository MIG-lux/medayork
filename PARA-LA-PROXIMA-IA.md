# Medayork · contexto para la próxima IA o desarrollador

Lee esto completo antes de editar. El dueño (Miguel) no es técnico: explícale en español sencillo, de tú, y decide tú lo técnico. `LEEME.md` es su manual; mantenlo al día cuando cambies algo que él usa.

## 1. Qué es

Tienda de ropa y tenis **originales** traídos de Nueva York y vendidos en Medellín, parte en stock y parte bajo encargo. La web debe: (1) dar confianza, (2) llevar visitas de Instagram/TikTok a WhatsApp, (3) registrar qué quiere la gente que traigan. No hay carrito ni pasarela: todo pedido termina en WhatsApp o en el formulario de encargo.

Sitio estático (HTML + CSS + JS sin librerías ni paso de compilación) en Cloudflare Pages, conectado a un repositorio de GitHub. Los datos vivos están en una hoja de Google del dueño, servida por un Apps Script.

## 2. Reglas de la marca (no negociables)

**Nunca prometer ni mostrar:**
- En qué tienda u outlet se compró cada prenda.
- Comparaciones con precios de tiendas de Medellín.
- El precio de Nueva York.
- Facturas para cada cliente.
- Envíos fuera de Medellín (hoy no se hacen).

**Siempre:**
- **Sin "entrega inmediata" ni fechas de entrega para lo que está en stock:** la entrega se cuadra por WhatsApp.
- **Un solo precio:** el final, puesto en Medellín. Precio tachado solo si `precio_bf < precio` y `precio` es lo que realmente se cobraba.
- **Nada inventado:** ni precios, tallas, stock, votos, contadores, testimonios, tiempos ni políticas. Lo que falte va como marcador amarillo `<span class="mk">[TEXTO]</span>` y se anota en Pendientes del LEEME.
- **Sin urgencia falsa:** la cuenta regresiva solo apunta a una fecha real de la hoja; nada de "quedan 2" ni "X personas viendo".
- **Un solo verbo de acción: "Pedir"** (variantes: "Pedir encargo", "Pedir en Black Friday", "Pedir por WhatsApp").
- **Datos personales:** todo formulario con nombre o WhatsApp lleva casilla obligatoria de autorización y enlace a `privacidad.html` (Ley 1581 de 2012, Colombia).
- **Texto de usuarios y de la hoja siempre escapado** con `MY.esc()`. Nunca `innerHTML` con texto crudo.
- Datos confirmados por el dueño: encargo 15 a 20 días; abonos 50 % para separar y 50 % al recibir; WhatsApp 573226759950; Instagram y TikTok @meda_yorkshop.

## 3. Dirección de arte: "la ruta" Nueva York ⇄ Medellín

Lenguaje de encomienda y aeropuerto: sello tipo aduana, códigos `MDE ⇄ JFK` / `JFK → MDE`, referencias tipo guía (`Ref. MY-0142`), código de barras, esquina cortada, pase de abordar, tablero split-flap, etiqueta de equipaje. Referencia de estructura: e-commerce tipo "FRZN puffer" (producto como silueta sobre fondo plano, microtextos entre corchetes, tipografía grande). Se toma la sensación, no se copia.

**Colores** (variables en `:root` de `css/estilos.css`; cambiar solo ahí):

| Variable | Valor | Papel |
|---|---|---|
| `--asfalto` | #1C1D1F | Texto, navegación, pie, fondo de Black Friday |
| `--hueso` | #EFECE6 | Fondo general ("papel") |
| `--papel` | #F6F4F0 | Fondo alterno claro |
| `--hudson` / `--hudson-d` | #56636B / #3F4A50 | Acero de NY. Base de Hombre, seguimiento, hype |
| `--niebla` | #A9B4B8 | Fondo de fotos de Hombre |
| `--ladrillo` | #B5573A | Ladrillo de Medellín. Solo sellos, bordes y títulos grandes (contraste 4,06 con hueso) |
| `--ladrillo-btn` / `--ladrillo-h` | #A04A30 / #8C3F28 | Fondo del botón "Pedir" y su hover (contraste 5,06) |
| `--arcilla` / `--arcilla-l` | #E3C2B4 / #EFE3DC | Base de Mujer y fondo de sus fotos. Cálido, nunca rosado |
| `--cafe` | #3A1C12 | Texto sobre arcilla |
| `--marcador` | #FFE45C | Marcadores de dato pendiente y foco de teclado |

Tallas vacías: `MY.textoTallas()` muestra "Pregúntanos" en ropa y "Única" en morrales/gorras/accesorios. Catálogo: 12 por sección y botón "Ver más". Fotos de producto: recorte 4:5 que contiene la prenda completa (relleno repitiendo el borde del fondo). Hombre = Hudson/niebla. Mujer = arcilla/café, mismo sistema con otra temperatura. Black Friday = asfalto con detalles ladrillo y sello doble.

**Letras** (Google Fonts, `display=swap`, cargadas sin bloquear con `media="print" onload`):
- `--disp` Big Shoulders Display 900: títulos, en mayúsculas, interlineado ~0.9 (subir a ~1.05 si el texto tiene tildes y ocupa dos líneas).
- `--mono` IBM Plex Mono 400/500: datos de etiqueta, botones, microtextos. 11 a 13 px, mayúsculas, tracking amplio.
- `--ser` Instrument Serif cursiva: solo "Original style." y frases emocionales cortas.
- `--sans` Inter 400/500: párrafos.

**Microtextos de sección:** lugares reales de Nueva York entre corchetes (`[ SoHo · Nueva York ]`, `[ Brooklyn · Nueva York ]`, `[ Times Square ]`, `[ Terminal 4 · JFK ]`, `[ Quinta Avenida ]`, `[ Grand Central ]`, Black Friday `[ Filadelfia · donde nació el Black Friday ]`). Nada de "Sección 01" ni nombres de colores. La portada no lleva sello encima del video.

**Sello ORIGINAL** (`.sello`): borde ladrillo 2 px, radio 6 px, mono, tracking .18em, rotado −10°, fondo hueso al 94 %. Variante `.sello.bf` (asfalto, borde doble, texto arcilla).

**Movimiento** (poco y con intención; CSS + IntersectionObserver, cero librerías):
- Firma: el sello se estampa (`@keyframes estampar`, 0,55 s, escala 1.45 → 1 con rebote) en la portada y en cada tarjeta al entrar a la vista.
- Tarjetas `.sube`: suben 18 px y aparecen, una sola vez, 0,6 s.
- Portada: video en loop (se pide 1,5 s después del `load`) sobre una foto con zoom lento.
- Carrusel: `scroll-snap` nativo, avance cada 3,5 s que se detiene al tocarlo.
- Seguimiento: letras que giran tipo split-flap (`.celda.gira`).
- **No añadir** parallax, smooth-scroll que secuestre el dedo, ni animaciones de entrada a todo.
- Con `prefers-reduced-motion` todo queda quieto y visible; sin JavaScript (`html.no-js`) nada queda oculto.

**Señales de que se dañó el diseño:** título centrado con subtítulo gris y dos botones; filas de tarjetas con íconos de librería; degradados ajenos a la paleta; esquinas redondeadas grandes; sombras suaves; más de un verbo de acción.

## 4. Estructura del código

```
index.html            tienda (portada, carrusel, Black Friday, Hombre, Mujer, En hype + formulario,
                      cómo funciona, seguimiento, tallas, preguntas, cierre, pie, ficha <dialog>, barra móvil)
seguimiento.html      consulta por código; tablero + línea de tiempo (JS propio al final del archivo)
llegadas.html         marco 9:16 para historias (JS propio al final)
condiciones.html      condiciones de encargo, con marcadores por definir
privacidad.html       política de datos
404.html              "equipaje perdido" (rutas absolutas: Cloudflare la sirve desde cualquier ruta)
css/estilos.css       todo el estilo, con índice numerado arriba; móvil primero, media queries al final
js/datos.js           objeto global MY: carga de datos, Black Friday, precios, WhatsApp, origen, clics, analytics
js/app.js             lógica de index.html (índice numerado arriba)
datos/conexion.js     window.MEDAYORK_CONEXION = { script_url, whatsapp, analytics_token }
datos/respaldo.js     window.MEDAYORK_RESPALDO = { config, votos, muro, productos }  (JSON dentro de un .js)
apps-script/Code.gs   backend en la hoja de Google
herramientas/servidor-prueba.py   servidor local que imita Code.gs en /hoja y sirve /nojs/ sin JavaScript
img/productos/        fotos de producto (800×1000 WebP); el resto de img/ son logo, portada, og, íconos
```

Orden de scripts obligatorio: `conexion.js` → `respaldo.js` → `datos.js` → script de la página. Al cambiar CSS o JS, sube el `?v=` de los enlaces.

**Por qué el respaldo es `.js` y no `.json`:** el dueño abre `index.html` con doble clic (`file://`) y ahí `fetch` de un JSON local falla. No lo conviertas a `.json`.

## 5. Cómo viajan los datos

1. `MY.cargar(pintar)` pinta de inmediato con `MEDAYORK_RESPALDO` (o con la última copia de la hoja guardada en `localStorage` bajo `my-datos`).
2. Si hay `script_url`, pide `GET script_url?datos=1` y, si la respuesta es válida y distinta, vuelve a pintar y la guarda. Si falla, se queda lo anterior.
3. Forma de los datos: `{ config: { whatsapp, instagram, tiktok, frase_portada, tiempo_encargo, black_friday: { activo, inicio, fin } }, productos: [...], votos: { "MY-0304": 2 }, muro: [{ nombre, producto }] }`.
4. Producto: `{ ref, nombre, marca, seccion: hombre|mujer|hype, categoria, color, tallas: [], precio, precio_bf, bf, estado: stock|encargo|agotado, fotos: ["archivo.webp"], hype, nuevo, visible }`.

**Apps Script (`Code.gs`)**
- `doGet`: `?datos=1` (todo lo anterior) y `?codigo=MY-1001` (devuelve solo `estado`, `nota`, `fecha`).
- `doPost` (cuerpo JSON enviado **sin** cabecera `Content-Type`, para evitar preflight): `{tipo:'voto', ref}`, `{tipo:'clic', boton, seccion, ref, origen}` o un encargo `{nombre, whatsapp, producto, talla, para, origen, autorizo, web}`.
- Pestañas: `Catalogo`, `Config`, `Encargos`, `Votos`, `Clics`. Las columnas están en la constante `COLUMNAS`; el código lee por posición, así que **no reordenes columnas** sin cambiar esa constante.
- `prepararHoja()` crea pestañas, validaciones y datos iniciales sin borrar lo existente.
- Códigos de encargo desde `MY-1001` (los productos usan `MY-01xx` a `MY-03xx`).
- Solo sale de `Config` lo que está en `CONFIG_PUBLICA`. `correo_extra` nunca se expone.
- `limpia()` antepone `'` a textos que empiezan con `= + - @` (inyección de fórmulas).
- Cambiar `Code.gs` exige volver a implementar una versión nueva; cambiar datos no.

**Antispam del formulario:** campo trampa `#f-web` (si llega lleno, el servidor responde ok con código falso `MY-0000` y no guarda), máximo 3 envíos por hora por navegador (`localStorage` `my-envios`), WhatsApp colombiano `^3\d{9}$` validado en cliente y servidor, casilla de autorización obligatoria. Cualquier fallo o límite → `location.href` a WhatsApp con el mismo texto.

**Origen:** `?origen=instagram` se guarda en `sessionStorage` (`my-origen`), se añade al final de todo mensaje de WhatsApp como "(Vengo de Instagram)" y viaja en encargos y clics.

**Clics:** un único listener en `datos.js` sobre `a[href*="wa.me"]`. El botón sale de `data-b`, la sección del `section[id]` más cercano y la Ref. de `data-ref`.

**Ficha de producto:** `<dialog id="ficha">`. Se abre por hash `#MY-0101` (`hashchange`), que es también el enlace directo para compartir. Al cerrar se limpia el hash con `history.replaceState`.

**Black Friday:** `MY.estadoBF()` → `abierto | cerrado | apagado`. `MY.enBF(p)` exige BF abierto, `p.bf` y `estado === 'stock'`. Es una rebaja del stock de Medellín, no una temporada de encargos. **No prometer "entrega inmediata"** (el dueño lo pidió el 17-nov-2026): los pasos son "Elige lo que te gusta · Escríbenos por WhatsApp · Te llevamos tu pedido".

## 6. Cómo probar

```
python herramientas/servidor-prueba.py
```

Abre `http://localhost:8765`. Para usar la hoja simulada pon `script_url: "/hoja"` en `datos/conexion.js` **y devuélvelo a como estaba antes de publicar**. `/hoja?ver=1` muestra lo guardado. `/nojs/index.html` bloquea scripts.

Antes de entregar cualquier cambio:
- 360, 375 y 1440 px: sin scroll horizontal (`scrollWidth === clientWidth`), nada encimado, "Pedir" visible en la primera pantalla del celular.
- Sin errores de consola ni imágenes rotas.
- Lighthouse móvil ≥ 90 en rendimiento, accesibilidad y SEO. Última medición (16-nov-2026, servidor local, Lighthouse 12.2.1): portada 95–98 / 100 / 100; seguimiento 91 / 100 / 100; llegadas 93 / 100 / 100; condiciones 100 / 100 / 100.
- Presupuesto: foto de producto ≤ 120 KB (800×1000 WebP); portada ≤ 250 KB; video ≤ 3 MB sin audio; primera carga en celular ≤ 1,5 MB.

## 7. Qué no se probó o quedó a medias

- El Apps Script **no se ha ejecutado en Google**: solo contra `servidor-prueba.py`, que replica su lógica. Falta la prueba real de encargo → hoja → correo → seguimiento, y de `prepararHoja()`.
- No está publicado ni en GitHub. `og:image`, `og:url` y `canonical` apuntan a `https://medayork.medayorkshop.workers.dev`, que es un nombre **supuesto**: corrígelo si el link real es otro.
- Las fotos de producto actuales son de prueba (renders), no de la prenda real.
- `condiciones.html` tiene 7 marcadores por definir; MY-0101 no tiene marca.
- Las respuestas de preguntas frecuentes, la lista de "En hype" y la guía de tallas las redactó la IA y esperan confirmación del dueño.
- No hay QR todavía (depende del link final).
- La subida de foto de referencia en el formulario no existe: se pide enviarla por WhatsApp.
