/* TJ Mauck Films — nav + lightbox */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Mobile nav
     ------------------------------------------------------------------ */
  var menuButton = document.querySelector('.menu-button');
  var navMenu = document.querySelector('.nav-menu');

  menuButton.addEventListener('click', function () {
    var open = navMenu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close the mobile menu after tapping a link
  navMenu.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      navMenu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });

  /* ------------------------------------------------------------------
     Lightbox — videos and frame-grab galleries
     ------------------------------------------------------------------ */
  var lightbox = document.querySelector('.lightbox');
  var content = lightbox.querySelector('.lightbox-content');
  var counter = lightbox.querySelector('.lightbox-counter');
  var prevBtn = lightbox.querySelector('.lightbox-prev');
  var nextBtn = lightbox.querySelector('.lightbox-next');
  var closeBtn = lightbox.querySelector('.lightbox-close');

  var gallery = [];   // current image list (empty for videos)
  var index = 0;
  var lastFocus = null;

  function openLightbox() {
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    content.innerHTML = '';
    counter.textContent = '';
    document.body.style.overflow = '';
    gallery = [];
    if (lastFocus) lastFocus.focus();
  }

  function showVideo(embedUrl) {
    content.innerHTML = '';
    var frame = document.createElement('div');
    frame.className = 'video-frame';
    var iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);
    content.appendChild(frame);
    prevBtn.hidden = true;
    nextBtn.hidden = true;
    counter.textContent = '';
    openLightbox();
  }

  function showImage(i) {
    index = (i + gallery.length) % gallery.length;
    content.innerHTML = '';
    var img = document.createElement('img');
    img.src = gallery[index];
    img.alt = '';
    content.appendChild(img);
    var multiple = gallery.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
    counter.textContent = multiple ? (index + 1) + ' / ' + gallery.length : '';
  }

  // Video thumbnails
  document.querySelectorAll('.video-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showVideo(link.dataset.video);
    });
  });

  // Frame grabs — grouped per project
  document.querySelectorAll('.grab').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var group = Array.prototype.slice.call(
        document.querySelectorAll('.grab[data-gallery="' + link.dataset.gallery + '"]')
      );
      gallery = group.map(function (a) { return a.getAttribute('href'); });
      showImage(group.indexOf(link));
      openLightbox();
    });
  });

  prevBtn.addEventListener('click', function () { showImage(index - 1); });
  nextBtn.addEventListener('click', function () { showImage(index + 1); });
  closeBtn.addEventListener('click', closeLightbox);

  // Close on backdrop click (but not on the image/video itself)
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === content) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (gallery.length > 1) {
      if (e.key === 'ArrowLeft') showImage(index - 1);
      if (e.key === 'ArrowRight') showImage(index + 1);
    }
  });
})();
