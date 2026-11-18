/* ============================================================================
   MEDAYORK · el "motor" gratis que vive dentro de tu hoja de Google
   ----------------------------------------------------------------------------
   Qué hace:
   - Le entrega a la página el catálogo, la configuración, los votos y el muro.
   - Recibe los encargos, los votos y los clics, y los anota en la hoja.
   - Te manda un correo por cada encargo.
   - Responde el estado de un encargo cuando el cliente escribe su código.

   Cómo se instala (una sola vez): está paso a paso en LEEME.md.
   Resumen: Extensiones → Apps Script → pegar esto → Guardar → recargar la hoja →
   menú "Medayork" → "1. Preparar la hoja" → Implementar como aplicación web.

   IMPORTANTE: cada vez que cambies ESTE código hay que volver a implementar
   (Implementar → Administrar implementaciones → lápiz → Versión nueva).
   Cambiar DATOS en la hoja no necesita nada: se ve en la página al recargar.
   ============================================================================ */

const HOJA = SpreadsheetApp.getActiveSpreadsheet();

/* ---------- 1. Listas permitidas (son las listas desplegables de la hoja) ---------- */
const SECCIONES = ['hombre', 'mujer', 'hype'];
const CATEGORIAS = ['tenis', 'camisetas', 'polos', 'buzos', 'hoodies', 'chaquetas', 'pantalones', 'pantalonetas', 'shorts', 'tops', 'sandalias', 'morrales', 'gorras', 'accesorios'];
const ESTADOS_PRODUCTO = ['stock', 'encargo', 'agotado'];
const ESTADOS_ENCARGO = ['Recibido', 'Separado', 'Comprado en Nueva York', 'En camino', 'En Medellín', 'Entregado'];
const SI_NO = ['sí', 'no'];

/* ---------- 2. Pestañas y columnas (el orden importa: no mover columnas) ---------- */
const COLUMNAS = {
  Catalogo: ['ref', 'nombre', 'marca', 'seccion', 'categoria', 'color', 'tallas', 'precio', 'precio_bf', 'bf', 'estado', 'fotos', 'hype', 'nuevo', 'visible'],
  Config: ['clave', 'valor', 'para_que_sirve'],
  Encargos: ['fecha', 'codigo', 'nombre', 'whatsapp', 'producto', 'talla', 'para', 'origen', 'autorizo_datos', 'estado', 'nota_cliente', 'muro'],
  Votos: ['fecha', 'ref'],
  Clics: ['fecha', 'boton', 'seccion', 'ref', 'origen']
};
// Lo único de Config que la página puede leer. El correo extra NUNCA sale de la hoja.
const CONFIG_PUBLICA = ['whatsapp', 'instagram', 'tiktok', 'frase_portada', 'tiempo_encargo', 'bf_activo', 'bf_inicio', 'bf_fin'];

/* ---------- 3. Menú dentro de la hoja ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Medayork')
    .addItem('1. Preparar la hoja (crea pestañas y listas)', 'prepararHoja')
    .addItem('2. Enviarme un correo de prueba', 'correoDePrueba')
    .addToUi();
}

/* Crea las pestañas, los títulos, las listas desplegables y los datos iniciales.
   Se puede correr varias veces: nunca borra lo que ya escribiste. */
