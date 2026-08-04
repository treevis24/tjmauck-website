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

  /* ------------------------------------------------------------------
     Film overlay: clicking a slide plays the full piece over a wall of
     stills, mirroring the Work page's project view.
     ------------------------------------------------------------------ */
  var filmView = document.querySelector('.film-view');
  var fvMedia = filmView.querySelector('.fv-media');
  var fvTitle = filmView.querySelector('.fv-title');
  var fvCollage = filmView.querySelector('.fv-collage');
  var fvClose = filmView.querySelector('.fv-close');
  var GRABS = 12;

  function openFilm(slide) {
    var client = slide.querySelector('.st-client');
    var name = slide.querySelector('.st-name');
    fvTitle.textContent = (client ? client.textContent : '') + (name ? " '" + name.textContent + "'" : '');

    fvMedia.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.src = slide.dataset.watch;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    fvMedia.appendChild(iframe);

    fvCollage.innerHTML = '';
    for (var i = 0; i < GRABS; i++) {
      var img = document.createElement('img');
      img.src = 'assets/img/work/' + slide.dataset.grabs + '/grab-' + (i + 1) + '.jpg';
      img.style.setProperty('--d', i * .05 + 's');
      img.alt = '';
      fvCollage.appendChild(img);
    }

    filmView.hidden = false;
    requestAnimationFrame(function () { filmView.classList.add('open'); });
    slides.forEach(function (s) { s.querySelector('video').pause(); });
  }

  function closeFilm() {
    filmView.classList.remove('open');
    filmView.hidden = true;
    fvMedia.innerHTML = '';
    fvCollage.innerHTML = '';
    if (document.body.classList.contains('ready')) {
      var active = slides[+carousel.dataset.active || 0].querySelector('video');
      active.play().catch(function () {});
    }
  }

  slides.forEach(function (slide) {
    slide.addEventListener('click', function () {
      if (slide.dataset.watch && filmView.hidden) openFilm(slide);
    });
  });

  fvClose.addEventListener('click', closeFilm);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !filmView.hidden) closeFilm();
  });

  // Resume the active loop when the tab becomes visible again
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && document.body.classList.contains('ready')) {
      var active = slides[+carousel.dataset.active || 0].querySelector('video');
      active.play().catch(function () {});
    }
  });

  // Intro choreography (matched to the reference):
  // each card flies up from below the viewport, tilted back 80°, and stands
  // upright at 25% scale — bottom of the stack first, the first project last,
  // landing on top. Then the top card scales to fullscreen while its image
  // relaxes from a 1.6x zoom.
  var EASE_FLY = 'cubic-bezier(.25, 1, .5, 1)';
  var EASE_GROW = 'cubic-bezier(.77, 0, .175, 1)';

  function runIntro(done) {
    var cards = Array.prototype.slice.call(intro.querySelectorAll('.intro-card'));
    var lastLanded = 0;

    cards.forEach(function (card, i) {
      var delay = 250 + i * 180;
      card.animate([
        { transform: 'translateY(95%) scale(.8) rotateX(-80deg)' },
        { transform: 'translateY(0) scale(.25) rotateX(0deg)' }
      ], { duration: 1100, delay: delay, easing: EASE_FLY, fill: 'both' });
      lastLanded = Math.max(lastLanded, delay + 1100);
    });

    var top = cards[cards.length - 1];
    var img = top.querySelector('img');

    setTimeout(function () {
      top.animate([
        { transform: 'translateY(0) scale(.25)' },
        { transform: 'translateY(0) scale(1)' }
      ], { duration: 800, easing: EASE_GROW, fill: 'both' });
      img.animate([
        { transform: 'scale(1.6)' },
        { transform: 'scale(1)' }
      ], { duration: 1500, easing: EASE_FLY, fill: 'both' });

      setTimeout(function () {
        intro.classList.add('done');
        done();
        setTimeout(function () { intro.remove(); }, 500);
      }, 820);
    }, lastLanded + 100);
  }

  if (reducedMotion || !intro || !('animate' in document.body)) {
    if (intro) intro.remove();
    siteReady();
  } else {
    runIntro(siteReady);
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
