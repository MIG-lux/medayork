/* ============================================================================
   MEDAYORK · datos.js — lo que comparten TODAS las páginas
   ----------------------------------------------------------------------------
   1. Carga del contenido: respaldo → copia guardada en el navegador → hoja de Google
   2. Black Friday y precios
   3. WhatsApp: links, mensajes y de qué red llegó la persona (?origen=instagram)
   4. Registro de clics (sin datos personales)
   5. Cloudflare Web Analytics (opcional)
   Todo queda en el objeto global MY. No se usan librerías.
   ============================================================================ */
(function () {
  'use strict';
  var CX = window.MEDAYORK_CONEXION || {};
  var RESPALDO = window.MEDAYORK_RESPALDO || { config: {}, productos: [], votos: {}, muro: [] };
  var MY = window.MY = { datos: RESPALDO, script: CX.script_url || '' };

  /* ---------- Ayudas ---------- */
  // esc(): todo texto que venga de la hoja o de un cliente se muestra escapado (nunca como HTML).
  MY.esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  MY.pesos = function (n) { return '$' + Math.round(n).toLocaleString('es-CO'); };
  MY.quieto = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  MY.lee = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  MY.guarda = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  MY.foto = function (archivo) { return 'img/productos/' + encodeURIComponent(String(archivo).trim()); };
  // Morrales, gorras y accesorios son talla única. En ropa, si la hoja no trae tallas, se le pide al cliente que pregunte.
  MY.unica = function (p) { return ['morrales', 'gorras', 'accesorios'].indexOf(p.categoria) > -1; };
  MY.textoTallas = function (p) {
    if (p.tallas && p.tallas.length > 5) return p.tallas[0] + ' a ' + p.tallas[p.tallas.length - 1];   // muchas tallas: se resume (la ficha muestra todas)
    if (p.tallas && p.tallas.length) return p.tallas.join(' · ');
    return MY.unica(p) ? 'Única' : 'Pregúntanos';
  };

  /* ---------- 1. Carga del contenido ---------- */
  function valido(d) { return d && d.config && Array.isArray(d.productos) && d.productos.length > 0; }
  // pintar(datos) se llama enseguida con lo que haya a mano y otra vez si la hoja trae algo distinto.
  MY.cargar = function (pintar) {
    var mostrado = '';
    function usa(d) {
      var s = JSON.stringify(d);
      if (s === mostrado) return;
      mostrado = s; MY.datos = d; pintar(d);
    }
    var guardado = null;
    if (MY.script) { try { guardado = JSON.parse(MY.lee('my-datos')); } catch (e) {} }
    usa(valido(guardado) ? guardado : RESPALDO);
    if (!MY.script || !window.fetch) return;
    fetch(MY.script + '?datos=1').then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ok || !valido(d)) return;                      // si la hoja falla, se queda el respaldo
      var limpio = { config: d.config, productos: d.productos, votos: d.votos || {}, muro: d.muro || [] };
      MY.guarda('my-datos', JSON.stringify(limpio));
      usa(limpio);
    }).catch(function () {});
  };

  /* ---------- 2. Black Friday y precios ---------- */
  // Devuelve 'abierto', 'cerrado' (ya pasó la fecha) o 'apagado'.
  MY.estadoBF = function () {
    var b = (MY.datos.config || {}).black_friday || {};
    if (!b.activo || !b.inicio || !b.fin) return 'apagado';
    var ahora = Date.now(), ini = Date.parse(b.inicio), fin = Date.parse(b.fin);
    if (isNaN(ini) || isNaN(fin) || ahora < ini) return 'apagado';
    return ahora <= fin ? 'abierto' : 'cerrado';
  };
  MY.enBF = function (p) { return MY.estadoBF() === 'abierto' && p.bf && p.estado === 'stock'; };
  // Un solo precio. El precio anterior tachado solo sale si hay precio_bf MENOR que precio (descuento real).
  MY.precioHTML = function (p) {
    if (MY.enBF(p) && p.precio_bf && p.precio && p.precio_bf < p.precio) {
      return '<span class="antes"><span class="salto">Antes </span>' + MY.pesos(p.precio) + '</span>' + MY.pesos(p.precio_bf);
    }
    var n = MY.enBF(p) && p.precio_bf ? p.precio_bf : p.precio;
    return n ? MY.pesos(n) : '<span class="sinprecio">Pregunta el precio</span>';
  };

  /* ---------- 3. WhatsApp y origen ---------- */
  // ?origen=instagram en el link de la bio se recuerda durante la visita y viaja en el mensaje.
  (function () {
    var o = '';
    try { o = (new URLSearchParams(location.search).get('origen') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20); } catch (e) {}
    if (o) { try { sessionStorage.setItem('my-origen', o); } catch (e) {} }
    else { try { o = sessionStorage.getItem('my-origen') || ''; } catch (e) {} }
    MY.origen = o;
  })();
  MY.numero = function () { return String((MY.datos.config || {}).whatsapp || CX.whatsapp || '573226759950').replace(/\D/g, ''); };
  MY.wa = function (texto) {
    var cola = MY.origen ? ' (Vengo de ' + MY.origen.charAt(0).toUpperCase() + MY.origen.slice(1) + ')' : '';
    return 'https://wa.me/' + MY.numero() + '?text=' + encodeURIComponent(texto + cola);
  };
  MY.nombreLargo = function (p) {
    return p.nombre + (p.marca && p.nombre.indexOf(p.marca) < 0 ? ' ' + p.marca : '') + (p.color ? ', color ' + p.color.toLowerCase() : '');
  };
  // Mensajes: uno distinto por lugar, para saber de dónde salió cada pedido.
  MY.msj = {
    general: function () { return 'Hola Medayork, vengo de la web y quiero hacer un pedido.'; },
    tallas: function () { return 'Hola Medayork, tengo una duda con la talla de una prenda.'; },
    producto: function (p, talla) {
      var t = talla || (p.tallas && p.tallas.length === 1 ? p.tallas[0] : (MY.unica(p) ? '' : '__'));
      var cola = ' (Ref. ' + p.ref + ')' + (t ? ', talla ' + t : '');
      if (MY.enBF(p)) return 'Hola Medayork, quiero del Black Friday: ' + MY.nombreLargo(p) + cola + '.';
      if (p.estado === 'stock') return 'Hola Medayork, quiero ' + MY.nombreLargo(p) + cola + '. ¿Está disponible?';
      return 'Hola Medayork, quiero encargar ' + MY.nombreLargo(p) + ' (Ref. ' + p.ref + '), talla ' + (talla || '__') + '.';
    },
    carrusel: function (p) { return 'Hola, vi en la web lo que llegó: ' + MY.nombreLargo(p) + ' (Ref. ' + p.ref + '). ¿Lo tienen?'; },
    seguimiento: function (c) { return 'Hola Medayork, quiero saber cómo va mi encargo' + (c ? ' ' + c : '') + '.'; }
  };
  // Pone el link correcto a todo <a data-wa="general|tallas">.
  MY.enlaces = function () {
    [].forEach.call(document.querySelectorAll('a[data-wa]'), function (a) {
      var f = MY.msj[a.getAttribute('data-wa')];
      if (f) { a.href = MY.wa(f()); a.target = '_blank'; a.rel = 'noopener'; }
    });
  };

  /* ---------- 4. Clics ---------- */
  // Anota en la pestaña "Clics": qué botón, en qué sección, qué Ref. y de qué red. Nada personal.
  MY.clic = function (boton, seccion, ref) {
    if (!MY.script || !window.fetch) return;
    try {
      fetch(MY.script, { method: 'POST', keepalive: true, body: JSON.stringify({ tipo: 'clic', boton: boton, seccion: seccion || '', ref: ref || '', origen: MY.origen }) }).catch(function () {});
    } catch (e) {}
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="wa.me"]') : null;
    if (!a) return;
    var zona = a.closest('[data-zona]'), sec = a.closest('section[id], header[id], dialog[id], nav, footer, .barra');
    MY.clic(a.getAttribute('data-b') || 'whatsapp',
      zona ? zona.getAttribute('data-zona') : (sec ? (sec.id || sec.className.split(' ')[0] || sec.tagName.toLowerCase()) : ''),
      a.getAttribute('data-ref') || '');
  });

  /* ---------- 5. Cloudflare Web Analytics (solo si pegaste el token en conexion.js) ---------- */
  if (CX.analytics_token && /^[a-f0-9]{20,}$/i.test(CX.analytics_token)) {
    var s = document.createElement('script');
    s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CX.analytics_token }));
    document.head.appendChild(s);
  }
})();
