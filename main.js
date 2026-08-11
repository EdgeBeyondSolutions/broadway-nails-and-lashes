(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); }
  }

  /* ---- Mobile nav ---- */
  function initNav() {
    var toggle = $(".nav-toggle");
    var mobileNav = $(".mobile-nav");
    if (!toggle || !mobileNav) return;
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("a", mobileNav).forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Smooth anchor scroll (native, robusto en todos los OS) ---- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href*="#"]') : null;
      if (!a) return;
      var url = new URL(a.href, window.location.href);
      if (url.pathname !== window.location.pathname) return;
      var id = url.hash;
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 88;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---- Reveal on scroll ---- */
  function initReveals() {
    var targets = $$(".reveal, .reveal-stagger");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });

    targets.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ---- Hero: carrusel de fondo con crossfade ---- */
  function initHeroCarousel() {
    var stage = $("[data-hero-carousel]");
    if (!stage) return;
    var slides = $$("img", stage);
    if (slides.length < 2) return;

    // Loop < 4s cuenta como "intrusivo" — respeta prefers-reduced-motion (queda fija la 1a foto)
    if (reduced) return;

    var current = 0;
    var timer = null;

    function goTo(next) {
      slides[current].classList.remove("is-active");
      slides[next].classList.add("is-active");
      current = next;
    }

    function tick() {
      goTo((current + 1) % slides.length);
    }

    function start() {
      if (timer) return;
      timer = setInterval(tick, 2800);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }

    start();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
  }

  /* ---- Header: sombra/estado al hacer scroll ---- */
  function initHeaderState() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Formulario de contacto (visual — sin backend en esta fase) ---- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    var status = $(".form-status", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (status) {
        status.textContent = "Thank you — this form is a design preview. In the build phase, it'll be connected to land straight in your inbox.";
        status.className = "form-status form-status--ok is-visible";
      }
      form.reset();
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initHeroCarousel, "initHeroCarousel");
    safe(initHeaderState, "initHeaderState");
    safe(initContactForm, "initContactForm");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
