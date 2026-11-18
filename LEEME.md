# Medayork · manual de tu página

Escrito para ti, Miguel, sin tecnicismos. Si algún día trabajas con otra inteligencia artificial o con un programador, pásale el archivo `PARA-LA-PROXIMA-IA.md`.

**Estado al 16 de noviembre de 2026:** la página está construida y probada en este computador. **Falta** conectarla a tu hoja de Google y publicarla (partes 1 y 2 de este manual). Mientras no conectes la hoja, la página muestra el respaldo y manda todos los pedidos directo a WhatsApp.

---

## Lo que haces una sola vez

### Parte 1 · Crear tu hoja de Google (10 minutos)

La hoja es tu panel de control: ahí cambias productos, precios, Black Friday y estados de encargos.

1. Entra a Google con la cuenta **de la tienda** y crea una hoja de cálculo nueva. Ponle "Medayork".
2. Menú **Extensiones → Apps Script**. Borra lo que aparezca.
3. Abre el archivo `apps-script/Code.gs` de esta carpeta (con el Bloc de notas), copia TODO y pégalo ahí. Clic en el ícono de guardar.
4. Vuelve a la hoja y recárgala (F5). Aparece un menú nuevo llamado **Medayork**.
5. **Medayork → 1. Preparar la hoja**. Google te pide permiso: acepta con tu cuenta (dice "aplicación no verificada" porque la hiciste tú: Configuración avanzada → Ir a Medayork). Al terminar tendrás 5 pestañas listas, con tu catálogo actual, listas desplegables y una fila de ejemplo en cada una.
6. **Medayork → 2. Enviarme un correo de prueba**, para confirmar que los avisos llegan.
7. Si quieres que los avisos lleguen también a tu correo personal: pestaña `Config`, fila `correo_extra`, escríbelo en la columna `valor`. No aparece en la página.
8. En Apps Script: **Implementar → Nueva implementación** → tipo **Aplicación web** → Ejecutar como: **Yo** → Quién tiene acceso: **Cualquier usuario** → Implementar. Copia la dirección que termina en `/exec`.
9. Abre `datos/conexion.js` con el Bloc de notas y pega esa dirección entre las comillas de `script_url: ""`. Guarda.
10. Comparte la hoja con tu correo personal (botón Compartir → Editor).

### Parte 2 · Publicar la página (20 minutos)

No necesitas instalar nada.

1. Crea una cuenta en **github.com** (es donde se guardan los archivos de la página).
2. Arriba a la derecha: **+ → New repository**. Nombre: `medayork`. Déjalo en "Public". Clic en **Create repository**.
3. En la página que sale, clic en **uploading an existing file**. Abre esta carpeta (`C:\Pagina web`) y arrastra a la ventana **todo menos**: la carpeta `Recursos`, la carpeta `.claude`, `direccion-de-arte.html` y el archivo `.zip`. Abajo, clic en **Commit changes**.
4. Crea una cuenta en **cloudflare.com**. Ve a **Workers & Pages → Crear → Pages → Conectar con Git**, autoriza GitHub y elige `medayork`.
5. Nombre del proyecto: `medayork`. Comando de compilación: vacío. Directorio de salida: `/`. Clic en **Guardar e implementar**.
6. En un minuto te da tu link, algo como `https://medayork.medayorkshop.workers.dev`.
7. **Si el link NO es exactamente `medayork.medayorkshop.workers.dev`** (porque el nombre ya estaba ocupado): avísale a tu IA o cambia tú mismo ese texto por tu link real en `index.html`, `seguimiento.html`, `llegadas.html` y `condiciones.html` (búscalo con Ctrl + F). Sirve para que el link se vea con foto al mandarlo por WhatsApp.
8. **Medir visitas:** en Cloudflare, dentro de tu proyecto → **Métricas → Web Analytics → Habilitar**. Es un clic y no hay que pegar ningún código. (Si algún día Cloudflare te da un "token", se pega en `datos/conexion.js`, en `analytics_token`.)

Links para tu bio, para saber de qué red llega cada pedido:

- Instagram: `https://medayork.medayorkshop.workers.dev/?origen=instagram`
- TikTok: `https://medayork.medayorkshop.workers.dev/?origen=tiktok`

El mensaje de WhatsApp del cliente terminará con "(Vengo de Instagram)" y queda anotado en la hoja.

---

## El día a día (todo desde la hoja, sin tocar código)

Los cambios en la hoja se ven en la página al recargarla. No hay que publicar nada.

### Agregar un producto

