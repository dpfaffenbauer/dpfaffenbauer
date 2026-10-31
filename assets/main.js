/* =========================================================
   Dominik Pfaffenbauer — personal site
   Hero branch graph · journey log graph · live GitHub stats
   ========================================================= */
(function () {
  "use strict";

  var SVG = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var today = new Date();
  var NOW = today.getFullYear() + (today.getMonth() + today.getDate() / 31) / 12;

  /* ---------- footer year + years-of-Pimcore stat ---------- */
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = String(today.getFullYear());
  setText("[data-stat-years]", String(today.getFullYear() - 2012));

  /* =========================================================
     Shared data: one trunk, branches per company
     ========================================================= */
  var LANES = {
    trunk:    { pos: 0,  col: 0, color: "var(--trunk)",    label: "Pimcore & open source", short: "Open source",   href: "#engineer" },
    coreshop: { pos: -1, col: 1, color: "var(--coreshop)", label: "CoreShop GmbH",         short: "CoreShop",      href: "#coreshop", from: 2014.75 },
    cors:     { pos: 1,  col: 2, color: "var(--cors)",     label: "CORS GmbH",             short: "CORS",          href: "#cors",     from: 2020.7 },
    mamado:   { pos: 2,  col: 3, color: "var(--mamado)",   label: "mamado GmbH",           short: "mamado",        href: "#mamado",   from: 2025.7, cross: true, run: 14 },
    making:   { pos: -2, col: 4, color: "var(--making)",   label: "In the making",         short: "In the making", href: "#making",   from: 2024.6, cross: true, dashed: true, run: 46 }
  };

  // Hero commits. "start" means: place on the end of the fork curve.
  var COMMITS = [
    { lane: "trunk",    t: 2012.15, title: "2012: first lines of Pimcore" },
    { lane: "trunk",    t: 2013.3,  title: "2013: going self-employed" },
    { lane: "coreshop", start: true, title: "2015: CoreShop is born" },
    { lane: "trunk",    t: 2018.35, title: "2018: first-ever Most Valuable Pimconaut", award: true },
    { lane: "cors",     start: true, title: "2021: CORS GmbH is founded" },
    { lane: "coreshop", t: 2021.45, title: "2021: CoreShop GmbH is founded" },
    { lane: "cors",     t: 2021.85, title: "2021: part of the E-CONOMIX Group" },
    { lane: "trunk",    t: 2025.3,  title: "2025: Pimcore Studionaut of the Year", award: true },
    { lane: "mamado",   start: true, title: "2026: co-founds mamado GmbH" }
  ];
  var VENTURES = ["OpenArch", "Amber", "Captain", "Eichhorn", "Pimcore Voyager", "Susi", "NMA"];

  var JOURNEY = [
    { year: "2012", lane: "trunk",    title: "First lines of Pimcore", text: "Starts working with Pimcore — the foundation for everything that follows." },
    { year: "2013", lane: "trunk",    title: "Going self-employed", text: "Becomes a self-employed Pimcore consultant and developer, turning a passion into a profession." },
    { year: "2015", lane: "coreshop", title: "CoreShop is born", text: "Starts CoreShop with a simple vision: make e-commerce with Pimcore great and fun. A side project becomes a platform businesses run on." },
    { year: "2018", lane: "trunk",    title: "First-ever Most Valuable Pimconaut", text: "Pimcore introduces the MVP award — and hands the first one ever to Dominik, honoring years of contributions to the ecosystem.", award: true },
    { year: "2021", lane: "cors",     title: "CORS GmbH is founded", text: "From solo consultant to company builder: CORS focuses on the most modern and advanced Pimcore projects — partnerships instead of billable hours." },
    { year: "2021", lane: "coreshop", title: "CoreShop GmbH is founded", text: "CoreShop gets its own company — the home for the open-code e-commerce platform and the businesses that run on it." },
    { year: "2021", lane: "cors",     title: "Part of the E-CONOMIX Group", text: "CORS becomes part of the E-CONOMIX Group, bringing Pimcore expertise into a larger digital ecosystem." },
    { year: "2025", lane: "trunk",    title: "Studionaut of the Year", text: "Awarded Pimcore Studionaut of the Year — recognition for years of work in the ecosystem.", award: true },
    { year: "2026", lane: "mamado",   title: "Co-founder of mamado GmbH", text: "Co-founds mamado GmbH — a new venture taking shape beyond the Pimcore world." },
    { year: "2026", lane: "making",   title: "Amber Fitness", text: "An AI-powered calorie and training tracking app for iOS — with an AI coach at its core — starts to take form.", open: true },
    { year: "2026", lane: "making",   title: "Captain ⎈", text: "A full Kubernetes client for iOS: multi-cluster, live logs, Helm, GitOps and native cloud auth, right from your phone.", open: true }
  ];

  /* =========================================================
     Hero graph
     ========================================================= */
  var graph = document.getElementById("graph");
  var canvas = document.getElementById("graphCanvas");

  function el(name, attrs, parent) {
    var node = document.createElementNS(SVG, name);
    for (var k in attrs) if (attrs[k] != null) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function drawGraph(animate) {
    if (!canvas) return;
    var W = Math.round(canvas.clientWidth);
    if (!W) return;

    var narrow = W < 640;
    var gap = narrow ? 26 : 40;           // vertical lane spacing
    var labelW = narrow ? 100 : 196;      // terminus label column
    var top = 14, axisH = 30;
    var H = top * 2 + gap * 4 + axisH;
    var y0 = top + gap * 2;               // trunk y

    var T0 = 2011.85;
    var x0 = 8, xEnd = W - labelW;
    var pxYear = (xEnd - x0) / (NOW - T0);
    function X(t) { return x0 + (t - T0) * pxYear; }
    function Y(lane) { return y0 + LANES[lane].pos * gap; }

    var svg = el("svg", {
      width: W, height: H, viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Branch graph of Dominik's career from 2012 until today: a Pimcore and open-source trunk, CoreShop branching off in 2015, CORS in 2021, mamado in 2026, and seven products in the making."
    });

    /* year grid + axis */
    var axisY = H - 8;
    var majors = [2012, 2015, 2018, 2021, 2025];
    var gGrid = el("g", {}, svg);
    for (var yr = 2012; yr <= Math.floor(NOW); yr++) {
      var gx = X(yr);
      var isMajor = majors.indexOf(yr) !== -1;
      if (isMajor) el("line", { x1: gx, x2: gx, y1: top - 6, y2: H - axisH + 4, "class": "g-grid" }, gGrid);
      if (isMajor || pxYear >= 56) {
        var tx = el("text", { x: gx, y: axisY, "class": "g-year" }, gGrid);
        tx.textContent = String(yr);
      }
    }

    /* branch geometry */
    var forkEnds = {};
    function branchPath(key) {
      var L = LANES[key];
      var ly = Y(key), dy = Math.abs(ly - y0);
      var fw = dy * (narrow ? 0.6 : 0.8);
      var fx = Math.min(X(L.from), xEnd - fw - (L.run || 10)); // keep late forks readable
      var ex = fx + fw;
      forkEnds[key] = ex;
      return {
        curve: "M" + fx + " " + y0 + " C" + (fx + fw * 0.55) + " " + y0 + " " + (fx + fw * 0.45) + " " + ly + " " + ex + " " + ly,
        full: "M" + fx + " " + y0 + " C" + (fx + fw * 0.55) + " " + y0 + " " + (fx + fw * 0.45) + " " + ly + " " + ex + " " + ly + " L" + xEnd + " " + ly
      };
    }

    var gLines = el("g", {}, svg);
    ["cors", "coreshop", "mamado", "making"].forEach(function (key) {
      var L = LANES[key];
      var p = branchPath(key);
      if (L.cross) el("path", { d: p.curve, "class": "g-halo" }, gLines);
      el("path", { d: p.full, "class": "g-line" + (L.dashed ? " g-line--dash" : ""), stroke: L.color }, gLines);
    });
    // trunk on top so every fork grows out of it cleanly
    var trunkStart = X(COMMITS[0].t);
    el("path", { d: "M" + trunkStart + " " + y0 + " L" + xEnd + " " + y0, "class": "g-line", stroke: LANES.trunk.color }, gLines);

    /* nodes */
    var gNodes = el("g", {}, svg);
    var lastX = {};
    var sweep = W + 20, dur = 1.7;
    function delay(x) { return (dur * x / sweep).toFixed(3) + "s"; }

    COMMITS.forEach(function (c) {
      var L = LANES[c.lane];
      var cx = c.start ? forkEnds[c.lane] : X(c.t);
      if (lastX[c.lane] != null && cx - lastX[c.lane] < 15) return; // too tight on small screens
      lastX[c.lane] = cx;
      var cy = Y(c.lane);
      var g = el("g", { "class": "g-pop", style: "--t:" + delay(cx) }, gNodes);
      if (c.award) {
        el("circle", { cx: cx, cy: cy, r: 8, "class": "g-node--award" }, g);
        el("circle", { cx: cx, cy: cy, r: 3, "class": "g-dot" }, g);
      } else {
        el("circle", { cx: cx, cy: cy, r: 6.5, "class": "g-node", fill: L.color }, g);
      }
      el("title", {}, g).textContent = c.title;
    });

    // ventures: hollow nodes spread along the dashed lane
    var vy = Y("making");
    var vStart = forkEnds.making + 6, vEnd = xEnd - 6;
    var count = Math.max(2, Math.min(VENTURES.length, Math.floor((vEnd - vStart) / 13) + 1));
    for (var i = 0; i < count; i++) {
      var vx = count === 1 ? vStart : vStart + (vEnd - vStart) * i / (count - 1);
      var vg = el("g", { "class": "g-pop", style: "--t:" + delay(vx) }, gNodes);
      el("circle", { cx: vx, cy: vy, r: 4, "class": "g-open" }, vg);
      el("title", {}, vg).textContent = count === VENTURES.length ? VENTURES[i] + " (in the making)" : "In the making: " + VENTURES.join(", ");
    }

    /* terminus labels */
    var gLabels = el("g", {}, svg);
    Object.keys(LANES).forEach(function (key) {
      var L = LANES[key];
      var a = el("a", { href: L.href, "class": "g-label", tabindex: "-1" }, gLabels);
      var t = el("text", { x: xEnd + 14, y: Y(key), "dominant-baseline": "central" }, a);
      t.textContent = narrow ? L.short : L.label;
    });

    canvas.innerHTML = "";
    canvas.appendChild(svg);
    canvas.style.height = H + "px";

    if (animate && graph) {
      graph.classList.add("is-drawing");
      setTimeout(function () { graph.classList.remove("is-drawing"); }, 2200);
    }
  }

  if (canvas) {
    var startDraw = function () { drawGraph(!reduceMotion); };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(startDraw, startDraw);
    } else {
      startDraw();
    }
    var lastW = 0, rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (canvas.clientWidth !== lastW) { lastW = canvas.clientWidth; drawGraph(false); }
      }, 120);
    });
  }

  /* =========================================================
     Journey: git log --graph
     ========================================================= */
  var log = document.getElementById("log");
  if (log) {
    // the row index where each lane begins
    var laneStart = {};
    JOURNEY.forEach(function (step, i) {
      if (laneStart[step.lane] == null) laneStart[step.lane] = i;
    });

    var prevYear = null;
    JOURNEY.forEach(function (step, i) {
      var li = document.createElement("li");
      li.className = "log__item" + (step.year === prevYear ? " log__item--cont" : "");

      var graphCell = document.createElement("div");
      graphCell.className = "log__graph";
      graphCell.setAttribute("aria-hidden", "true");

      Object.keys(LANES).forEach(function (key) {
        var s = laneStart[key];
        if (s == null || s > i) return;
        var L = LANES[key];
        var rail = document.createElement("span");
        rail.className = "log__rail" + (s === i ? " log__rail--start" : "") + (L.dashed ? " log__rail--dash" : "");
        rail.style.setProperty("--x", L.col);
        rail.style.setProperty("--c", L.color);
        graphCell.appendChild(rail);

        if (s === i && key !== "trunk") {
          var fork = el("svg", { "class": "log__fork", viewBox: "0 0 5 2", preserveAspectRatio: "none" });
          var tx = LANES.trunk.col + 0.5, lx = L.col + 0.5;
          el("path", {
            d: "M" + tx + " 0 C" + tx + " 1.25 " + lx + " 0.75 " + lx + " 2",
            stroke: L.color,
            "vector-effect": "non-scaling-stroke",
            "stroke-dasharray": L.dashed ? "7 6" : null
          }, fork);
          graphCell.appendChild(fork);
        }
      });

      var node = document.createElement("span");
      node.className = "log__node" + (step.award ? " log__node--award" : "") + (step.open ? " log__node--open" : "");
      node.style.setProperty("--x", LANES[step.lane].col);
      node.style.setProperty("--c", LANES[step.lane].color);
      graphCell.appendChild(node);

      var year = document.createElement("span");
      year.className = "log__year";
      year.textContent = step.year === prevYear ? "" : step.year;
      prevYear = step.year;

      var body = document.createElement("div");
      body.className = "log__body";
      var h3 = document.createElement("h3");
      h3.className = "log__title";
      h3.textContent = step.title;
      var p = document.createElement("p");
      p.className = "log__text";
      p.textContent = step.text;
      body.appendChild(h3);
      body.appendChild(p);

      li.appendChild(graphCell);
      li.appendChild(year);
      li.appendChild(body);
      log.appendChild(li);
    });
  }

  /* =========================================================
     Live GitHub stats
     ========================================================= */
  function fmt(n) {
    if (n == null) return null;
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }
  function setText(sel, value) {
    if (value == null) return;
    document.querySelectorAll(sel).forEach(function (node) { node.textContent = value; });
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
