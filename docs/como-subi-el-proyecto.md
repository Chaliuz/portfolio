# Cómo subí el portafolio a GitHub y a mi dominio

Notas de estudio del proceso real de despliegue de este repositorio.
Servidor: GitHub Pages · Dominio: `gonzaloquispe.dev` · Sitio: HTML, CSS y JavaScript puro, sin build.

---

## Los tres conceptos que hay que tener claros

1. **git local y GitHub remoto son dos cosas distintas.** `git commit` guarda en mi máquina; `git push` manda a GitHub. Puedo commitear sin internet y subir después.
2. **El ciclo es `add` → `commit` → `push`.** `add` elige qué entra, `commit` le pone nombre y fecha, `push` lo publica.
3. **`gh api` es la web de GitHub en texto.** Todo lo que se hace con clics tiene un endpoint equivalente. Es la herramienta más subestimada del CLI.

---

## Etapa 0 — Verificar quién soy y qué tengo

```bash
gh --version
gh auth status
gh repo list --limit 30
```

| Comando | Qué hace |
|---|---|
| `gh --version` | Confirma que el CLI está instalado y en qué versión. |
| `gh auth status` | Con qué cuenta estoy logueado, por qué protocolo (SSH/HTTPS) y qué permisos tiene el token. Sin esto no sé si puedo crear repos. |
| `gh repo list --limit 30` | Lista mis repos. Lo usé para no chocar con el repo viejo `portafolio` y confirmar que `portfolio` estaba libre. |

---

## Etapa 1 — Preparar el proyecto para git

```bash
git config --global user.name
git config --global user.email
```
Lee la identidad que firma cada commit. Si está vacía, el commit falla.

```bash
cd /home/chalius/projects/portfolio_v2
```
Entrar a la carpeta del proyecto: **git siempre trabaja sobre el directorio donde estoy parado**.

```bash
printf 'gonzaloquispe.dev\n' > CNAME
```
Crea el archivo `CNAME` con el dominio. GitHub Pages lo lee para saber qué dominio propio sirve este repo. **Este archivo tiene que estar en el repo**, no es solo un ajuste de la web.

También creé `.gitignore` para decirle a git qué **no** versionar (`.DS_Store`, `Thumbs.db`, `.vscode/`, logs, temporales).

```bash
git init -b main
```
**Convierte la carpeta en un repositorio**: crea `.git/`, donde vive toda la historia. El `-b main` fija el nombre de la rama inicial.

```bash
git add -A
```
**Prepara** (staging) todos los archivos para el próximo commit. Es el paso intermedio entre "modifiqué archivos" y "guardo una foto del proyecto". `-A` = todos, incluidos nuevos y borrados.

```bash
git commit -q -m "Título del commit" -m "Cuerpo con el detalle."
```
**Guarda la foto** del proyecto. El `-m` se puede repetir: el primero es el título, el segundo el cuerpo. `-q` silencia el ruido de salida.

```bash
git log --oneline
git status --short --branch
git ls-files | wc -l
```

| Comando | Qué hace |
|---|---|
| `git log --oneline` | Historial compacto, un commit por línea. |
| `git status --short --branch` | Si hay cambios sin commitear y en qué rama estoy. Si dice `nothing to commit, working tree clean`, todo está guardado. |
| `git ls-files \| wc -l` | Cuenta cuántos archivos quedaron versionados. |

---

## Etapa 2 — Crear el repo remoto y subirlo

```bash
gh repo create Chaliuz/portfolio --public --source=. --remote=origin --push --description "Descripción del repo."
```

Este es el comando clave porque **hace tres cosas de una**:

| Parte | Qué significa |
|---|---|
| `gh repo create Chaliuz/portfolio` | Crea el repositorio en GitHub con ese nombre. |
| `--public` | Público (obligatorio para Pages gratis). |
| `--source=.` | "Usá la carpeta actual como fuente" del repo. |
| `--remote=origin` | Agrega el remoto con el nombre `origin` (la convención universal para "el repo de donde vengo"). |
| `--push` | **Sube** la rama actual con su historial. Sin esto el repo queda vacío. |
| `--description "..."` | La descripción que se ve arriba en la página del repo. |

Por debajo equivale a esto:
```bash
git remote add origin git@github.com:Chaliuz/portfolio.git
git branch -M main
git push -u origin main
```
- `git remote add origin <url>` → le dice a git **a dónde** subir.
- `git push` → manda mis commits al remoto.
- `-u` (upstream) → deja la rama local vinculada a la remota, así después basta con `git push` sin argumentos.

Verificación:
```bash
git remote -v
gh repo view Chaliuz/portfolio --json name,visibility,defaultBranchRef,url
gh api repos/Chaliuz/portfolio/contents --jq '.[].name'
```

| Comando | Qué hace |
|---|---|
| `git remote -v` | Ver a qué URLs apunta `origin`. |
| `gh repo view ... --json ... --jq ...` | Consultar la API y traer datos del repo sin parsear HTML. |
| `gh api repos/<usuario>/<repo>/contents --jq '.[].name'` | Listar los archivos que **realmente** están en GitHub, para confirmar que el push subió lo que creía. |

---

## Etapa 3 — Encender GitHub Pages

```bash
gh api repos/Chaliuz/portfolio/pages
```
Consulta si Pages **ya** está activado. Devolvió `404 Not Found` = no lo estaba.

```bash
gh api repos/Chaliuz/portafolio/pages
```
Lo mismo sobre el repo viejo, para ver cómo estaba configurado. **Consultar antes de tocar** es la mejor costumbre: dice el estado real sin adivinar.