function prepararHoja() {
  HOJA.setSpreadsheetTimeZone('America/Bogota');
  Object.keys(COLUMNAS).forEach(function (nombre) {
    let h = HOJA.getSheetByName(nombre) || HOJA.insertSheet(nombre);
    const titulos = COLUMNAS[nombre];
    h.getRange(1, 1, 1, titulos.length).setValues([titulos]).setFontWeight('bold').setBackground('#1C1D1F').setFontColor('#EFECE6');
    h.setFrozenRows(1);
    if (h.getLastRow() < 2) sembrar(nombre, h);
  });
  const lista = function (pestana, columna, valores) {
    const h = HOJA.getSheetByName(pestana), n = COLUMNAS[pestana].indexOf(columna) + 1;
    h.getRange(2, n, 999, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(valores, true).setAllowInvalid(false).build());
  };
  lista('Catalogo', 'seccion', SECCIONES);
  lista('Catalogo', 'categoria', CATEGORIAS);
  lista('Catalogo', 'estado', ESTADOS_PRODUCTO);
  ['bf', 'hype', 'nuevo', 'visible'].forEach(function (c) { lista('Catalogo', c, SI_NO); });
  lista('Encargos', 'estado', ESTADOS_ENCARGO);
  lista('Encargos', 'muro', ['aprobado', 'no']);
  // En Config y en tallas/fotos todo es texto, para que Google no convierta fechas ni números solo.
  HOJA.getSheetByName('Config').getRange('B2:B200').setNumberFormat('@');
  HOJA.getSheetByName('Catalogo').getRange('G2:G1000').setNumberFormat('@');
  HOJA.getSheetByName('Encargos').getRange('D2:D5000').setNumberFormat('@');
  const hoja1 = HOJA.getSheetByName('Hoja 1') || HOJA.getSheetByName('Sheet1');
  if (hoja1 && hoja1.getLastRow() === 0) HOJA.deleteSheet(hoja1);
  SpreadsheetApp.getUi().alert('Listo. La hoja quedó preparada con el catálogo actual y una fila de ejemplo en cada pestaña.');
}

