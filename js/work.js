/* TJ Mauck Films — Work page
   Left-rail category filters with FLIP grid animation, and the project view:
   clicked thumbnail expands to center stage, still grabs collage in around it. */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Manifest. cats: commercial | corporate | narrative | documentary |
     music-video. vimeo: player URL (null = not provided yet, view shows
     the still until the link exists).
     ------------------------------------------------------------------ */
  var PROJECTS = [
    { slug: 'ben-harper',     client: 'Ben Harper',      name: 'Before the Rain Dried',     cats: ['music-video'],               vimeo: 'https://player.vimeo.com/video/1070519366?h=5d125dd725&autoplay=1' },
    { slug: 'aveeno',         client: 'Aveeno',          name: 'Healthy Is Our Nature',     cats: ['commercial'],                vimeo: 'https://player.vimeo.com/video/1215867282?h=42cb956fa2&autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'only-in-dreams', client: 'Only in Dreams',  name: 'Short Film',                cats: ['narrative'],                 vimeo: null, external: 'https://www.youtube.com/watch?v=EvfffIIJ0d0' },
    { slug: 'hims',           client: 'Hims',            name: 'Life Is Sexual',            cats: ['commercial'],                vimeo: 'https://player.vimeo.com/video/563594183?autoplay=1' },
    { slug: 'whipsmart',      client: 'Whipsmart',       name: 'Your Story Starts Here',    cats: ['commercial'],                vimeo: 'https://player.vimeo.com/video/1205864168?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'search-dog',     client: 'Natl. Search Dog Foundation', name: 'From Rescued to Rescuer', cats: ['commercial', 'documentary'], vimeo: 'https://player.vimeo.com/video/276766887?autoplay=1' },
    { slug: 'la-femme',       client: 'Velvet Canyon',   name: 'La Femme',                  cats: ['narrative'],                 vimeo: 'https://player.vimeo.com/video/341268178?autoplay=1' },
    { slug: 'coachella',      client: 'The Art of Coachella', name: 'Documentary',          cats: ['documentary'],               vimeo: 'https://player.vimeo.com/video/215336883?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'esalon',         client: 'eSalon',          name: 'Victoria',                  cats: ['commercial'],   vimeo: 'https://player.vimeo.com/video/1215877137?h=afd99dcc8a&autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'dermalogica',    client: 'Dermalogica',     name: 'Hydro Masque Exfoliator',   cats: ['commercial'],                vimeo: 'https://player.vimeo.com/video/451292737?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'belle-keeks',    client: 'Belle & Keeks',   name: 'Short Film',                cats: ['narrative'],                 vimeo: 'https://player.vimeo.com/video/890715534?h=79e6f2edd1&autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'surprise',       client: 'Surprise!',       name: 'Short Film',                cats: ['narrative'],                 vimeo: 'https://player.vimeo.com/video/334593957?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'samantha-wills', client: 'Samantha Wills',  name: 'For Billabong',             cats: ['commercial'],                vimeo: 'https://player.vimeo.com/video/198171166?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'endpain',              client: 'Endpain',          name: 'Explore',               cats: ['commercial'], grabs: false, vimeo: 'https://player.vimeo.com/video/216581616?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'nixon-deserted',       client: 'Nixon',            name: 'Deserted',              cats: ['commercial'],  grabs: false, vimeo: 'https://player.vimeo.com/video/235424323?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'aldo-cozy-up',         client: 'Aldo Shoes',       name: 'Cozy Up',               cats: ['commercial'],  grabs: false, vimeo: 'https://player.vimeo.com/video/451267948?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'aldo-home-holidays',   client: 'Aldo Shoes',       name: 'Home for the Holidays', cats: ['commercial'],  grabs: false, vimeo: 'https://player.vimeo.com/video/451267758?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'aldo-dream',           client: 'Aldo Shoes',       name: 'Get Ready to Dream',    cats: ['commercial'],  grabs: false, vimeo: 'https://player.vimeo.com/video/332028678?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'sdf-who-we-are',       client: 'Natl. Search Dog Foundation', name: 'Who We Are', cats: ['commercial', 'documentary'], grabs: false, vimeo: 'https://player.vimeo.com/video/183623093?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'will-strip-for-change', client: 'Will Strip for Change', name: 'Documentary',    cats: ['documentary'], grabs: false, vimeo: 'https://player.vimeo.com/video/216566993?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'moonchild',            client: 'Moonchild',        name: 'Documentary',           cats: ['documentary'],   grabs: false, vimeo: 'https://player.vimeo.com/video/215365527?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'this-side-of-the-dirt', client: 'This Side of the Dirt', name: 'Documentary',    cats: ['documentary'],   grabs: false, vimeo: 'https://player.vimeo.com/video/215296101?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'agua-mala',            client: 'Aaron Orbit',      name: 'Agua Mala',             cats: ['music-video'], grabs: false, vimeo: 'https://player.vimeo.com/video/174910348?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'this-legend',          client: 'This Legend',      name: 'Holiday from Crazy',    cats: ['music-video'], grabs: false, vimeo: 'https://player.vimeo.com/video/112542117?h=14b7da2cc0&autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'aof-ava',              client: 'Army of Freshmen', name: 'Ava',                   cats: ['music-video'], grabs: false, vimeo: 'https://player.vimeo.com/video/51664698?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'jeff-hershey',         client: 'Jeff Hershey & the Heartbeats', name: "Don't Come Around", cats: ['music-video'], grabs: false, vimeo: 'https://player.vimeo.com/video/39650692?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'aof-body-parts',       client: 'Army of Freshmen', name: 'Body Parts',            cats: ['music-video'], grabs: false, vimeo: 'https://player.vimeo.com/video/34727331?h=9a3efc8b20&autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'assemble-skyline',     client: 'Assemble the Skyline', name: "We're Not Going Down Without a War", cats: ['music-video'], grabs: false, vimeo: 'https://player.vimeo.com/video/34727340?autoplay=1&title=0&byline=0&portrait=0&badge=0' },
    { slug: 'niagara',              client: 'Niagara',          name: 'Commercial',             cats: ['commercial'],  grabs: false, vimeo: 'https://player.vimeo.com/video/1215901732?h=ca5ad26c31&autoplay=1&title=0&byline=0&portrait=0&badge=0' }
  ];

  var grid = document.querySelector('.grid');
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var view = document.querySelector('.project-view');
  var stage = view.querySelector('.pv-stage');
  var media = view.querySelector('.pv-media');
  var title = view.querySelector('.pv-title');
  var collage = view.querySelector('.pv-collage');
  var closeBtn = view.querySelector('.pv-close');

  /* ------------------------------------------------------------------
     Render grid
     ------------------------------------------------------------------ */
  PROJECTS.forEach(function (p, i) {
    var el = document.createElement('a');
    el.className = 'work-item';
    el.href = '#' + p.slug;
    el.dataset.slug = p.slug;
    el.dataset.cats = p.cats.join(',');
    var num = ('0' + (i + 1)).slice(-2);
    el.innerHTML =
      '<h2><span class="num">' + num + '</span>' + p.client + " '" + p.name + "'</h2>" +
      '<figure><img src="assets/img/work/' + p.slug + '/thumb-960.jpg" ' +
      'srcset="assets/img/work/' + p.slug + '/thumb-480.jpg 480w, assets/img/work/' + p.slug + '/thumb-960.jpg 960w" ' +
      'sizes="(max-width: 767px) 46vw, 28vw" loading="lazy" alt="' + p.client + ' — ' + p.name + '"></figure>';
    el.addEventListener('click', function (e) {
      e.preventDefault();
      // External films (e.g. Omeleto's YouTube page) open in a new tab
      if (p.external) {
        window.open(p.external, '_blank', 'noopener');
        return;
      }
      // number as currently displayed (renumbered per active filter)
      openProject(p, el.querySelector('.num').textContent, el);
    });
    grid.appendChild(el);
  });

  var items = Array.prototype.slice.call(grid.children);

  /* ------------------------------------------------------------------
     Filtering with FLIP: fade out the leavers, then glide the survivors
     into their new grid positions.
     ------------------------------------------------------------------ */
  var animating = false;

  function applyFilter(cat) {
    if (animating) return;
    animating = true;

    var leaving = [], staying = [];
    items.forEach(function (el) {
      var match = cat === 'all' || el.dataset.cats.split(',').indexOf(cat) !== -1;
      (match ? staying : leaving)[match ? 'push' : 'push'](el);
    });

    // First: measure current positions of everything visible
    var first = new Map();
    items.forEach(function (el) {
      if (!el.classList.contains('hidden')) first.set(el, el.getBoundingClientRect());
    });

    // Fade out the leavers in place
    leaving.forEach(function (el) {
      if (!el.classList.contains('hidden')) el.classList.add('hiding');
    });

    setTimeout(function () {
      // Reflow: hide leavers, reveal returning items (opacity 0 for fade-in)
      leaving.forEach(function (el) { el.classList.add('hidden'); el.classList.remove('hiding'); });
      var entering = [];
      staying.forEach(function (el) {
        if (el.classList.contains('hidden')) {
          el.classList.remove('hidden');
          el.style.opacity = '0';
          entering.push(el);
        }
      });

      // Renumber the visible set 01..N so counts make sense per category
      staying.forEach(function (el, i) {
        el.querySelector('.num').textContent = ('0' + (i + 1)).slice(-2);
      });

      // Last + Invert + Play: glide survivors from old spot to new
      staying.forEach(function (el) {
        var f = first.get(el);
        if (!f) return; // was hidden, fades in instead
        var l = el.getBoundingClientRect();
        var dx = f.left - l.left, dy = f.top - l.top;
        if (!dx && !dy) return;
        el.animate([
          { transform: 'translate(' + dx + 'px,' + dy + 'px)' },
          { transform: 'translate(0,0)' }
        ], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
      });

      entering.forEach(function (el, i) {
        el.animate([{ opacity: 0 }, { opacity: 1 }],
          { duration: 350, delay: 120 + i * 40, easing: 'ease', fill: 'forwards' })
          .onfinish = function () { el.style.opacity = ''; };
      });

      setTimeout(function () { animating = false; }, 500);
    }, 360);
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.classList.contains('active')) return;
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  /* ------------------------------------------------------------------
     Project view: FLIP-expand the clicked thumbnail to center stage,
     then collage the grabs in around the film.
     ------------------------------------------------------------------ */
  var GRAB_COUNT = 12; // curated photographic frames per project, used once each

  function openProject(p, num, itemEl) {
    // Populate stage
    title.innerHTML = '<span class="num">' + num + '</span>' + p.client + " '" + p.name + "'";
    media.innerHTML = '';
    if (p.vimeo) {
      var iframe = document.createElement('iframe');
      iframe.src = p.vimeo;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      media.appendChild(iframe);
    } else {
      var still = document.createElement('img');
      still.src = 'assets/img/work/' + p.slug + '/thumb-960.jpg';
      still.alt = '';
      media.appendChild(still);
    }

    // Grab wall: 12 curated frames, each used once — 3x4 on desktop
    // (bottom row crops at the viewport edge), 2x6 on mobile.
    // Projects without extracted grabs (grabs: false) play on a plain backdrop.
    collage.innerHTML = '';
    if (p.grabs !== false) {
      for (var i = 0; i < GRAB_COUNT; i++) {
        var img = document.createElement('img');
        img.src = 'assets/img/work/' + p.slug + '/grab-' + (i + 1) + '.jpg';
        img.style.setProperty('--d', i * .05 + 's');
        img.alt = '';
        collage.appendChild(img);
      }
    }

    view.hidden = false;
    document.body.classList.add('film-open');
    document.body.style.overflow = 'hidden';

    // FLIP: from the clicked thumbnail's rect to the centered stage
    var thumb = itemEl.querySelector('figure').getBoundingClientRect();
    var target = media.getBoundingClientRect();
    var dx = thumb.left - target.left;
    var dy = thumb.top - target.top;
    var s = thumb.width / target.width;

    view.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'linear' });
    stage.animate([
      { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(' + s + ')', transformOrigin: 'top left' },
      { transform: 'translate(-50%, -50%) scale(1)', transformOrigin: 'top left' }
    ], { duration: 650, easing: 'cubic-bezier(.77,0,.175,1)' }).onfinish = function () {
      view.classList.add('open'); // grabs collage in
    };
  }

  function closeProject() {
    view.classList.remove('open');
    view.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'linear' })
      .onfinish = function () {
        view.hidden = true;
        document.body.classList.remove('film-open');
        media.innerHTML = '';
        collage.innerHTML = '';
        document.body.style.overflow = '';
      };
  }

  closeBtn.addEventListener('click', closeProject);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !view.hidden) closeProject();
  });
})();