```bash
gh api -X POST repos/Chaliuz/portfolio/pages -f "source[branch]=main" -f "source[path]=/"
```
**Activa Pages** indicando la fuente: rama `main`, ruta raíz. `-X POST` es el método HTTP para *crear*. La sintaxis `source[branch]` es cómo `gh` manda objetos anidados en formularios.

```bash
gh api -X PUT repos/Chaliuz/portfolio/pages -f cname=gonzaloquispe.dev
```
`PUT` = actualizar. Setea el dominio propio. Igual ya lo había tomado solo, leyendo el archivo `CNAME` del repo: son dos caminos al mismo lugar.

```bash
gh api repos/Chaliuz/portfolio/pages/builds/latest --jq '{status,error,duration}'
gh api -X POST repos/Chaliuz/portfolio/pages/builds
```
| Comando | Qué hace |
|---|---|
| `.../builds/latest` | Ver si el último **build** de Pages terminó bien o con error. |
| `-X POST .../builds` | **Forzar un rebuild**, útil cuando cambié algo y quiero que se regenere ya. |

---

## El comando que uso todos los días

Cuando cambio algo en el sitio, el ciclo completo es **uno solo**:

```bash
git add -A && git commit -m "mensaje" && git push origin main
```

- `git add -A` → preparar todo lo que cambié.
- `git commit -m` → guardar la foto con un mensaje.
- `git push origin main` → publicar. GitHub Pages reconstruye el sitio solo, en ~20 segundos.

**Regla de oro del mensaje:** que diga **qué** cambió y **por qué**. No "cambios varios". Un buen historial es lo que después te salva cuando algo se rompe:

```bash
git log --oneline     # ver qué hice
git show <hash>       # ver el detalle de un commit
```

---

## Etapa 4 — Verificar que el dominio responde

```bash
dig +short A gonzaloquispe.dev
dig +short @1.1.1.1 A gonzaloquispe.dev
dig +short @vida.ns.cloudflare.com A gonzaloquispe.dev
dig CAA gonzaloquispe.dev
```

| Comando | Qué hace |
|---|---|
| `dig +short A <dominio>` | Pregunta la IP usando **mi** resolución local (puede estar cacheada). |
| `dig @1.1.1.1 ...` | Pregunta a un resolver público (Cloudflare, o `8.8.8.8` de Google). Sirve para descartar cache local. |
| `dig @<ns> ...` | Le pregunta **directo al servidor autoritativo**. Si acá está el registro, el problema no es mío. |
| `dig CAA <dominio>` | Verifica si hay una política que le prohíba a Let's Encrypt emitir certificados. Sin CAA = permiso. |

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" --resolve gonzaloquispe.dev:443:185.199.108.153 https://gonzaloquispe.dev/
```
`curl --resolve` fuerza a curl a usar esa IP para ese dominio, **como si el DNS ya hubiera propagado**. Es la forma de probar el sitio antes de que mi máquina lo vea.

```bash
echo | openssl s_client -connect 185.199.108.153:443 -servername gonzaloquispe.dev | openssl x509 -noout -subject -dates
```
Consulta el **certificado TLS** y muestra para qué dominio fue emitido y hasta cuándo vale.

---

## Etapa 5 — Previsualizar sin subir nada

```bash
cd /home/chalius/projects/portfolio_v2 && python3 -m http.server 8000
```
Levanta un servidor web **local** en el puerto 8000 para ver el sitio tal como se vería publicado. Después abro `http://localhost:8000`.

---

## Los registros DNS (en Cloudflare)

Para que el dominio apunte a GitHub Pages, en el panel de Cloudflare:

| Tipo | Nombre | Contenido |
|---|---|---|
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `AAAA` | `@` | `2606:50c0:8000::153` |
| `AAAA` | `@` | `2606:50c0:8001::153` |
| `AAAA` | `@` | `2606:50c0:8002::153` |
| `AAAA` | `@` | `2606:50c0:8003::153` |
| `CNAME` | `www` | `chaliuz.github.io` |

**Lo crítico:** todos en **DNS only (nube gris)**, NO proxied (naranja). Con la nube naranja, Cloudflare se pone en el medio y GitHub no puede emitir el certificado HTTPS.
**Y no tocar el modo SSL/TLS:** ponerlo en "Flexible" crea un loop de redirecciones.

---

## Resumen mínimo (si algún día lo hago de cero)

```bash
cd carpeta-del-proyecto          # 1. entrar
git init -b main                 # 2. convertirlo en repo
git add -A                       # 3. preparar todos los archivos
git commit -m "primer commit"    # 4. guardar la foto
gh repo create mi-repo --public --source=. --remote=origin --push   # 5. crear y subir
```

Después, solo cuando necesite página web:
```bash
gh api -X POST repos/<usuario>/<repo>/pages -f "source[branch]=main" -f "source[path]=/"
```

---

## Errores que ya cometí (para no repetirlos)

- **Poner el dominio propio antes de que existan los registros DNS.** El sitio queda inaccesible también en la URL de GitHub, porque redirige al dominio que todavía no resuelve. Si necesito previsualizar en ese estado, uso el servidor local del paso 5.
- **Asumir que un `CNAME` en el repo alcanza.** Hacen falta los registros DNS del otro lado.
- **Confiar en la memoria para las IPs de GitHub Pages.** Cambian: hay que mirarlas en la pantalla de Settings → Pages del repo. (Las de arriba están verificadas contra este sitio.)