function sembrar(nombre, h) {
  const filas = {
    Catalogo: [
      ["MY-0138", "Cortavientos con logo Jordan", "Nike", "hombre", "chaquetas", "Azul oscuro y blanco", "XL", 200000, "", "sí", "stock", "my-0138.webp", "no", "sí", "sí"],
      ["MY-0131", "Camiseta Jumpman Air", "Jordan", "hombre", "camisetas", "Negro", "M", 120000, "", "sí", "stock", "my-0131.webp", "no", "sí", "sí"],
      ["MY-0105", "Polo", "Nike", "hombre", "polos", "Azul oscuro", "M", 130000, "", "sí", "stock", "my-0105.webp", "no", "no", "sí"],
      ["MY-0110", "Pantalón deportivo", "Nike", "hombre", "pantalones", "Negro", "M", 190000, "", "sí", "stock", "my-0110.webp", "no", "sí", "sí"],
      ["MY-0112", "Camiseta Jumpman", "Jordan", "hombre", "camisetas", "Negro", "L", 120000, "", "sí", "stock", "my-0112.webp, my-0125.webp", "no", "sí", "sí"],
      ["MY-0120", "Pantaloneta", "Jordan", "hombre", "pantalonetas", "Verde oliva", "M", 140000, "", "sí", "stock", "my-0120.webp", "no", "sí", "sí"],
      ["MY-0118", "Pantaloneta", "Nike", "hombre", "pantalonetas", "Negro", "M", 140000, "", "sí", "stock", "my-0118.webp", "no", "sí", "sí"],
      ["MY-0126", "Pantalón cargo camuflado", "Nike", "hombre", "pantalones", "Gris oscuro", "L", 190000, "", "sí", "stock", "my-0126.webp", "no", "sí", "sí"],
      ["MY-0130", "Pantalón cargo", "Nike", "hombre", "pantalones", "Negro", "M", 190000, "", "sí", "stock", "my-0130.webp", "no", "no", "sí"],
      ["MY-0135", "Camiseta estampada", "Supply & Demand", "hombre", "camisetas", "Blanco", "M, L", 130000, "", "sí", "stock", "my-0135.webp", "no", "no", "sí"],
      ["MY-0139", "Camiseta oversize", "Jordan", "hombre", "camisetas", "Azul", "XL", 120000, "", "sí", "stock", "my-0139.webp", "no", "no", "sí"],
      ["MY-0144", "Camiseta Globe", "Jordan", "hombre", "camisetas", "Blanco hueso", "M, L", 120000, "", "sí", "stock", "my-0144.webp", "no", "no", "sí"],
      ["MY-0140", "Cortavientos", "Nike", "hombre", "chaquetas", "Azul y blanco", "M", 200000, "", "sí", "stock", "my-0140.webp", "no", "no", "sí"],
      ["MY-0101", "Camiseta estampada", "Nike", "hombre", "camisetas", "Negro", "L", 110000, "", "sí", "stock", "my-0101.webp", "no", "no", "sí"],
      ["MY-0102", "Camiseta Trefoil", "Adidas", "hombre", "camisetas", "Negro", "L", 90000, "", "sí", "stock", "my-0102.webp", "no", "no", "sí"],
      ["MY-0103", "Camiseta Trefoil", "Adidas", "hombre", "camisetas", "Blanco", "L", 90000, "", "sí", "stock", "my-0103.webp", "no", "no", "sí"],
      ["MY-0104", "Camiseta Trefoil Colombia", "Adidas", "hombre", "camisetas", "Blanco", "S, M", 90000, "", "sí", "stock", "my-0104.webp", "no", "no", "sí"],
      ["MY-0106", "Polo", "Nike", "hombre", "polos", "Blanco", "M", 130000, "", "sí", "stock", "my-0106.webp", "no", "no", "sí"],
      ["MY-0107", "Morral", "Nike", "hombre", "morrales", "Verde y negro", "", 150000, "", "sí", "stock", "my-0107.webp", "no", "no", "sí"],
      ["MY-0108", "Morral", "Jordan", "hombre", "morrales", "Turquesa y negro", "", 150000, "", "sí", "stock", "my-0108.webp", "no", "no", "sí"],
      ["MY-0109", "Camiseta Trefoil", "Adidas", "hombre", "camisetas", "Crema", "XL", 90000, "", "sí", "stock", "my-0109.webp", "no", "no", "sí"],
      ["MY-0111", "Hoodie", "Nike", "hombre", "hoodies", "Blanco", "L", 150000, "", "sí", "stock", "my-0111.webp", "no", "no", "sí"],
      ["MY-0113", "Buzo cuello redondo", "Nike", "hombre", "buzos", "Crema", "M", 130000, "", "sí", "stock", "my-0113.webp", "no", "no", "sí"],
      ["MY-0114", "Pantaloneta Brasil", "Jordan", "hombre", "pantalonetas", "Azul y amarillo", "S", 140000, "", "sí", "stock", "my-0114.webp", "no", "no", "sí"],
      ["MY-0115", "Camiseta oversize", "Nike", "hombre", "camisetas", "Blanco hueso", "XL", 120000, "", "sí", "stock", "my-0115.webp", "no", "no", "sí"],
      ["MY-0116", "Buzo cuello redondo", "Guess", "hombre", "buzos", "Gris claro", "M", 90000, "", "sí", "stock", "my-0116.webp", "no", "no", "sí"],
      ["MY-0117", "Gorra Houston Astros", "New Era", "hombre", "gorras", "Negro", "", 150000, "", "sí", "stock", "my-0117.webp", "no", "no", "sí"],
      ["MY-0119", "Camiseta estampada", "Jordan", "hombre", "camisetas", "Negro", "M", 120000, "", "sí", "stock", "my-0119.webp", "no", "no", "sí"],
      ["MY-0121", "Camiseta tie-dye", "Jordan", "hombre", "camisetas", "Negro", "M", 120000, "", "sí", "stock", "my-0121.webp", "no", "no", "sí"],
      ["MY-0122", "Camiseta", "Nike", "hombre", "camisetas", "Blanco", "XL", 120000, "", "sí", "stock", "my-0122.webp, my-0124.webp", "no", "no", "sí"],
      ["MY-0123", "Camiseta Wings", "Jordan", "hombre", "camisetas", "Negro", "S", 120000, "", "sí", "stock", "my-0123.webp", "no", "no", "sí"],
      ["MY-0127", "Hoodie", "Supply & Demand", "hombre", "hoodies", "Negro", "XL, XXL", 150000, "", "sí", "stock", "my-0127.webp", "no", "sí", "sí"],
      ["MY-0128", "Hoodie", "The North Face", "hombre", "hoodies", "Gris", "XXL", 150000, "", "sí", "stock", "my-0128.webp", "no", "no", "sí"],
      ["MY-0129", "Camiseta New York City", "Puma", "hombre", "camisetas", "Negro", "L", 90000, "", "sí", "stock", "my-0129.webp", "no", "no", "sí"],
      ["MY-0132", "Pantaloneta", "Nike", "hombre", "pantalonetas", "Azul y blanco", "M", 140000, "", "sí", "stock", "my-0132.webp", "no", "no", "sí"],
      ["MY-0133", "Pantaloneta 23", "Jordan", "hombre", "pantalonetas", "Rojo", "M", 140000, "", "sí", "stock", "my-0133.webp", "no", "no", "sí"],
      ["MY-0134", "Pantaloneta de malla", "Jordan", "hombre", "pantalonetas", "Verde oliva", "M", 140000, "", "sí", "stock", "my-0134.webp", "no", "no", "sí"],
      ["MY-0136", "Pantaloneta", "Nike", "hombre", "pantalonetas", "Negro", "M", 140000, "", "sí", "stock", "my-0136.webp", "no", "no", "sí"],
      ["MY-0137", "Pantaloneta 23", "Jordan", "hombre", "pantalonetas", "Negro", "M", 140000, "", "sí", "stock", "my-0137.webp", "no", "no", "sí"],
      ["MY-0141", "Pantaloneta", "Nike", "hombre", "pantalonetas", "Gris", "M", 140000, "", "sí", "stock", "my-0141.webp", "no", "no", "sí"],
      ["MY-0142", "Pantaloneta 23", "Jordan", "hombre", "pantalonetas", "Azul oscuro", "M", 140000, "", "sí", "stock", "my-0142.webp", "no", "no", "sí"],
      ["MY-0143", "Camiseta oversize", "The North Face", "hombre", "camisetas", "Negro", "M", 120000, "", "sí", "stock", "my-0143.webp", "no", "no", "sí"],
      ["MY-0145", "Pantaloneta", "Nike", "hombre", "pantalonetas", "Azul oscuro", "L", 140000, "", "sí", "stock", "my-0145.webp", "no", "no", "sí"],
      ["MY-0146", "Pantaloneta 23", "Jordan", "hombre", "pantalonetas", "Gris", "M", 140000, "", "sí", "stock", "my-0146.webp", "no", "no", "sí"],
      ["MY-0147", "Camiseta estampada", "Nike", "hombre", "camisetas", "Rojo", "M", 120000, "", "sí", "stock", "my-0147.webp", "no", "no", "sí"],
      ["MY-0148", "Pantaloneta", "Nike", "hombre", "pantalonetas", "Crema", "M", 140000, "", "sí", "stock", "my-0148.webp", "no", "no", "sí"],
      ["MY-0149", "Morral", "Nike", "hombre", "morrales", "Negro", "", 150000, "", "sí", "stock", "my-0149.webp", "no", "no", "sí"],
      ["MY-0150", "Morral", "Nike", "hombre", "morrales", "Rojo", "", 150000, "", "sí", "stock", "my-0150.webp", "no", "no", "sí"],
      ["MY-0151", "Morral", "Nike", "hombre", "morrales", "Vinotinto", "", 180000, "", "sí", "stock", "my-0151.webp", "no", "no", "sí"],
      ["MY-0152", "Morral", "Nike", "hombre", "morrales", "Café", "", 150000, "", "sí", "stock", "my-0152.webp", "no", "no", "sí"],
      ["MY-0153", "Morral con tapa", "Nike", "hombre", "morrales", "Negro", "", 150000, "", "sí", "stock", "my-0153.webp", "no", "no", "sí"],
      ["MY-0201", "Sandalias", "Nike", "mujer", "sandalias", "Arena y terracota", "7", 160000, "", "sí", "stock", "my-0201.webp", "no", "no", "sí"],
      ["MY-0204", "Hoodie Never Stop Exploring", "The North Face", "mujer", "hoodies", "Negro", "S", 120000, "", "sí", "stock", "my-0221.webp, my-0204.webp", "no", "no", "sí"],
      ["MY-0205", "Short", "Nike", "mujer", "shorts", "Negro", "M", 110000, "", "sí", "stock", "my-0205.webp", "no", "no", "sí"],
      ["MY-0206", "Short deportivo", "Nike", "mujer", "shorts", "Verde menta", "M, L", 110000, "", "sí", "stock", "my-0206.webp", "no", "no", "sí"],
      ["MY-0207", "Buzo cuello redondo oversize", "Nike", "mujer", "buzos", "Fucsia", "L", 120000, "", "sí", "stock", "my-0207.webp", "no", "sí", "sí"],
      ["MY-0208", "Top deportivo Pro", "Nike", "mujer", "tops", "Negro", "M", 90000, "", "sí", "stock", "my-0208.webp", "no", "no", "sí"],
      ["MY-0209", "Short", "Nike", "mujer", "shorts", "Negro", "S", 110000, "", "sí", "stock", "my-0209.webp", "no", "no", "sí"],
      ["MY-0210", "Camiseta logo ovalado", "Nike", "mujer", "camisetas", "Blanco", "L", 90000, "", "sí", "stock", "my-0210.webp", "no", "no", "sí"],
      ["MY-0211", "Camiseta Brooklyn oversize", "Nike", "mujer", "camisetas", "Negro", "M", 90000, "", "sí", "stock", "my-0211.webp", "no", "no", "sí"],
      ["MY-0212", "Short", "Nike", "mujer", "shorts", "Blanco hueso", "S", 110000, "", "sí", "stock", "my-0212.webp", "no", "no", "sí"],
      ["MY-0213", "Short deportivo", "Nike", "mujer", "shorts", "Gris", "L", 110000, "", "sí", "stock", "my-0213.webp", "no", "no", "sí"],
      ["MY-0214", "Buzo New York City oversize", "Nike", "mujer", "buzos", "Negro", "L", 120000, "", "sí", "stock", "my-0214.webp", "no", "no", "sí"],
      ["MY-0215", "Buzo NYC Tennis", "Nike", "mujer", "buzos", "Rojo", "XL", 120000, "", "sí", "stock", "my-0215.webp", "no", "no", "sí"],
      ["MY-0216", "Camiseta Just Do It", "Nike", "mujer", "camisetas", "Vinotinto", "L", 90000, "", "sí", "stock", "my-0216.webp", "no", "no", "sí"],
      ["MY-0217", "Camiseta Estatua de la Libertad", "Puma", "mujer", "camisetas", "Negro", "S", 90000, "", "sí", "stock", "my-0217.webp", "no", "no", "sí"],
      ["MY-0218", "Buzo cuello redondo oversize", "Nike", "mujer", "buzos", "Verde", "M", 120000, "", "sí", "stock", "my-0218.webp", "no", "no", "sí"],
      ["MY-0219", "Buzo cuello redondo oversize", "Nike", "mujer", "buzos", "Rojo", "M", 120000, "", "sí", "stock", "my-0219.webp", "no", "no", "sí"],
      ["MY-0220", "Camiseta corta", "Jordan", "mujer", "camisetas", "Negro", "L", 90000, "", "sí", "stock", "my-0220.webp", "no", "no", "sí"],
      ["MY-0222", "Top sin mangas", "Nike", "mujer", "tops", "Lila", "M", 90000, "", "sí", "stock", "my-0222.webp", "no", "no", "sí"],
      ["MY-0223", "Top sin mangas", "Nike", "mujer", "tops", "Negro", "M", 90000, "", "sí", "stock", "my-0223.webp", "no", "sí", "sí"],
      ["MY-0224", "Camiseta", "Adidas", "mujer", "camisetas", "Gris claro", "M", 90000, "", "sí", "stock", "my-0224.webp", "no", "no", "sí"],
      ["MY-0225", "Camiseta estampada", "Adidas", "mujer", "camisetas", "Negro", "M", 90000, "", "sí", "stock", "my-0225.webp", "no", "no", "sí"],
      ["MY-0226", "Short deportivo", "Nike", "mujer", "shorts", "Azul claro", "M", 110000, "", "sí", "stock", "my-0226.webp", "no", "no", "sí"],
      ["MY-0227", "Pantalón", "Nike", "mujer", "pantalones", "Negro", "M", 180000, "", "sí", "stock", "my-0227.webp", "no", "no", "sí"],
      ["MY-0228", "Short", "Nike", "mujer", "shorts", "Lila", "M", 110000, "", "sí", "stock", "my-0228.webp", "no", "sí", "sí"],
      ["MY-0229", "Top deportivo", "Nike", "mujer", "tops", "Negro", "M", 90000, "", "sí", "stock", "my-0229.webp", "no", "sí", "sí"],
      ["MY-0230", "Camiseta", "Nike", "mujer", "camisetas", "Gris", "M", 90000, "", "sí", "stock", "my-0230.webp", "no", "no", "sí"],
      ["MY-0231", "Camiseta", "Adidas", "mujer", "camisetas", "Blanco", "M", 90000, "", "sí", "stock", "my-0231.webp", "no", "no", "sí"],
      ["MY-0232", "Short deportivo", "Nike", "mujer", "shorts", "Azul oscuro y morado", "M, L", 110000, "", "sí", "stock", "my-0232.webp", "no", "no", "sí"],
      ["MY-0301", "Air Max Dn8", "Nike", "hype", "tenis", "", "", "", "", "no", "encargo", "", "sí", "no", "sí"],
      ["MY-0302", "Air Force 1 '07", "Nike", "hype", "tenis", "", "", "", "", "no", "encargo", "", "sí", "no", "sí"],
      ["MY-0304", "Samba OG", "Adidas", "hype", "tenis", "", "", "", "", "no", "encargo", "", "sí", "no", "sí"],
      ["MY-0306", "Air Jordan 1 Low", "Jordan", "hype", "tenis", "", "", "", "", "no", "encargo", "", "sí", "no", "sí"],
      ["MY-0307", "Air Jordan 4", "Jordan", "hype", "tenis", "", "", "", "", "no", "encargo", "", "sí", "no", "sí"],
      ['EJEMPLO', 'Fila de ejemplo: cópiala y cambia los datos', 'Nike', 'hombre', 'tenis', 'Blanco', '8, 9, 10', 520000, 480000, 'sí', 'stock', 'my-0109.webp, my-0109-b.webp', 'no', 'sí', 'no']
    ],
    Config: [
      ['whatsapp', '573226759950', 'Número de la tienda con 57 adelante, sin espacios'],
      ['instagram', 'https://www.instagram.com/meda_yorkshop', 'Link completo'],
      ['tiktok', 'https://www.tiktok.com/@meda_yorkshop', 'Link completo'],
      ['frase_portada', 'Lo original viaja con nosotros.', 'Frase grande de la portada (máximo 6 palabras)'],
      ['tiempo_encargo', '15 a 20 días', 'Solo informativo'],
      ['bf_activo', 'sí', 'sí = prende Black Friday · no = lo apaga'],
      ['bf_inicio', '2026-11-16', 'Año-mes-día. Opcional con hora: 2026-11-16 08:00'],
      ['bf_fin', '2026-11-30', 'Año-mes-día (vale hasta las 11:59 p. m.) u hora exacta: 2026-11-30 18:00'],
      ['correo_extra', '', 'Otro correo que también reciba el aviso de cada encargo. No se muestra en la página.']
    ],
    Encargos: [[new Date(), 'MY-0000', 'EJEMPLO', '3001234567', 'Fila de ejemplo: puedes borrarla', '9', 'Hombre', 'instagram', 'sí', 'Recibido', 'Aquí escribes una nota que verá el cliente', 'no']],
    Votos: [[new Date(), 'EJEMPLO']],
    Clics: [[new Date(), 'EJEMPLO', 'portada', '', 'instagram']]
  }[nombre];
  h.getRange(2, 1, filas.length, filas[0].length).setValues(filas);
}

