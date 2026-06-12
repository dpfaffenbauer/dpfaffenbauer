/* =========================================================
   Dominik Pfaffenbauer — personal site
   Live GitHub stats · scroll reveal · hero mouse glow · timeline
   Ported from the Claude Design handoff component logic.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year + years-of-Pimcore stat ---------- */
  var now = new Date().getFullYear();
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = String(now);
  setText("[data-stat-years]", String(now - 2012));

  /* ---------- journey timeline ---------- */
  var journey = [
    { year: "2012", title: "First lines of Pimcore", text: "Starts working with Pimcore and goes self-employed as a Pimcore consultant and developer — the foundation for everything that follows." },
    { year: "2015", title: "CoreShop is born", text: "Starts CoreShop with a simple vision: make e-commerce with Pimcore great and fun. A side project becomes a platform businesses run on." },
    { year: "2018", title: "First-ever Most Valuable Pimconaut", text: "Pimcore introduces the MVP award — and hands the first one ever to Dominik, honoring years of contributions to the ecosystem.", accent: true },
    { year: "2021", title: "CORS GmbH is founded", text: "From solo consultant to company builder: CORS focuses on the most modern and advanced Pimcore projects — partnerships instead of billable hours." },
    { year: "2025", title: "Studionaut of the Year", text: "Awarded Pimcore Studionaut of the Year — and busy with more new ideas and ventures than ever. To be continued.", accent: true }
  ];
  var timeline = document.getElementById("timeline");
  if (timeline) {
    journey.forEach(function (step, i) {
      var li = document.createElement("li");
      li.className = "timeline__item";
      li.setAttribute("data-reveal", String(i));
      var year = document.createElement("span");
      year.className = "timeline__year";
      year.style.color = step.accent ? "var(--accent)" : "rgba(255,255,255,0.92)";
      year.textContent = step.year;
      var body = document.createElement("div");
      body.className = "timeline__body";
      var h3 = document.createElement("h3");
      h3.className = "timeline__title";
      h3.textContent = step.title;
      var p = document.createElement("p");
      p.className = "timeline__text";
      p.textContent = step.text;
      body.appendChild(h3);
      body.appendChild(p);
      li.appendChild(year);
      li.appendChild(body);
      timeline.appendChild(li);
    });
  }

  /* ---------- scroll reveal (staggered) ---------- */
  function setupReveals() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) {
      if (el.dataset.revealReady) return;
      el.dataset.revealReady = "1";
      var i = parseInt(el.getAttribute("data-reveal") || "0", 10);
      var delay = i * 90;
      el.style.transition =
        "opacity .7s ease " + delay + "ms, transform .7s cubic-bezier(.2,.8,.3,1) " + delay + "ms";
      io.observe(el);
    });
  }
  setupReveals();

  /* ---------- hero mouse glow ---------- */
  var hero = document.getElementById("top");
  var glow = document.getElementById("heroGlow");
  if (hero && glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      glow.style.transform =
        "translate(" + (e.clientX - rect.left - 400) + "px, " + (e.clientY - rect.top - 400) + "px)";
    });
  }

  /* ---------- live GitHub stats ---------- */
  function fmt(n) {
    if (n == null) return null;
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }
  function setText(sel, value) {
    if (value == null) return;
    document.querySelectorAll(sel).forEach(function (el) { el.textContent = value; });
  }

  fetch("https://api.github.com/users/dpfaffenbauer")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) return;
      setText("[data-stat-repos]", fmt(d.public_repos));
      setText("[data-stat-followers]", fmt(d.followers));
    })
    .catch(function () {});

  fetch("https://api.github.com/repos/coreshop/CoreShop")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) return;
      setText("[data-stars]", fmt(d.stargazers_count));
    })
    .catch(function () {});
})();
