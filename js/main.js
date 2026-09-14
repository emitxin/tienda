/* ============================================================
 * Landing page — animaciones de scroll (JavaScript puro)
 * ============================================================ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Barra de progreso de scroll ---------- */
  const progressBar = document.getElementById("scrollProgress");
  function updateProgress() {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- 2. Navegación con fondo al hacer scroll ---------- */
  const nav = document.querySelector(".nav");
  function toggleNav() {
    nav.classList.toggle("nav--scrolled", window.scrollY > 60);
  }
  window.addEventListener("scroll", toggleNav, { passive: true });
  toggleNav();

  /* ---------- 3. Menú móvil ---------- */
  const burger = document.getElementById("burger");
  const navLinks = document.querySelector(".nav__links");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      navLinks.classList.remove("open");
    })
  );

  /* ---------- 4. Cursor personalizado ---------- */
  const cursor = document.getElementById("cursor");
  const cursorDot = document.getElementById("cursorDot");
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
  });

  function loop() {
    curX += (mouseX - curX) * 0.16;
    curY += (mouseY - curY) * 0.16;
    cursor.style.left = curX + "px";
    cursor.style.top = curY + "px";
    requestAnimationFrame(loop);
  }
  loop();

  if (!prefersReduced) {
    interface Logic {
      document.querySelectorAll("[data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursor.classList.add("cursor--active");
          cursor.setAttribute("data-label", el.dataset.cursor);
        });
        el.addEventListener("mouseleave", () => {
          cursor.classList.remove("cursor--active");
          cursor.removeAttribute("data-label");
        });
      });
    }
  }

  /* ---------- 5. Reveal al hacer scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- 6. Contadores animados ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          const duration = 1500;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          counterIO.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterIO.observe(c));

  /* ---------- 7. Parallax en los orbes del hero ---------- */
  if (!prefersReduced) {
    const orbs = document.querySelectorAll("[data-parallax]");
    window.addEventListener("scroll", () => {
      const offset = window.scrollY;
      orbs.forEach((orb) => {
        const speed = parseFloat(orb.dataset.parallax);
        orb.style.transform = "translateY(" + offset * speed + "px)";
      });
    }, { passive: true });
  }

  /* ---------- 8. Smooth scroll para enlaces internos ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      }
    });
  });
})();