function correoDePrueba() {
  MailApp.sendEmail(destinatarios(), 'Medayork · correo de prueba', 'Si lees esto, los avisos de encargos van a llegar a este correo.');
  SpreadsheetApp.getUi().alert('Correo enviado a: ' + destinatarios());
}

/* ---------- 4. Lo que la página PIDE (lecturas) ---------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.codigo) return salida(estadoDeEncargo(p.codigo));
  if (p.datos) return salida({ ok: true, config: leerConfig(), productos: leerCatalogo(), votos: contarVotos(), muro: leerMuro() });
  return salida({ ok: false });
}

function leerConfig() {
  const c = {};
  filas('Config').forEach(function (r) {
    const k = String(r[0]).trim();
    if (CONFIG_PUBLICA.indexOf(k) > -1) c[k] = r[1];
  });
  return {
    whatsapp: String(c.whatsapp || '').replace(/\D/g, ''),
    instagram: texto(c.instagram, 200), tiktok: texto(c.tiktok, 200),
    frase_portada: texto(c.frase_portada, 80), tiempo_encargo: texto(c.tiempo_encargo, 40),
    black_friday: { activo: esSi(c.bf_activo), inicio: fechaISO(c.bf_inicio, false), fin: fechaISO(c.bf_fin, true) }
  };
}

function leerCatalogo() {
  const col = COLUMNAS.Catalogo;
  return filas('Catalogo').map(function (r) {
    const o = {}; col.forEach(function (k, i) { o[k] = r[i]; });
    return o;
  }).filter(function (o) { return /^MY-\d{3,5}$/i.test(String(o.ref).trim()); }).map(function (o) {
    return {
      ref: String(o.ref).trim().toUpperCase(), nombre: texto(o.nombre, 80), marca: texto(o.marca, 40),
      seccion: texto(o.seccion, 20).toLowerCase(), categoria: texto(o.categoria, 30).toLowerCase(), color: texto(o.color, 40),
      tallas: lista(o.tallas), precio: numero(o.precio), precio_bf: numero(o.precio_bf), bf: esSi(o.bf),
      estado: texto(o.estado, 20).toLowerCase() || 'stock', fotos: lista(o.fotos),
      hype: esSi(o.hype), nuevo: esSi(o.nuevo), visible: !/^no$/i.test(String(o.visible).trim())
    };
  });
}

function contarVotos() {
  const conteo = {};
  filas('Votos').forEach(function (r) { const ref = String(r[1]); if (/^MY-\d+$/.test(ref)) conteo[ref] = (conteo[ref] || 0) + 1; });
  return conteo;
}

// El muro SOLO muestra encargos donde tú elegiste "aprobado". Sale el primer nombre y el producto, nada más.
function leerMuro() {
  const c = COLUMNAS.Encargos;
  return filas('Encargos').filter(function (r) { return String(r[c.indexOf('muro')]).toLowerCase().trim() === 'aprobado'; })
    .slice(-12).reverse()
    .map(function (r) { return { nombre: String(r[c.indexOf('nombre')]).trim().split(' ')[0].slice(0, 20), producto: String(r[c.indexOf('producto')]).slice(0, 50) }; });
}

// Seguimiento: solo devuelve estado, fecha y nota. Nunca nombre, teléfono ni precio.
function estadoDeEncargo(codigo) {
  const c = COLUMNAS.Encargos, buscado = String(codigo).toUpperCase().trim();
  const f = filas('Encargos').find(function (r) { return String(r[c.indexOf('codigo')]).toUpperCase().trim() === buscado; });
  if (!f || buscado === 'MY-0000') return { ok: false };
  return { ok: true, estado: String(f[c.indexOf('estado')]), nota: String(f[c.indexOf('nota_cliente')] || ''), fecha: f[c.indexOf('fecha')] };
}

/* ---------- 5. Lo que la página ENVÍA (escrituras) ---------- */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return salida({ ok: false, error: 'datos' }); }

  if (d.tipo === 'voto') {
    const ref = texto(d.ref, 12).toUpperCase();
    if (!/^MY-\d{3,5}$/.test(ref)) return salida({ ok: false });
    HOJA.getSheetByName('Votos').appendRow([new Date(), ref]);
    return salida({ ok: true });
  }

  if (d.tipo === 'clic') {   // sin datos personales: solo qué botón, en qué sección y de qué red venía
    HOJA.getSheetByName('Clics').appendRow([new Date(), limpia(d.boton, 30), limpia(d.seccion, 30), limpia(d.ref, 12), limpia(d.origen, 20)]);
    return salida({ ok: true });
  }

  // --- Encargo ---
  if (d.web) return salida({ ok: true, codigo: 'MY-0000' });        // campo trampa: lo llenó un robot, se ignora
  if (!d.autorizo) return salida({ ok: false, error: 'sin autorización' });
  const nombre = limpia(d.nombre, 60), producto = limpia(d.producto, 300);
  let wa = String(d.whatsapp || '').replace(/\D/g, '');
  if (wa.length === 12 && wa.indexOf('57') === 0) wa = wa.slice(2);
  if (!nombre || !producto || !/^3\d{9}$/.test(wa)) return salida({ ok: false, error: 'datos incompletos' });

  const candado = LockService.getScriptLock();
  candado.waitLock(10000);
  try {
    const h = HOJA.getSheetByName('Encargos');
    const codigo = siguienteCodigo(h);
    h.appendRow([new Date(), codigo, nombre, wa, producto, limpia(d.talla, 20), limpia(d.para, 20), limpia(d.origen, 20), 'sí', 'Recibido', '', '']);
    try {
      MailApp.sendEmail(destinatarios(), 'Nuevo encargo ' + codigo,
        nombre + ' quiere: ' + producto + '\nTalla: ' + texto(d.talla, 20) + '\nPara: ' + texto(d.para, 20) +
        '\nWhatsApp: https://wa.me/57' + wa + '\nLlegó desde: ' + (texto(d.origen, 20) || 'directo') + '\n\nCódigo de seguimiento: ' + codigo);
    } catch (err) { /* si el correo falla, el encargo igual quedó en la hoja */ }
    return salida({ ok: true, codigo: codigo });
  } finally {
    candado.releaseLock();
  }
}

