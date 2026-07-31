/* TJ Mauck Films — carousel homepage
   Intro stack animation → transparent nav → fullscreen video carousel.
   Desktop: virtual wheel scroll with easing + snap + seamless wrap.
   Mobile: native vertical snap scroll, portrait videos. */

(function () {
  'use strict';

  var carousel = document.querySelector('.carousel');
  var track = carousel.querySelector('.track');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
  var intro = document.querySelector('.intro');
  var N = slides.length;

  var mobileQuery = window.matchMedia('(max-width: 767px)');
  var isMobile = mobileQuery.matches;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Layout engine and video sources are chosen per breakpoint at load;
  // crossing it (rotate, window resize) warrants a clean re-init.
  mobileQuery.addEventListener('change', function () { location.reload(); });

  /* ------------------------------------------------------------------
     Video sources — pick portrait files on mobile, HEVC where supported
     ------------------------------------------------------------------ */
  var probe = document.createElement('video');
  var canHevc = probe.canPlayType('video/mp4; codecs="hvc1.2.4.L120.B0"') !== '';

  function sourceFor(slide) {
    var base = (isMobile && slide.dataset.videoMobile) ? slide.dataset.videoMobile : slide.dataset.video;
    return base + (canHevc ? '.hevc.mp4' : '.mp4');
  }

  slides.forEach(function (slide) {
    var v = slide.querySelector('video');
    v.src = sourceFor(slide);
    // After first playback, drop the poster so a paused video shows its real
    // current frame during transitions instead of snapping back to frame 1.
    v.addEventListener('playing', function () { v.removeAttribute('poster'); }, { once: true });
  });

  function tryPlay(v) {
    var p = v.play();
    if (p) p.catch(function () {
      // Autoplay blocked (e.g. low-power mode): retry on first gesture
      var retry = function () {
        v.play().catch(function () {});
        window.removeEventListener('pointerdown', retry);
        window.removeEventListener('wheel', retry);
      };
      window.addEventListener('pointerdown', retry, { once: true });
      window.addEventListener('wheel', retry, { once: true });
    });
  }

  function playOnly(index) {
    slides.forEach(function (slide, i) {
      var v = slide.querySelector('video');
      slide.classList.toggle('active', i === index);
      if (i === index) {
        v.preload = 'auto';
        tryPlay(v);
      } else {
        v.pause();
      }
    });
    carousel.dataset.active = index;
  }

  /* ------------------------------------------------------------------
     Intro timeline: stack in → spread → top card grows → reveal site
     ------------------------------------------------------------------ */
  function siteReady() {
    document.body.classList.add('ready');
    playOnly(0);
    // Warm the other slides once the hero is playing, so switching is instant.
    // Desktop buffers fully; mobile only grabs headers (cellular-friendly).
    setTimeout(function () {
      slides.forEach(function (slide, i) {
        if (i !== 0) slide.querySelector('video').preload = isMobile ? 'metadata' : 'auto';
      });
    }, 1500);
  }

  // Resume the active loop when the tab becomes visible again
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && document.body.classList.contains('ready')) {
      var active = slides[+carousel.dataset.active || 0].querySelector('video');
      active.play().catch(function () {});
    }
  });

  if (reducedMotion || !intro) {
    if (intro) intro.remove();
    siteReady();
  } else {
    // Let posters paint first, then run the phases
    setTimeout(function () { intro.classList.add('stacked'); }, 350);
    setTimeout(function () { intro.classList.add('spread'); }, 1750);
    setTimeout(function () { intro.classList.add('grow'); }, 2450);
    setTimeout(function () {
      intro.classList.add('done');
      siteReady();
    }, 3350);
    setTimeout(function () { intro.remove(); }, 4100);
  }

  /* ------------------------------------------------------------------
     Mobile: native vertical snap — IntersectionObserver drives playback
     ------------------------------------------------------------------ */
  if (isMobile) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && document.body.classList.contains('ready')) {
          playOnly(slides.indexOf(entry.target));
        }
      });
    }, { root: carousel, threshold: 0.6 });
    slides.forEach(function (s) { io.observe(s); });
    return; // no custom engine on mobile
  }

  /* ------------------------------------------------------------------
     Desktop: virtual scroll engine with easing, snap and seamless wrap.
     No clones: every frame, each real slide is placed at its shortest
     wrapped offset from the scroll position, so the actual playing video
     appears on either end. Any partially visible slide plays; fully
     hidden slides pause holding their frame.
     ------------------------------------------------------------------ */

  carousel.classList.add('js-slides');

  var vw = window.innerWidth;
  var target = 0;        // where input wants to be (unbounded)
  var current = 0;       // eased render position (unbounded)
  var lastWheel = 0;
  var activeIndex = 0;

  window.addEventListener('resize', function () {
    vw = window.innerWidth;
    target = current = activeIndex * vw;
  });

  window.addEventListener('wheel', function (e) {
    if (!document.body.classList.contains('ready')) return;
    e.preventDefault();
    var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    target += delta * 1.6;
    lastWheel = performance.now();
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('ready')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') target = (Math.round(target / vw) + 1) * vw;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') target = (Math.round(target / vw) - 1) * vw;
  });

  function mod(n, m) { return ((n % m) + m) % m; }

  function tick(now) {
    var W = N * vw;

    // Snap to the nearest slide once wheel input settles
    if (now - lastWheel > 160) {
      target += (Math.round(target / vw) * vw - target) * 0.12;
      if (Math.abs(target - current) < 0.5) {
        // Settled: land exactly, and fold both values back into range
        // (visually identical — placement below is modular)
        target = Math.round(target / vw) * vw;
        current = target = mod(target, W);
      }
    }
    current += (target - current) * 0.085;

    var render = mod(current, W);
    var ready = document.body.classList.contains('ready');

    slides.forEach(function (slide, i) {
      // Shortest wrapped offset of slide i relative to the viewport
      var delta = mod(i * vw - render + W / 2, W) - W / 2;
      var dist = Math.abs(delta);

      // Hysteresis: a resting neighbor sits exactly one viewport away, right on
      // the show/hide boundary — a single threshold flickers there as the easing
      // converges, tearing down and rebuilding a fullscreen video layer (visible
      // flash). Enter at 12px inside the edge, leave only at fully clear.
      var visible = slide._vis;
      if (dist < vw - 12) visible = true;
      else if (dist >= vw) visible = false;
      if (visible === undefined) visible = dist < vw - 12;

      slide.style.transform = 'translate3d(' + Math.round(delta) + 'px,0,0)';
      if (visible !== slide._vis) {
        slide.style.visibility = visible ? 'visible' : 'hidden';
        slide._vis = visible;
      }

      if (!ready) return;
      var v = slide.querySelector('video');
      if (visible && v.paused) {
        var p = v.play();
        if (p) p.catch(function () {}); // gesture-retry handled in playOnly
      } else if (!visible && !v.paused) {
        v.pause();
      }
    });

    var index = mod(Math.round(current / vw), N);
    if (index !== activeIndex && ready) {
      activeIndex = index;
      carousel.dataset.active = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
