"""Servidor de PRUEBA para Medayork (no se publica).

Sirve la página en http://localhost:8765 e imita a la hoja de Google en /hoja,
con la misma lógica de apps-script/Code.gs, para probar encargos, votos, clics
y seguimiento sin tocar la hoja real. Los datos viven en memoria y se pierden al cerrar.

Uso:   python herramientas/servidor-prueba.py
Luego: en datos/conexion.js poner  script_url: "/hoja"  SOLO para probar.
/nojs/ sirve las mismas páginas con JavaScript bloqueado.
"""
import json, re, sys, datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 8765

def respaldo():
    t = (RAIZ / "datos" / "respaldo.js").read_text(encoding="utf-8")
    return json.loads(t[t.index("{"): t.rindex("}") + 1])

BASE = respaldo()
# Diferencias a propósito, para comprobar que la página usa la hoja y no el respaldo:
for p in BASE["productos"]:
    if p["ref"] == "MY-0103":
        p["estado"] = "agotado"
BASE["config"]["frase_portada"] = "Lo original viaja con nosotros."
ENCARGOS = [{"codigo": "MY-1001", "nombre": "Laura Gómez", "producto": "Jordan 4 Military Black", "estado": "En camino",
             "nota": "Sale de Nueva York este viernes.", "muro": "aprobado", "fecha": "2026-11-14T10:00:00-05:00"},
            {"codigo": "MY-1002", "nombre": "<b>Robot</b>", "producto": "<script>alert(1)</script> groseria", "estado": "Recibido",
             "nota": "", "muro": "", "fecha": "2026-11-15T10:00:00-05:00"},
            {"codigo": "MY-1003", "nombre": "Santi <i>R</i>", "producto": "Samba OG <img src=x onerror=alert(1)>", "estado": "Recibido",
             "nota": "", "muro": "aprobado", "fecha": "2026-11-15T12:00:00-05:00"}]
VOTOS = ["MY-0304", "MY-0304", "MY-0301"]
CLICS = []

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(RAIZ), **k)

    def _json(self, o):
        b = json.dumps(o, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def end_headers(self):
        if getattr(self, "_nojs", False):
            self.send_header("Content-Security-Policy", "script-src 'none'")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        if u.path == "/hoja":
            if "codigo" in q:
                c = q["codigo"][0].upper().strip()
                e = next((x for x in ENCARGOS if x["codigo"] == c), None)
                return self._json({"ok": True, "estado": e["estado"], "nota": e["nota"], "fecha": e["fecha"]} if e else {"ok": False})
            if "datos" in q:
                conteo = {}
                for v in VOTOS:
                    conteo[v] = conteo.get(v, 0) + 1
                muro = [{"nombre": e["nombre"].split(" ")[0][:20], "producto": e["producto"][:50]} for e in ENCARGOS if e["muro"] == "aprobado"][-12:][::-1]
                return self._json({"ok": True, "config": BASE["config"], "productos": BASE["productos"], "votos": conteo, "muro": muro})
            if "ver" in q:  # solo del servidor de prueba: para revisar qué se guardó
                return self._json({"encargos": ENCARGOS, "votos": VOTOS, "clics": CLICS})
            return self._json({"ok": False})
        if u.path.startswith("/nojs/"):
            self._nojs = True
            self.path = self.path[5:]
        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/hoja":
            return self.send_error(404)
        try:
            d = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))).decode("utf-8"))
        except Exception:
            return self._json({"ok": False, "error": "datos"})
        if d.get("tipo") == "voto":
            ref = str(d.get("ref", "")).upper()[:12]
            if not re.match(r"^MY-\d{3,5}$", ref):
                return self._json({"ok": False})
            VOTOS.append(ref)
            return self._json({"ok": True})
        if d.get("tipo") == "clic":
            CLICS.append({k: str(d.get(k, ""))[:30] for k in ("boton", "seccion", "ref", "origen")})
            return self._json({"ok": True})
        if d.get("web"):
            return self._json({"ok": True, "codigo": "MY-0000"})
        if not d.get("autorizo"):
            return self._json({"ok": False, "error": "sin autorización"})
        wa = re.sub(r"\D", "", str(d.get("whatsapp", "")))
        if len(wa) == 12 and wa.startswith("57"):
            wa = wa[2:]
        nombre, producto = str(d.get("nombre", "")).strip()[:60], str(d.get("producto", "")).strip()[:300]
        if not nombre or not producto or not re.match(r"^3\d{9}$", wa):
            return self._json({"ok": False, "error": "datos incompletos"})
        codigo = "MY-%d" % (max(int(e["codigo"][3:]) for e in ENCARGOS) + 1)
        ENCARGOS.append({"codigo": codigo, "nombre": nombre, "whatsapp": wa, "producto": producto, "talla": str(d.get("talla", ""))[:20],
                         "para": str(d.get("para", ""))[:20], "origen": str(d.get("origen", ""))[:20], "estado": "Recibido", "nota": "", "muro": "",
                         "fecha": datetime.datetime.now().isoformat()})
        return self._json({"ok": True, "codigo": codigo})

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    print("Medayork de prueba en http://localhost:%d" % PUERTO)
    ThreadingHTTPServer(("127.0.0.1", PUERTO), H).serve_forever()