// Los códigos de encargo empiezan en MY-1001 para no confundirse con las Ref. de productos.
function siguienteCodigo(h) {
  let mayor = 1000;
  filas('Encargos').forEach(function (r) { const m = String(r[1]).match(/^MY-(\d+)$/); if (m) mayor = Math.max(mayor, +m[1]); });
  return 'MY-' + (mayor + 1);
}

/* ---------- 6. Ayudas ---------- */
function filas(pestana) {
  const h = HOJA.getSheetByName(pestana);
  return h && h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, COLUMNAS[pestana].length).getValues() : [];
}
function destinatarios() {
  const extra = (filas('Config').find(function (r) { return String(r[0]).trim() === 'correo_extra'; }) || [])[1];
  return [Session.getEffectiveUser().getEmail(), String(extra || '').trim()].filter(String).join(',');
}
function texto(v, max) { return String(v == null ? '' : v).trim().slice(0, max); }
// Igual que texto(), pero evita que algo que empiece por = + - @ se ejecute como fórmula en la hoja.
function limpia(v, max) { let t = texto(v, max); if (/^[=+\-@]/.test(t)) t = "'" + t; return t; }
function esSi(v) { return /^s[ií]$/i.test(String(v).trim()) || v === true; }
function numero(v) { const n = Number(String(v).replace(/[^\d]/g, '')); return n > 0 ? n : null; }
function lista(v) { return String(v == null ? '' : v).split(',').map(function (x) { return x.trim(); }).filter(String); }
function fechaISO(v, esFin) {
  if (v instanceof Date) v = Utilities.formatDate(v, 'America/Bogota', 'yyyy-MM-dd HH:mm');
  const m = String(v || '').trim().match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!m) return '';
  const hora = m[2] && !(esFin && m[2] === '00' && m[3] === '00') ? ('0' + m[2]).slice(-2) + ':' + m[3] + ':00' : (esFin ? '23:59:59' : '00:00:00');
  return m[1] + 'T' + hora + '-05:00';
}
function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