1. Pestaña `Catalogo` → copia una fila parecida y cámbiale los datos.
2. Columnas:
   - `ref`: código único, con este formato: `MY-0109`. Hombre 01xx, Mujer 02xx, En hype 03xx.
   - `nombre`, `marca`, `color`: como quieres que se lean.
   - `seccion`: `hombre`, `mujer` o `hype` (los de `hype` solo salen en el ranking "En hype", sin foto ni precio).
   - `categoria`: elige de la lista (camisetas, polos, buzos, hoodies, chaquetas, pantalones, pantalonetas, shorts, tops, sandalias, morrales, gorras…).
   - `tallas`: separadas por coma: `8, 9, 10`. Si la dejas vacía, la tarjeta dice "Pregúntanos" en ropa y "Única" en morrales, gorras y accesorios.
   - `precio`: solo números, sin puntos: `180000`. Vacío = "Pregunta el precio".
   - `precio_bf` y `bf`: ver Black Friday abajo.
   - `estado`: `stock`, `encargo` o `agotado`.
   - `fotos`: solo el nombre del archivo: `my-0109.webp`. Varias fotos separadas por coma; la primera es la principal.
   - `hype`: `sí` lo pone en el ranking "En hype".
   - `nuevo`: `sí` lo pone en el carrusel "Llegó y está en hype" y en "Llegadas de la semana".
   - `visible`: `no` lo esconde sin borrarlo.
3. Sube la foto (siguiente punto).

### Subir fotos

1. Prepara la foto: vertical, **800 × 1000 píxeles**, fondo gris azulado para hombre y arcilla claro para mujer. Para que pese poco, ábrela en **squoosh.app**, elige formato WebP, y descárgala. Nómbrala igual que la referencia, en minúsculas y sin espacios: `my-0109.webp`.
2. En GitHub entra a tu repositorio → carpeta `img` → `productos` → **Add file → Upload files** → arrastra la foto → **Commit changes**.
3. En uno o dos minutos ya está publicada. Escribe ese mismo nombre en la columna `fotos` de la hoja.

### Cambiar el orden de las prendas

La página muestra las prendas en el mismo orden de las filas de la pestaña `Catalogo`. Para que una salga de primera, mueve su fila hacia arriba (clic en el número de la fila y arrástrala). Cada sección muestra 16 y luego el botón "Ver más".

### Quitar un producto o marcarlo agotado

- Se vendió pero lo puedes volver a traer: `estado` = `agotado`. La tarjeta dice "Agotado · pídelo por encargo" y el botón cambia a "Pedir encargo".
- No lo quieres mostrar: `visible` = `no`.

### Prender y apagar Black Friday

Pestaña `Config`:

- `bf_activo`: `sí` o `no`.
- `bf_inicio` y `bf_fin`: con formato año-mes-día, por ejemplo `2026-11-30` (vale hasta las 11:59 p. m.). Con hora exacta: `2026-11-30 18:00`.

Mientras esté activo y dentro de las fechas aparecen la cinta de arriba, la sección con cuenta regresiva y el sello Black Friday en los productos que tengan `bf` = `sí` y estén en stock. Al pasar la fecha se cierra solo.

**Precio tachado:** solo aparece si `precio_bf` es **menor** que `precio`. Pon en `precio` lo que de verdad cobrabas antes. Si no hay precio anterior real, deja `precio_bf` vacío y se muestra un solo precio.

### Cambiar la frase de la portada

Pestaña `Config`, fila `frase_portada`. Máximo 6 palabras.

### Cambiar el estado de un encargo

Pestaña `Encargos`. Cada encargo que llega por el formulario crea una fila con su código (MY-1001, MY-1002…).

- Columna `estado`: elige de la lista. El orden es: Recibido → Separado → Comprado en Nueva York → En camino → En Medellín → Entregado.
- Columna `nota_cliente`: un mensaje corto que el cliente verá en "Sigue tu encargo".
- El cliente nunca ve nombre, teléfono ni precio; solo estado y nota.

Un encargo que cerraste por WhatsApp también puede tener seguimiento: agrega tú la fila con un código nuevo (el siguiente número) y dáselo al cliente.

### El muro "Lo que la comunidad está pidiendo"

Solo aparecen los encargos donde tú elijas `aprobado` en la columna `muro`. Se muestra el primer nombre y el producto. Si no apruebas ninguno, el muro no aparece.

### Ver qué vende

- Pestaña `Clics`: cada toque a un botón de WhatsApp, con el botón, la sección, la Ref. del producto y la red de origen. No guarda datos de personas.
- Pestaña `Votos`: cada "Yo también lo quiero". El ranking de la página muestra los números reales.
- Cloudflare → Web Analytics: visitas por día y de dónde llegan.

### Subir "Llegadas de la semana" a historias

Abre `tu-link/llegadas.html` en el celular, toma captura y súbela. Muestra de a 4 los productos con `nuevo` = `sí`; con "Siguiente" pasas a los demás.

### Mandar un producto por WhatsApp

Cada producto tiene link propio: `tu-link/#MY-0101`. También sale con el botón "Compartir" de la ficha.

---

## Cosas que sí necesitan tocar archivos

### Cambiar el video de portada

