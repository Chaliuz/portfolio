/* Portfolio — interacciones mínimas, sin dependencias. */
(function () {
  "use strict";

  // Modo desarrollo: muestra los placeholders de contenido agregando "?dev" a la URL.
  if (/[?&]dev(?:[=&]|$)/.test(location.search) || location.hash === "#dev") {
    document.documentElement.classList.add("dev");
    if (window.console) console.info("[portfolio] Modo dev: placeholders visibles. Quitalo de la URL para ver la versión pública.");
  }

  // Menú móvil
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  // Año dinámico en el footer
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Resalta el link activo del nav según la sección visible
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.style.color = a.getAttribute("href") === "#" + entry.target.id ? "var(--accent)" : "";
        });
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();

/* Visor de imágenes (lightbox) con zoom — sin dependencias. */
(function () {
  "use strict";

  var SELECTOR = ".gallery img, .project .media img, .about-grid .photo img";
  var images = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
  if (!images.length) return;

  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Visor de imágenes");
  overlay.innerHTML =
    '<button class="lb-btn lb-close" aria-label="Cerrar">✕</button>' +
    '<button class="lb-btn lb-nav lb-prev" aria-label="Imagen anterior">‹</button>' +
    '<button class="lb-btn lb-nav lb-next" aria-label="Imagen siguiente">›</button>' +
    '<figure class="lb-stage">' +
    '  <img class="lb-img" alt="">' +
    '  <figcaption class="lb-caption"></figcaption>' +
    '</figure>' +
    '<div class="lb-toolbar">' +
    '  <button class="lb-btn lb-zoom-out" aria-label="Alejar">−</button>' +
    '  <button class="lb-btn lb-zoom-reset" aria-label="Restablecer zoom">100%</button>' +
    '  <button class="lb-btn lb-zoom-in" aria-label="Acercar">+</button>' +
    '  <span class="lb-counter"></span>' +
    '</div>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector(".lb-img");
  var capEl = overlay.querySelector(".lb-caption");
  var counterEl = overlay.querySelector(".lb-counter");
  var stageEl = overlay.querySelector(".lb-stage");
  var resetBtn = overlay.querySelector(".lb-zoom-reset");
  var index = 0, scale = 1, tx = 0, ty = 0, dragging = false, startX = 0, startY = 0;

  function captionFor(img) {
    var fig = img.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    return (cap ? cap.textContent.trim() : "") || img.alt || "";
  }

  function paint() {
    imgEl.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
    resetBtn.textContent = Math.round(scale * 100) + "%";
  }

  function reset() { scale = 1; tx = 0; ty = 0; paint(); }

  function show(i) {
    index = (i + images.length) % images.length;
    var img = images[index];
    imgEl.src = img.currentSrc || img.src;
    imgEl.alt = img.alt || "";
    capEl.textContent = captionFor(img);
    counterEl.textContent = (index + 1) + " / " + images.length;
    reset();
  }

  function open(i) {
    show(i);
    overlay.classList.add("open");
    document.body.classList.add("lb-lock");
    overlay.querySelector(".lb-close").focus();
  }

  function close() {
    overlay.classList.remove("open");
    document.body.classList.remove("lb-lock");
  }

  function zoom(delta) {
    scale = Math.min(6, Math.max(1, Math.round((scale + delta) * 100) / 100));
    if (scale === 1) { tx = 0; ty = 0; }
    paint();
  }

  images.forEach(function (img, i) {
    img.classList.add("zoomable");
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      open(i);
    });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
    });
  });

  overlay.querySelector(".lb-close").addEventListener("click", close);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay || e.target === stageEl) close();
  });
  overlay.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(index - 1); });
  overlay.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(index + 1); });
  overlay.querySelector(".lb-zoom-in").addEventListener("click", function (e) { e.stopPropagation(); zoom(0.5); });
  overlay.querySelector(".lb-zoom-out").addEventListener("click", function (e) { e.stopPropagation(); zoom(-0.5); });
  resetBtn.addEventListener("click", function (e) { e.stopPropagation(); reset(); });

  // Zoom con la rueda del mouse
  imgEl.addEventListener("wheel", function (e) {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 0.25 : -0.25);
  }, { passive: false });

  // Doble clic para acercar/restablecer
  imgEl.addEventListener("dblclick", function (e) {
    e.preventDefault();
    if (scale > 1) reset(); else zoom(1);
  });

  // Arrastrar para moverse cuando hay zoom
  imgEl.addEventListener("mousedown", function (e) {
    if (scale <= 1) return;
    dragging = true; startX = e.clientX - tx; startY = e.clientY - ty;
    imgEl.classList.add("grabbing");
    e.preventDefault();
  });
  window.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    tx = e.clientX - startX; ty = e.clientY - startY; paint();
  });
  window.addEventListener("mouseup", function () { dragging = false; imgEl.classList.remove("grabbing"); });

  // Teclado
  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "+" || e.key === "=") zoom(0.5);
    else if (e.key === "-") zoom(-0.5);
    else if (e.key === "0") reset();
  });

  // Deslizar en pantallas táctiles para navegar
  var touchX = null;
  overlay.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  overlay.addEventListener("touchend", function (e) {
    if (touchX === null || scale > 1) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });
})();

