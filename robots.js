(function () {
  "use strict";
  var html = document.documentElement;
  if (!html.classList.contains("building")) return;

  // --- Tunables: dial the animation in here -------------------------------
  var STAGGER_MS = 340;   // gap between consecutive robot launches
  var TOW_MS     = 680;   // one robot's tow flight (edge -> place); ±12% per bot
  var EXIT_MS    = 500;   // robot's hop-and-leave after placing
  var SETTLE_MS  = 3400;  // initial batch is done by here (built flag, straggler)
  var BOT_W      = 44, BOT_H = 48; // px; matches .bot CSS
  var STRAGGLER_DELAY = 1100;      // ms after settle before the late robot shows
  // -------------------------------------------------------------------------

  // Robot look: gradient capsule body, glowing visor eyes, blinking antenna,
  // flickering thrusters, claw arms reaching down to grip the cargo.
  // Gradient ids are suffixed per-bot so multiple robots don't collide.
  var botId = 0;
  function botSvg(withCrate) {
    var id = "bg" + (botId++);
    return (
      '<svg viewBox="0 0 44 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#aab0a4"/><stop offset="1" stop-color="#63685f"/>' +
        '</linearGradient></defs>' +
        // thruster flames on the jetpack, behind the body
        '<g class="flame">' +
          '<path d="M9.5 27 Q12 38 14.5 27 Z" fill="#e8a04c" opacity=".9"/>' +
          '<path d="M29.5 27 Q32 38 34.5 27 Z" fill="#e8a04c" opacity=".9"/>' +
          '<path d="M10.8 27 Q12 33.5 13.2 27 Z" fill="#ffd9a0"/>' +
          '<path d="M30.8 27 Q32 33.5 33.2 27 Z" fill="#ffd9a0"/>' +
        '</g>' +
        // jetpack pods
        '<rect x="8" y="18" width="6" height="9" rx="3" fill="#4a4e46"/>' +
        '<rect x="30" y="18" width="6" height="9" rx="3" fill="#4a4e46"/>' +
        // claw arms reaching down to the cargo
        '<path d="M15 30 q-1.5 5 -3 7 m3 -7 q1.5 5 0 8" stroke="#565b52" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<path d="M29 30 q1.5 5 3 7 m-3 -7 q-1.5 5 0 8" stroke="#565b52" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        // body
        '<rect x="10" y="10" width="24" height="21" rx="10" fill="url(#' + id + ')" stroke="#3c403a" stroke-width="1.2"/>' +
        // visor + glowing eyes
        '<rect x="14" y="14" width="16" height="9" rx="4.5" fill="#101210"/>' +
        '<circle cx="19" cy="18.5" r="2" fill="#e6fbe9">' +
          '<animate attributeName="opacity" values="1;1;.15;1;1" keyTimes="0;.9;.93;.96;1" dur="3.4s" repeatCount="indefinite"/>' +
        '</circle>' +
        '<circle cx="25" cy="18.5" r="2" fill="#e6fbe9">' +
          '<animate attributeName="opacity" values="1;1;.15;1;1" keyTimes="0;.9;.93;.96;1" dur="3.4s" repeatCount="indefinite"/>' +
        '</circle>' +
        // antenna with blinking beacon
        '<line x1="22" y1="10" x2="22" y2="5" stroke="#565b52" stroke-width="1.8"/>' +
        '<circle cx="22" cy="3.6" r="2" fill="#e8a04c">' +
          '<animate attributeName="opacity" values="1;.25;1" dur="1.1s" repeatCount="indefinite"/>' +
        '</circle>' +
        // optional cargo crate held in the claws (straggler carries one)
        (withCrate
          ? '<g><rect x="14" y="38" width="16" height="10" rx="1.5" fill="#57534a" stroke="#3c403a"/>' +
            '<line x1="14" y1="43" x2="30" y2="43" stroke="#3c403a" stroke-width="1"/></g>'
          : '') +
      '</svg>'
    );
  }

  function makeBot(withCrate) {
    var bot = document.createElement("div");
    bot.className = "bot";
    bot.innerHTML = botSvg(withCrate); // xss-ok: static constant SVG defined above
    document.body.appendChild(bot);
    bots.push(bot);
    return bot;
  }

  var targets = Array.prototype.slice.call(document.querySelectorAll("[data-build]"));
  var bots = [];
  var anims = [];
  var remaining = targets.length;
  var done = false, skipped = false;

  // A piece is "placed" once its tow lands (or we force it). When the last
  // one lands, the gate class drops and the page is pure static HTML again.
  function markPlaced(t) {
    if (t.__placed) return;
    t.__placed = true;
    t.style.opacity = "1";
    if (--remaining === 0) teardown();
  }

  function teardown() {
    if (done) return;
    done = true;
    html.classList.remove("building");
    targets.forEach(function (t) { t.style.opacity = ""; });
    io.disconnect();
    removeSkipListeners();
  }

  // Impatience escape hatch: keypress/tap finishes everything instantly.
  // (Scroll no longer skips — scrolling is how below-fold pieces arrive.)
  function finish() {
    anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    bots.forEach(function (b) { b.remove(); });
    targets.forEach(markPlaced);
  }
  var skipEvents = ["keydown", "click"]; // not pointerdown: touch-scroll starts with one
  function onSkip() { skipped = true; finish(); }
  skipEvents.forEach(function (ev) { addEventListener(ev, onSkip, { passive: true }); });
  function removeSkipListeners() {
    skipEvents.forEach(function (ev) { removeEventListener(ev, onSkip); });
  }

  // Start each robot at the nearest screen edge to its target.
  function edgeStart(x, y) {
    var w = innerWidth, h = innerHeight;
    var d = Math.min(x, w - x, y, h - y);
    if (d === x)     return { x: -BOT_W - 220, y: y - 40 };
    if (d === w - x) return { x: w + 220,      y: y - 40 };
    if (d === y)     return { x: x, y: -BOT_H - 220 };
    return { x: x, y: h + 220 };
  }

  function track(a) { anims.push(a); return a; }

  // The core trick: robot and component share one rigid offset and identical
  // keyframe timing, so the robot visibly *tows* the piece in from offscreen.
  // Motion is one continuous curve: accelerate out of the edge, sweep through
  // a sagging midpoint (weight), then decelerate into the grip with a whisper
  // of overshoot. Per-segment easings keep velocity continuous at the sag —
  // a single overshoot easing applied per-segment is what reads as choppy.
  var EASE_THROUGH = "cubic-bezier(.5,.05,.65,.5)";  // edge -> sag: accelerating
  var EASE_ARRIVE  = "cubic-bezier(.2,.55,.25,1.08)"; // sag -> grip: glide in, soft overshoot
  function tow(target, delay) {
    var r = target.getBoundingClientRect();
    // grip point: claws on the piece's top edge, near its left end
    var gx = r.left + Math.min(70, r.width / 2) - BOT_W / 2;
    var gy = r.top - BOT_H + 12;
    var from = edgeStart(gx, gy);
    var dx = from.x - gx, dy = from.y - gy;
    // per-robot personality: slightly different speed, sag, and lean
    var v = Math.random();
    var dur = TOW_MS * (.9 + v * .24);
    var sag = 12 + v * 10;
    var lean = (dx > 0 ? -1 : 1) * (7 + v * 5);

    var bot = makeBot(false);
    var opts = { duration: dur, delay: delay, easing: "linear", fill: "both" };

    track(bot.animate(
      [
        { transform: "translate(" + from.x + "px," + from.y + "px) rotate(" + lean + "deg)", easing: EASE_THROUGH },
        { transform: "translate(" + (gx + dx * .42) + "px," + (gy + dy * .42 + sag) + "px) rotate(" + lean * .55 + "deg)", offset: .5, easing: EASE_ARRIVE },
        { transform: "translate(" + gx + "px," + gy + "px) rotate(0deg)" }
      ], opts
    ));

    var carry = track(target.animate(
      [
        // starts invisible so pieces never sit parked at the edge pre-tow
        { transform: "translate(" + dx + "px," + dy + "px) rotate(" + (lean * -.12) + "deg)", opacity: 0, easing: EASE_THROUGH },
        { opacity: 1, offset: .22 },
        { transform: "translate(" + (dx * .42) + "px," + (dy * .42 + sag) + "px) rotate(" + (lean * .1) + "deg)", opacity: 1, offset: .5, easing: EASE_ARRIVE },
        { transform: "none", opacity: 1 }
      ], opts
    ));

    carry.onfinish = function () {
      markPlaced(target);
      // lock-in flash: quick brightness pulse as the piece clicks home
      track(target.animate(
        [{ filter: "brightness(1.7)" }, { filter: "brightness(1)" }],
        { duration: 320, easing: "ease-out" }
      ));
      // release: a small anticipation hop, then rocket back out
      var out = edgeStart(gx, gy);
      track(bot.animate(
        [
          { transform: "translate(" + gx + "px," + gy + "px) rotate(0deg)", opacity: 1, easing: "cubic-bezier(.3,.6,.4,1)" },
          { transform: "translate(" + gx + "px," + (gy - 24) + "px) rotate(" + (-lean * .6) + "deg)", opacity: 1, offset: .32, easing: "cubic-bezier(.5,.05,.85,.4)" },
          { transform: "translate(" + (out.x + (out.x > gx ? 260 : -260)) + "px," + (out.y - 160) + "px) rotate(" + (-lean) + "deg)", opacity: 0 }
        ],
        { duration: EXIT_MS, easing: "linear", fill: "forwards" }
      )).onfinish = function () { bot.remove(); };
    };

    // watchdogs: the piece ends visible and the robot ends gone even if the
    // animations die mid-flight (hidden tab, throttled frames)
    setTimeout(function () { markPlaced(target); }, delay + dur + 1000);
    setTimeout(function () { bot.remove(); }, delay + dur + EXIT_MS + 4000);
  }

  // Pieces are towed in only once they're on screen, so below-fold components
  // (small screens especially) fly in as the visitor scrolls to them. Launches
  // are paced by STAGGER_MS regardless of how many become visible at once.
  var lastLaunch = -1e9;
  function schedule(t) {
    if (t.__scheduled || t.__placed) return;
    t.__scheduled = true;
    var now = performance.now();
    var at = Math.max(now, lastLaunch + STAGGER_MS);
    lastLaunch = at;
    tow(t, at - now);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); schedule(e.target); }
    });
  }, { threshold: .12 });
  targets.forEach(function (t) { io.observe(t); });

  // Repeat views this session skip the show (per-piece watchdogs above are
  // the safety net; there's no global cutoff since scroll drives late tows).
  setTimeout(function () {
    try { sessionStorage.setItem("built", "1"); } catch (e) {}
  }, SETTLE_MS);

  // The straggler: one late robot hauls in a crate, finds the page already
  // finished, double-takes ("?"), and sheepishly rockets off with its cargo.
  setTimeout(function () {
    if (skipped || document.hidden) return; // nobody's watching — skip the joke
    var bot = makeBot(true);
    // hard guarantee: no zombie robot if the tab is hidden/throttled mid-scene
    setTimeout(function () { bot.remove(); }, 6000);
    var bub = document.createElement("div");
    bub.className = "bub";
    bub.textContent = "?";
    bot.appendChild(bub);
    var cx = innerWidth * .52, cy = innerHeight * .42;
    var arrive = bot.animate(
      [
        { transform: "translate(" + (-BOT_W - 80) + "px," + (cy + 90) + "px) rotate(-10deg)" },
        { transform: "translate(" + cx + "px," + cy + "px) rotate(0deg)" }
      ],
      { duration: 650, easing: "cubic-bezier(.3,1.15,.4,1)", fill: "forwards" }
    );
    arrive.onfinish = function () {
      // look left, look right, realize, leave
      var look = bot.animate(
        [
          { transform: "translate(" + cx + "px," + cy + "px) rotate(0deg)" },
          { transform: "translate(" + (cx - 14) + "px," + cy + "px) rotate(-13deg)", offset: .28 },
          { transform: "translate(" + (cx + 14) + "px," + cy + "px) rotate(13deg)", offset: .62 },
          { transform: "translate(" + cx + "px," + cy + "px) rotate(0deg)" }
        ],
        { duration: 900, easing: "ease-in-out", fill: "forwards" }
      );
      setTimeout(function () { bot.classList.add("talk"); }, 750);
      look.onfinish = function () {
        setTimeout(function () {
          bot.classList.remove("talk");
          bot.animate(
            [
              { transform: "translate(" + cx + "px," + cy + "px) rotate(0deg)", opacity: 1 },
              { transform: "translate(" + cx + "px," + (cy - 18) + "px) rotate(8deg)", opacity: 1, offset: .25 },
              { transform: "translate(" + (innerWidth + 120) + "px," + (cy - 140) + "px) rotate(14deg)", opacity: 1 }
            ],
            { duration: 700, easing: "cubic-bezier(.5,0,.85,.45)", fill: "forwards" }
          ).onfinish = function () { bot.remove(); };
        }, 550);
      };
    };
  }, SETTLE_MS + STRAGGLER_DELAY);
})();
