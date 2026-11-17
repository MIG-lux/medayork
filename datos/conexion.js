/* CONEXIÓN DE MEDAYORK: lo único que NO vive en la hoja de Google.
   - script_url: la dirección que te da Google al implementar el Apps Script (termina en /exec).
     Mientras esté vacía (""), la página usa el respaldo y manda los pedidos directo a WhatsApp.
   - whatsapp: número de emergencia por si la hoja no responde (el oficial se cambia en la hoja, pestaña Config).
   - analytics_token: el código de Cloudflare Web Analytics, solo si NO lo activas con un clic en Cloudflare Pages. */
window.MEDAYORK_CONEXION = {
  script_url: "",
  whatsapp: "573226759950",
  analytics_token: ""
};