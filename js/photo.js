/* ==========================================================================
   TJ Mauck Films — Photography page
   Scroll-reveal for the collage + fullscreen lightbox with keyboard nav.
   ========================================================================== */

(function () {
  'use strict';

  var items = Array.prototype.slice.call(document.querySelectorAll('.ph'));

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });

    items.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i, 8) * 45) + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ------------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------------ */

  var pl = document.querySelector('.pl');
  if (!pl) return;

  var plImg = pl.querySelector('img');
  var plCounter = pl.querySelector('.pl-counter');
  var current = 0;

  function fullSrc(btn) {
    var img = btn.querySelector('img');
    // Highest-res candidate from srcset, falls back to src.
    var set = img.getAttribute('srcset');
    if (set) {
      var parts = set.split(',');
      return parts[parts.length - 1].trim().split(/\s+/)[0];
    }
    return img.src;
  }

  function show(i) {
    current = (i + items.length) % items.length;
    var btn = items[current];
    plImg.src = fullSrc(btn);
    plImg.alt = btn.querySelector('img').alt;
    plCounter.textContent = (current + 1) + ' / ' + items.length;
  }

  function open(i) {
    show(i);
    pl.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    pl.hidden = true;
    plImg.src = '';
    document.body.style.overflow = '';
  }

  items.forEach(function (btn, i) {
    btn.addEventListener('click', function () { open(i); });
  });

  pl.querySelector('.pl-close').addEventListener('click', close);
  pl.querySelector('.pl-prev').addEventListener('click', function () { show(current - 1); });
  pl.querySelector('.pl-next').addEventListener('click', function () { show(current + 1); });

  pl.addEventListener('click', function (e) {
    if (e.target === pl) close();
  });

  document.addEventListener('keydown', function (e) {
    if (pl.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });
})();
