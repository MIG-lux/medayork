/* ============================================================================
   MEDAYORK · app.js — solo la página principal (index.html)
   ----------------------------------------------------------------------------
   Necesita js/datos.js cargado antes (objeto MY).
   Secciones de este archivo:
   1. Black Friday (cinta, sección y cuenta regresiva)
   2. Tarjetas y catálogo con filtros
   3. Carrusel "Llegó y está en hype"
   4. En hype: ranking, votos y muro
   5. Ficha de producto (etiqueta de equipaje) y enlaces directos #MY-0000
   6. Formulario de encargo, protección contra spam y pase de abordar
   7. Movimiento: sello, aparición, video, barra del celular
   8. Arranque
   Para cambiar productos, precios o Black Friday NO se toca este archivo: se cambia la hoja.
   ============================================================================ */
(function () {
  'use strict';
  var MY = window.MY, esc = MY.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var productos = [], votos = {}, yaPintado = false;
  var visibles = function () { return productos.filter(function (p) { return p.visible !== false; }); };
  var porRef = function (ref) { return visibles().filter(function (p) { return p.ref === String(ref).toUpperCase(); })[0]; };

  /* ---------- 1. Black Friday ---------- */
  var reloj;
  function pintaBF() {
    var e = MY.estadoBF(), abierto = e === 'abierto';
    $('#cinta').hidden = !abierto;
    $('#faq-bf').hidden = !abierto;
    $('#black-friday').hidden = e === 'apagado';
    $('#bf-abierto').hidden = !abierto;
    $('#bf-cerrado').hidden = e !== 'cerrado';
    clearInterval(reloj);
    if (!abierto) return;
    var fin = Date.parse(MY.datos.config.black_friday.fin);
    $('#bf-fecha').textContent = new Date(fin).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', timeZone: 'America/Bogota' });
    function tic() {
      var s = Math.floor((fin - Date.now()) / 1000);
      if (s <= 0) { pintaTodo(); return; }                     // al llegar a cero la sección se cierra sola
      $('#c-d').textContent = Math.floor(s / 86400);
      $('#c-h').textContent = Math.floor(s % 86400 / 3600);
      $('#c-m').textContent = Math.floor(s % 3600 / 60);
      $('#c-s').textContent = s % 60;
    }
    tic(); reloj = setInterval(tic, 1000);
  }

  /* ---------- 2. Tarjetas y catálogo ---------- */
  function textoEstado(p) {
    if (p.estado === 'agotado') return 'Agotado · pídelo por encargo';
    if (p.estado === 'stock') return 'En stock';
    return 'Bajo encargo';
  }
  function textoBoton(p) { return MY.enBF(p) ? 'Pedir en Black Friday' : (p.estado === 'stock' ? 'Pedir' : 'Pedir encargo'); }
  function altFoto(p) { return esc(p.nombre + (p.marca ? ' ' + p.marca : '') + (p.color ? ', color ' + p.color.toLowerCase() : '')); }
  function tarjeta(p) {
    var marca = p.marca ? esc(p.marca) : '&nbsp;';                 // sin marca confirmada no se muestra ninguna
    var tallas = esc(MY.textoTallas(p));
    return '<article class="card sube' + (yaPintado ? ' in' : '') + (p.estado === 'agotado' ? ' agotado' : '') + '">' +
      '<a class="foto" href="#' + esc(p.ref) + '" aria-label="Ver ' + altFoto(p) + '">' +
      '<img src="' + esc(MY.foto(p.fotos[0])) + '" alt="' + altFoto(p) + '" width="800" height="1000" loading="lazy" decoding="async">' +
      '<span class="ruta mono">' + (p.estado === 'stock' ? 'En Medellín' : (p.estado === 'agotado' ? 'Agotado' : 'JFK → MDE')) + '</span>' +
      (MY.enBF(p) ? '<span class="sello bf anim' : '<span class="sello anim') + (yaPintado ? ' in' : '') + '">' + (MY.enBF(p) ? 'Black Friday' : 'Original') + '</span></a>' +
      '<div class="mono" style="margin-top:12px">' + marca + '</div>' +
      '<h3><a href="#' + esc(p.ref) + '">' + esc(p.nombre) + '</a></h3>' +
      '<div class="mono"><span class="estado">' + textoEstado(p) + '</span></div>' +
      '<div class="pie">' +
      '<div class="dato mono"><span>Ref. ' + esc(p.ref) + '</span><span>' + esc(p.color || '') + '</span></div>' +
      '<div class="dato mono"><span>Talla' + (p.tallas && p.tallas.length > 1 ? 's' : '') + '</span><span>' + tallas + '</span></div>' +
      '<div class="dato mono"><span>' + (MY.enBF(p) ? 'Precio BF' : 'Precio') + '</span><span class="precio">' + MY.precioHTML(p) + '</span></div>' +
      '<a class="btn solid" data-b="producto" data-ref="' + esc(p.ref) + '" target="_blank" rel="noopener" href="' + esc(MY.wa(MY.msj.producto(p))) + '">' + textoBoton(p) + ' →</a>' +
      '</div></article>';
  }
  var filtros = {}, POR_TANDA = 16;                               // se muestran 16 y luego "Ver más"
  function pintaCatalogo() {
    $$('[data-seccion]').forEach(function (sec) {
      var nombre = sec.getAttribute('data-seccion');
      var lista = visibles().filter(function (p) { return p.seccion === nombre && p.fotos && p.fotos.length; });
      var f = filtros[nombre] || (filtros[nombre] = { cat: 'todo', estado: 'todo', limite: POR_TANDA });
      var unicos = function (campo) { return lista.map(function (p) { return p[campo]; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; }); };
      var chips = '<button class="chip" data-f="cat" data-v="todo">Todo</button>' +
        unicos('categoria').map(function (c) { return '<button class="chip" data-f="cat" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
      if (unicos('estado').length > 1) chips += '<button class="chip" data-f="estado" data-v="stock">En stock</button><button class="chip" data-f="estado" data-v="encargo">Bajo encargo</button>';
      var cont = $('[data-filtros]', sec); cont.innerHTML = chips;
      $$('.chip', cont).forEach(function (b) {
        var k = b.getAttribute('data-f'), v = b.getAttribute('data-v');
        b.setAttribute('aria-pressed', f[k] === v ? 'true' : 'false');
        b.addEventListener('click', function () { f[k] = (k === 'estado' && f[k] === v) ? 'todo' : v; f.limite = POR_TANDA; yaPintado = true; pintaCatalogo(); });
      });
      // "Bajo encargo" incluye lo agotado, porque lo agotado se pide por encargo.
      var ver = lista.filter(function (p) {
        return (f.cat === 'todo' || p.categoria === f.cat) && (f.estado === 'todo' || (f.estado === 'stock' ? p.estado === 'stock' : p.estado !== 'stock'));
      });
      var faltan = ver.length - f.limite;
      $('[data-rejilla]', sec).innerHTML = ver.length
        ? ver.slice(0, f.limite).map(tarjeta).join('') + (faltan > 0 ? '<div class="mas"><button class="btn" type="button" data-mas>Ver más · ' + faltan + ' prendas</button></div>' : '')
        : '<p class="vacio">Por ahora no hay productos aquí. Pídenos lo que buscas en "¿Qué quieres que traigamos?".</p>';
      var mas = $('[data-mas]', sec);
      if (mas) mas.addEventListener('click', function () { f.limite += POR_TANDA; yaPintado = true; pintaCatalogo(); });
    });
    observa();
  }

  /* ---------- 3. Carrusel ---------- */
  function pintaCarrusel() {
    var lista = visibles().filter(function (p) { return p.fotos && p.fotos.length && (p.nuevo || p.hype) && p.estado !== 'agotado'; });
    $('#llegadas').hidden = !lista.length;
    $('#carrusel').innerHTML = lista.map(function (p) {
      return '<a class="lleg" href="#' + esc(p.ref) + '">' +
        '<div class="foto"' + (p.seccion === 'mujer' ? ' style="background:var(--arcilla-l)"' : '') + '><img src="' + esc(MY.foto(p.fotos[0])) + '" alt="' + altFoto(p) + '" width="800" height="1000" loading="lazy" decoding="async">' +
        '<span class="et mono">' + (p.hype ? 'En hype' : 'Recién llegado') + '</span></div>' +
        '<h3>' + esc(p.nombre) + (p.marca ? ' ' + esc(p.marca) : '') + '</h3>' +
        '<div class="mono">' + MY.precioHTML(p) + ' · Ver →</div></a>';
    }).join('');
  }
  function mueveCarrusel() {
    var c = $('#carrusel'), auto;
    function paso(d) {
      var w = (c.firstElementChild ? c.firstElementChild.getBoundingClientRect().width : 260) + 14;
      if (d > 0 && c.scrollLeft + c.clientWidth >= c.scrollWidth - 4) c.scrollTo({ left: 0, behavior: 'smooth' });
      else c.scrollBy({ left: d * w, behavior: 'smooth' });
    }
    function para() { clearInterval(auto); auto = null; }
    $$('.flecha').forEach(function (b) { b.addEventListener('click', function () { para(); paso(+b.getAttribute('data-dir')); }); });
    ['pointerdown', 'touchstart', 'wheel', 'focusin', 'mouseenter'].forEach(function (ev) { c.addEventListener(ev, para, { passive: true }); });
    if (!MY.quieto && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en, io) {
        if (en[0].isIntersecting) { auto = setInterval(function () { paso(1); }, 3500); io.disconnect(); }
      }, { threshold: .5 }).observe(c);
    }
  }

  /* ---------- 4. En hype: ranking, votos y muro ---------- */
  function pintaHype() {
    var lista = visibles().filter(function (p) { return p.hype; });
    var hayVotos = Object.keys(votos).length > 0;          // los números solo salen si vienen de la hoja (reales)
    if (hayVotos) lista = lista.slice().sort(function (a, b) { return (votos[b.ref] || 0) - (votos[a.ref] || 0); });
    $('#ranking').innerHTML = lista.map(function (p, i) {
      var ya = MY.lee('voto-' + p.ref) === '1', n = votos[p.ref] || 0;
      return '<div class="rank sube' + (yaPintado ? ' in' : '') + '"><div class="n">' + (i < 9 ? '0' : '') + (i + 1) + '</div>' +
        '<div><h3><a href="#' + esc(p.ref) + '">' + esc(p.nombre) + '</a></h3><div class="mono meta">' + esc(p.marca || '') + ' · Bajo encargo · Ref. ' + esc(p.ref) +
        (hayVotos && n ? ' · ' + n + (n === 1 ? ' persona lo quiere' : ' personas lo quieren') : '') + '</div></div>' +
        '<div class="acc"><button class="btn voto" data-ref="' + esc(p.ref) + '" aria-pressed="' + ya + '">' + (ya ? 'Anotado ✓' : 'Yo también lo quiero') + '</button>' +
        '<a class="btn solid" data-b="hype" data-ref="' + esc(p.ref) + '" target="_blank" rel="noopener" href="' + esc(MY.wa(MY.msj.producto(p))) + '">Pedir encargo →</a></div></div>';
    }).join('');
    $$('.voto').forEach(function (b) {
      b.addEventListener('click', function () {
        var ref = b.getAttribute('data-ref');
        if (MY.lee('voto-' + ref) === '1') return;            // un voto por producto por navegador
        MY.guarda('voto-' + ref, '1'); b.setAttribute('aria-pressed', 'true'); b.textContent = 'Anotado ✓';
        if (MY.script) fetch(MY.script, { method: 'POST', body: JSON.stringify({ tipo: 'voto', ref: ref }) }).catch(function () {});
      });
    });
    // Muro: solo llega lo que el dueño marcó "aprobado" en la hoja. Siempre escapado.
    var muro = MY.datos.muro || [];
    $('#muro').hidden = !muro.length;
    $('#muro-i').innerHTML = muro.map(function (m) { return '<span class="nota-m"><b>' + esc(m.nombre) + '</b> · ' + esc(m.producto) + '</span>'; }).join('');
    observa();
  }

  /* ---------- 5. Ficha de producto (etiqueta de equipaje) ---------- */
  var ficha = $('#ficha'), tallaElegida = '';
  function abreFicha(ref) {
    var p = porRef(ref);
    if (!p) return false;
    var fotos = p.fotos || [];
    tallaElegida = p.tallas && p.tallas.length === 1 ? p.tallas[0] : '';
    var galeria = fotos.length
      ? '<div class="galeria"' + (p.seccion === 'mujer' ? ' style="background:var(--arcilla-l)"' : '') + ' tabindex="0" aria-label="Fotos del producto">' + fotos.map(function (f, i) {
          return '<img src="' + esc(MY.foto(f)) + '" alt="' + altFoto(p) + ', foto ' + (i + 1) + ' de ' + fotos.length + '" width="800" height="1000"' + (i ? ' loading="lazy"' : '') + '>'; }).join('') + '</div>' +
        (fotos.length > 1 ? '<div class="mono cuantas">Desliza · ' + fotos.length + ' fotos</div>' : '')
      : '<div class="sinfoto disp" aria-hidden="true">' + esc(p.nombre) + '</div>';
    var tallas = p.tallas && p.tallas.length
      ? '<div class="mono" id="t-rot">Elige tu talla</div><div class="tallas-b" role="group" aria-labelledby="t-rot">' + p.tallas.map(function (t) {
          return '<button class="chip" data-talla="' + esc(t) + '" aria-pressed="' + (t === tallaElegida) + '">' + esc(t) + '</button>'; }).join('') + '</div>'
      : (MY.unica(p) ? '<div class="mono">Talla única</div>' : '<div class="mono">Pregúntanos las tallas disponibles por WhatsApp</div>');
    $('#ficha-in').innerHTML =
      '<div class="eti-cab mono"><span>' + (p.estado === 'stock' ? 'En Medellín' : 'JFK → MDE') + '</span><span>Ref. ' + esc(p.ref) + '</span></div>' + galeria +
      '<div class="eti-cuerpo">' +
      '<div class="mono">' + [p.marca, p.color].filter(Boolean).map(esc).join(' · ') + '</div>' +
      '<h2 class="disp" id="ficha-t">' + esc(p.nombre) + '</h2>' +
      '<div class="mono"><span class="estado">' + textoEstado(p) + '</span></div>' +
      '<div class="dato mono"><span>' + (MY.enBF(p) ? 'Precio BF' : 'Precio') + '</span><span class="precio">' + MY.precioHTML(p) + '</span></div>' +
      '<div class="eti-tallas">' + tallas + '</div>' +
      '<a class="btn solid" id="ficha-pedir" data-b="ficha" data-ref="' + esc(p.ref) + '" target="_blank" rel="noopener" href="#">' + textoBoton(p) + ' →</a>' +
      '<button class="btn" id="ficha-compartir" type="button">Compartir</button>' +
      '<div class="eti-pie"><span class="barras" aria-hidden="true"></span><span class="sello' + (MY.enBF(p) ? ' bf' : '') + '">' + (MY.enBF(p) ? 'Black Friday' : 'Original') + '</span></div>' +
      '</div>';
    function enlace() { $('#ficha-pedir').href = MY.wa(MY.msj.producto(p, tallaElegida)); }
    enlace();
    $$('[data-talla]', ficha).forEach(function (b) {
      b.addEventListener('click', function () {
        tallaElegida = b.getAttribute('data-talla');
        $$('[data-talla]', ficha).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        enlace();
      });
    });
    $('#ficha-compartir').addEventListener('click', function () {
      var url = location.href.split('#')[0].split('?')[0] + '#' + p.ref, boton = this;
      var titulo = p.nombre + (p.marca ? ' ' + p.marca : '') + ' · Medayork';
      if (navigator.share) { navigator.share({ title: titulo, url: url }).catch(function () {}); return; }
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { boton.textContent = 'Link copiado ✓'; })
        .catch(function () { window.prompt('Copia este link:', url); });
    });
    if (!ficha.open) { if (ficha.showModal) ficha.showModal(); else ficha.setAttribute('open', ''); }
    MY.clic('ver-ficha', 'ficha', p.ref);
    return true;
  }
  function cierraFicha() { if (ficha.close) ficha.close(); else ficha.removeAttribute('open'); }
  function quitaHash() { if (/^#MY-\d+$/i.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); }
  function mirarHash() { if (/^#MY-\d+$/i.test(location.hash)) { if (!abreFicha(location.hash.slice(1))) quitaHash(); } else if (ficha.open) cierraFicha(); }
  ficha.addEventListener('close', quitaHash);
  ficha.addEventListener('click', function (e) { if (e.target === ficha || e.target.closest('[data-cerrar]')) cierraFicha(); });
  window.addEventListener('hashchange', mirarHash);

  /* ---------- 6. Formulario, antispam y pase de abordar ---------- */
  var MAX_ENVIOS = 3, VENTANA = 60 * 60 * 1000;                // máximo 3 encargos por hora desde un mismo navegador
  function enviosRecientes() {
    var l = []; try { l = JSON.parse(MY.lee('my-envios')) || []; } catch (e) {}
    return l.filter(function (t) { return Date.now() - t < VENTANA; });
  }
  // WhatsApp colombiano: 10 números que empiezan por 3 (acepta +57 adelante). Devuelve '' si no es válido.
  function celular(v) {
    var n = String(v).replace(/\D/g, '');
    if (n.length === 12 && n.indexOf('57') === 0) n = n.slice(2);
    return /^3\d{9}$/.test(n) ? n : '';
  }
  function pase(d, codigo) {
    var hoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).replace('.', '');
    return '<div class="pase" role="status">' +
      '<div class="pase-cab mono"><span>Pase de abordar</span><span>Medayork</span></div>' +
      '<div class="pase-ruta disp"><span>JFK</span><i aria-hidden="true">✈</i><span>MDE</span></div>' +
      '<div class="pase-g">' +
      '<div><span class="mono">Pasajero</span><b>' + esc(d.nombre.split(' ')[0]) + '</b></div>' +
      '<div><span class="mono">Fecha</span><b>' + esc(hoy) + '</b></div>' +
      '<div class="ancho"><span class="mono">Encargo</span><b>' + esc(d.producto.slice(0, 80)) + '</b></div>' +
      '<div><span class="mono">Talla</span><b>' + esc(d.talla || 'Por definir') + '</b></div>' +
      '<div><span class="mono">Estado</span><b>Recibido</b></div>' +
      '</div>' +
      '<div class="pase-corte"><span class="mono">Tu código</span><b class="disp">' + esc(codigo) + '</b><span class="barras" aria-hidden="true"></span><span class="sello">Original</span></div>' +
      '</div>' +
      '<p class="pase-nota">Tómale captura: con este código ves el estado en "Sigue tu encargo". Te escribimos con el precio final.</p>';
  }
  function formulario() {
    var f = $('#encargo'), err = $('#f-err'), ok = $('#f-ok'), campos = $('#f-campos'), boton = $('button[type=submit]', f);
    f.addEventListener('input', function () { err.textContent = ''; });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = {
        nombre: $('#f-nombre').value.trim(), whatsapp: celular($('#f-wa').value),
        producto: $('#f-producto').value.trim(), talla: $('#f-talla').value.trim(), para: $('#f-para').value,
        autorizo: $('#f-datos').checked, origen: MY.origen, web: $('#f-web').value       // "web" es el campo trampa
      };
      if (!d.nombre || !d.producto) { err.textContent = 'Escribe tu nombre y qué producto quieres.'; return; }
      if (!d.whatsapp) { err.textContent = 'Revisa tu WhatsApp: son 10 números y empieza por 3.'; return; }
      if (!d.autorizo) { err.textContent = 'Marca la casilla de autorización de datos para continuar.'; return; }
      var texto = 'Hola Medayork, quiero hacer un encargo.\nNombre: ' + d.nombre + '\nProducto: ' + d.producto + '\nTalla: ' + (d.talla || '__') + '\nPara: ' + d.para;
      // Si no hay hoja conectada, si hubo muchos envíos o si el envío falla: el pedido sale por WhatsApp y no se pierde.
      function aWhatsApp() { MY.clic('formulario-respaldo', 'hype', ''); location.href = MY.wa(texto); }
      var recientes = enviosRecientes();
      if (!MY.script || recientes.length >= MAX_ENVIOS) { aWhatsApp(); return; }
      boton.disabled = true; boton.textContent = 'Enviando…';
      fetch(MY.script, { method: 'POST', body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (!r || !r.ok || !r.codigo) throw new Error('sin guardar');
          recientes.push(Date.now()); MY.guarda('my-envios', JSON.stringify(recientes));
          campos.hidden = true; ok.hidden = false;
          ok.innerHTML = pase(d, r.codigo) +
            '<a class="btn solid" data-b="pase" target="_blank" rel="noopener" href="' + esc(MY.wa(texto + '\nCódigo: ' + r.codigo)) + '">Confirmar por WhatsApp →</a>' +
            '<a class="btn" href="seguimiento.html?codigo=' + encodeURIComponent(r.codigo) + '">Ver estado</a>' +
            '<button class="btn" type="button" id="f-otro">Hacer otro encargo</button>';
          $('#f-otro').addEventListener('click', function () { ok.hidden = true; ok.innerHTML = ''; campos.hidden = false; });
          f.reset(); ok.scrollIntoView({ block: 'nearest' });
        })
        .catch(aWhatsApp)
        .then(function () { boton.disabled = false; boton.textContent = 'Pedir encargo →'; });
    });
  }

  /* ---------- 7. Movimiento ---------- */
  var io;
  function observa() {
    var els = $$('.sube:not(.in), .sello.anim:not(.in)');
    if (!('IntersectionObserver' in window) || MY.quieto) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  // El video se pide después de que la página ya cargó, para no frenar la primera pantalla.
  function video() {
    var v = $('#video'), con = navigator.connection || {};
    if (MY.quieto || con.saveData || /2g/.test(con.effectiveType || '')) return;      // en esos casos queda solo la foto
    function pon() {
      v.src = matchMedia('(max-width:759px)').matches ? 'video/portada-v.mp4' : 'video/portada-h.mp4';
      v.addEventListener('playing', function () { v.hidden = false; }, { once: true });
      v.muted = true;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
    if (document.readyState === 'complete') setTimeout(pon, 1500);
    else window.addEventListener('load', function () { setTimeout(pon, 1500); });
  }
  // La barra fija del celular se esconde en la portada (ya hay botón) y sobre el formulario.
  function barra() {
    var b = $('#barra'), vis = {};
    if (!('IntersectionObserver' in window)) { b.classList.remove('fuera'); return; }
    var o = new IntersectionObserver(function (en) {
      en.forEach(function (x) { vis[x.target.id] = x.isIntersecting; });
      b.classList.toggle('fuera', !!(vis.portada || vis.encargo));
    }, { threshold: .15 });
    o.observe($('#encargo')); o.observe($('#portada'));
  }
  // Datos para Google: solo productos reales con foto, marca y precio.
  function datosProductos() {
    var viejo = $('#ld-productos'); if (viejo) viejo.remove();
    var items = visibles().filter(function (p) { return p.fotos && p.fotos.length && p.precio && p.marca; }).map(function (p) {
      return { '@type': 'Product', name: p.nombre + ' ' + p.marca, sku: p.ref, color: p.color, brand: { '@type': 'Brand', name: p.marca }, image: new URL(MY.foto(p.fotos[0]), location.href).href,
        offers: { '@type': 'Offer', priceCurrency: 'COP', price: (MY.enBF(p) && p.precio_bf) || p.precio,
          availability: 'https://schema.org/' + (p.estado === 'stock' ? 'InStock' : (p.estado === 'agotado' ? 'OutOfStock' : 'PreOrder')) } };
    });
    if (!items.length) return;
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-productos';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': items });
    document.head.appendChild(s);
  }

  /* ---------- 8. Arranque ---------- */
  function pintaTodo() {
    var c = MY.datos.config || {};
    productos = MY.datos.productos || []; votos = MY.datos.votos || {};
    if (c.frase_portada) $('#frase').textContent = c.frase_portada;
    if (c.instagram) $('#l-ig').href = c.instagram;
    if (c.tiktok) $('#l-tt').href = c.tiktok;
    MY.enlaces(); pintaBF(); pintaCarrusel(); pintaCatalogo(); pintaHype(); datosProductos();
    if (!yaPintado) mirarHash();
    yaPintado = true;
  }
  formulario(); mueveCarrusel(); barra(); video(); observa();
  MY.cargar(pintaTodo);
})();
