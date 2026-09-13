# Portafolio — Gonzalo Quispe Fernández

Sitio estático hecho a mano con **HTML, CSS y JavaScript puro**. Sin frameworks, sin build, sin dependencias.
Se abre en cualquier navegador y se publica directo en GitHub Pages.

## Estructura

```
portfolio_v2/
├── index.html                  # Página principal (hero, sobre mí, experiencia, proyectos, skills, educación, contacto)
├── projects/                   # Una página de caso de estudio por proyecto
│   ├── laser-pointer.html
│   ├── practical-trading.html
│   ├── ansible-unsa.html
│   ├── hydroponics.html
│   ├── iot-soldadura.html
│   ├── medical-app.html
│   ├── adn-voladura.html
│   ├── template-hexagonal.html
│   └── mmorpg-research.html
├── assets/
│   ├── css/styles.css          # Todo el diseño
│   ├── js/main.js              # Interacciones mínimas (menú, reveal, año)
│   ├── img/                    # Foto y placeholders
│   └── cv/gonzalo-quispe-cv.pdf
└── .nojekyll                   # Necesario para GitHub Pages
```

## Ver el sitio en tu máquina

```bash
cd /home/chalius/projects/portfolio_v2
python3 -m http.server 8000
# abrir http://localhost:8000
```

(No hace falta build ni `npm install`. Ese era justamente el problema del sitio viejo.)

## Qué te falta llenar

Buscá en el código la palabra **TODO** (en el HTML aparecen como cajas violetas con borde punteado).
Todo lo que falta está marcado con la clase `ph`:

1. **Tu foto** — reemplazá `assets/img/photo.svg` por tu foto (cuadrada, ideal ~800x800).
2. **Párrafo personal** en la sección "Sobre mí" del `index.html`.
3. **Links de repositorio / demo** de cada proyecto: en cada página buscan `pegar URL`.
4. **Imágenes reales** en las galerías (hoy hay `placeholder.svg`).
5. **Métricas** en "Resultados e impacto" de cada proyecto.
6. **Medical App** y **MMORPG**: definir qué mostrar públicamente.
7. **Dominio**: cuando lo compres, actualizá los links de contacto y agregá el archivo `CNAME`.

El botón "Descargar CV" ya apunta a `assets/cv/gonzalo-quispe-cv.pdf`.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo (ej: `Chaliuz/portfolio`) o reutilizá `Chaliuz/portafolio`.
2. Subí el contenido de `portfolio_v2/` a la rama `main`.
3. En GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
4. Quedará en `https://chaliuz.github.io/<repo>/`.

### Con dominio propio

1. Creá un archivo `CNAME` en la raíz con tu dominio (una sola línea, ej: `gonzaloquispe.com`).
2. En el DNS del dominio, configurá los registros que indica GitHub Pages.
3. Activá "Enforce HTTPS" en la configuración de Pages.

## Sobre el sitio viejo

El portafolio anterior (`projects/portfolio/portfolio2/code/portafolio`) usaba React 16 + `node-sass 4.13`,
que no compila en Node moderno, y publicaba en una URL fea (`/portafolio/build/`). Este proyecto lo reemplaza.