Necesitas dos videos sin sonido de 6 a 8 segundos: uno horizontal (1280 px de ancho) llamado `portada-h.mp4` y uno vertical (720 px de ancho) llamado `portada-v.mp4`, cada uno de menos de 3 MB. Súbelos a la carpeta `video` de GitHub reemplazando los actuales. La foto que se ve mientras carga está en `img/portada-h.webp` y `img/portada-v.webp`. Si no sabes bajarles el peso, pídeselo a una IA: "convierte este video a MP4 H.264 sin audio, 720 px de ancho, menos de 3 MB".

### Publicar un cambio de archivos

En GitHub, entra al archivo → ícono del lápiz → cambia → **Commit changes**. Cloudflare lo publica solo en uno o dos minutos. Para subir archivos nuevos: **Add file → Upload files**.

### Llenar las condiciones de encargo

`condiciones.html` tiene marcadores amarillos entre corchetes con lo que debes definir tú (qué pasa con el abono si no se consigue el producto, cambios de talla, medios de pago, entregas). Reemplaza cada `<span class="mk">[...]</span>` por tu texto.

---

## Si algo se rompe

| Qué ves | Qué hacer |
|---|---|
| La página muestra productos viejos | La hoja no está respondiendo y se ve el respaldo. Abre la hoja y revisa que no hayas borrado o renombrado una pestaña o una columna. |
| Un producto no aparece | Revisa que `ref` tenga el formato `MY-0000`, que `visible` no sea `no` y que tenga algo en `fotos` (sin foto no sale en Hombre ni Mujer). |
| La foto sale en blanco | El nombre en `fotos` no es idéntico al del archivo (mayúsculas, espacios, `.webp`), o no la subiste a `img/productos`. |
| El precio tachado no sale | `precio_bf` debe ser menor que `precio`, `bf` = `sí`, estado `stock` y Black Friday activo. |
| El formulario abre WhatsApp en vez de dar código | Es el plan B y el pedido no se pierde. Pasa cuando la hoja no responde, cuando `script_url` está vacío o tras 3 encargos seguidos desde el mismo celular. |
| No llegan correos | Menú Medayork → Enviarme un correo de prueba. Revisa spam. Google permite unos 100 correos al día. |
| Cambiaste el código de Apps Script y no pasa nada | Implementar → Administrar implementaciones → lápiz → Versión: Nueva versión → Implementar. |
| Dañaste un archivo | En GitHub: entra al archivo → History → abre la versión anterior → copia y restaura. O usa el `.zip` de respaldo. |
| No sabes qué pasó | Pásale a una IA el archivo `PARA-LA-PROXIMA-IA.md` y cuéntale qué ves. |

---

## Qué es cada archivo

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La tienda. |
| `seguimiento.html` | Tablero de "Sigue tu encargo". |
| `llegadas.html` | Llegadas de la semana para historias. |
| `condiciones.html` | Condiciones de encargo (con marcadores por llenar). |
| `privacidad.html` | Política de datos. |
| `404.html` | "Equipaje perdido": sale cuando un link no existe. |
| `datos/conexion.js` | La dirección de tu hoja. Es lo único que se configura fuera de la hoja. |
| `datos/respaldo.js` | Copia del contenido por si la hoja falla. |
| `css/estilos.css` | Colores, letras y diseño. |
| `js/datos.js`, `js/app.js` | El funcionamiento. |
| `img/`, `video/` | Fotos y video. Las fotos de productos van en `img/productos/`. |
| `apps-script/Code.gs` | El código que pegas en tu hoja. |
| `herramientas/` | Servidor de prueba para quien edite el código. No afecta la página. |
| `capturas/` | Capturas de la revisión final. |

---

## Pendientes que dependen solo de ti

1. **Crear la hoja y pegar la dirección** en `datos/conexion.js` (Parte 1).
2. **Publicar** en GitHub y Cloudflare (Parte 2) y confirmar el link.
3. **Probar con la hoja real:** haz un encargo de prueba, revisa que llegue a la hoja y al correo, y que el código funcione en "Sigue tu encargo". Yo lo probé contra una hoja simulada, no contra Google.
4. ~~Tallas y precios de las prendas nuevas~~ (hecho el 17-nov-2026: 80 prendas con talla y precio). Cuando cambie el inventario, se cambia en la hoja.
5. **Cambiar el link** para que no muestre tu correo (Cloudflare → Workers & Pages → Subdominio → Cambiar) y pasárselo a tu IA para corregir la imagen al compartir. En `catalogo-numerado` está `catalogo.csv` (se abre con Excel) con el número de cada foto, su Ref., talla y precio.
6. **Llenar `condiciones.html`** (7 marcadores).
7. **Confirmar lo que redacté o deduje:** respuestas de preguntas frecuentes, lista de "En hype", que los precios actuales son los de Black Friday, hombre/mujer de cada producto y la guía de tallas.
8. **QR para las bolsas:** se genera con el link final. Pídeselo a cualquier IA: "hazme un QR de este link en color #1C1D1F sobre fondo #EFECE6, en SVG y PNG de 2048 px".
9. **Política de datos:** que la revise alguien que sepa de leyes si quieres estar tranquilo.
