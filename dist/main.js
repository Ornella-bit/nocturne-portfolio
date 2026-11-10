(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- header state ---------- */
  var header = document.getElementById('site-header');

  function syncHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  /* ---------- mobile menu ---------- */
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  function setMenu(open, restoreFocus) {
    if (!menuToggle || !mobileMenu) return;
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('no-scroll', open);
    if (open && menuLinks.length) {
      menuLinks[0].focus();
    } else if (restoreFocus) {
      menuToggle.focus();
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      setMenu(mobileMenu.hidden);
    });

    menuLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setMenu(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !mobileMenu.hidden) {
        setMenu(false, true);
      }
    });

    window.matchMedia('(min-width: 901px)').addEventListener('change', function (event) {
      if (event.matches && !mobileMenu.hidden) {
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = 'Menu';
        document.body.classList.remove('no-scroll');
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !prefersReduced.matches) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* ---------- hero parallax ---------- */
  var heroImage = document.querySelector('[data-parallax] img');

  if (heroImage && !prefersReduced.matches) {
    var ticking = false;

    var updateParallax = function () {
      var offset = Math.min(window.scrollY, window.innerHeight);
      heroImage.style.transform =
        'scale(1.08) translate3d(0, ' + (offset * 0.16).toFixed(1) + 'px, 0)';
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateParallax();
  }

  /* ---------- nav scrollspy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));

  if ('IntersectionObserver' in window && navLinks.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.removeAttribute('aria-current');
          });
          var active = navLinks.filter(function (link) {
            return link.getAttribute('href') === '#' + entry.target.id;
          })[0];
          if (active) active.setAttribute('aria-current', 'true');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) spy.observe(section);
    });

    var contactSection = document.getElementById('contact');
    if (contactSection) {
      var contactSpy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              navLinks.forEach(function (link) {
                link.removeAttribute('aria-current');
              });
            }
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      contactSpy.observe(contactSection);
    }
  }

  /* ---------- lightbox ---------- */
  var dialog = document.getElementById('lightbox');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));

  if (dialog && triggers.length) {
    var lbImg = document.getElementById('lb-img');
    var lbTitle = document.getElementById('lb-title');
    var lbMeta = document.getElementById('lb-meta');
    var lbCount = document.getElementById('lb-count');
    var lbClose = document.getElementById('lb-close');
    var lbPrev = document.getElementById('lb-prev');
    var lbNext = document.getElementById('lb-next');
    var current = 0;
    var lastTrigger = null;

    var pad = function (n) {
      return String(n).padStart(2, '0');
    };

    var show = function (index) {
      current = (index + triggers.length) % triggers.length;
      var trigger = triggers[current];
      var img = trigger.querySelector('img');

      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbTitle.textContent = trigger.dataset.title || '';
      lbMeta.textContent = [trigger.dataset.loc, trigger.dataset.cam].filter(Boolean).join(' · ');
      lbCount.textContent = pad(current + 1) + ' / ' + pad(triggers.length);
    };

    var open = function (index, trigger) {
      lastTrigger = trigger;
      show(index);
      document.body.classList.add('no-scroll');
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
        dialog.focus();
      } else {
        dialog.setAttribute('open', '');
      }
    };

    var close = function () {
      if (dialog.open) dialog.close();
    };

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener('click', function () {
        open(index, trigger);
      });
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', function () {
      show(current - 1);
    });
    lbNext.addEventListener('click', function () {
      show(current + 1);
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) close();
    });

    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        show(current - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        show(current + 1);
      }
    });

    dialog.addEventListener('close', function () {
      document.body.classList.remove('no-scroll');
      var trigger = lastTrigger;
      if (trigger) {
        window.requestAnimationFrame(function () {
          trigger.focus();
        });
      }
    });
  }

  /* ---------- copy email ---------- */
  var copyBtn = document.getElementById('copy-email');
  var copyStatus = document.getElementById('copy-status');

  if (copyBtn && copyStatus) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.dataset.email;

      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        copyStatus.textContent = 'Copy unavailable — select the address above';
        return;
      }

      navigator.clipboard.writeText(email).then(
        function () {
          copyStatus.textContent = 'Copied';
          window.setTimeout(function () {
            copyStatus.textContent = '';
          }, 2400);
        },
        function () {
          copyStatus.textContent = 'Copy failed — select the address above';
        }
      );
    });
  }

  /* ---------- contact form -> mailto ---------- */
  var form = document.getElementById('contact-form');
  var formNote = document.getElementById('form-note');

  if (form && formNote) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        formNote.textContent = 'Please fill in the required fields.';
        return;
      }

      var data = new FormData(form);
      var name = String(data.get('name') || '').trim();
      var email = String(data.get('email') || '').trim();
      var project = String(data.get('project') || '');
      var message = String(data.get('message') || '').trim();

      var subject = 'Night commission — ' + name;
      var body = message + '\n\n— ' + name + '\n' + email + '\nProject: ' + project;

      window.location.href =
        'mailto:studio@nocturne.photos?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body);

      formNote.textContent = 'Opening your mail app with the details filled in…';
    });
  }
})();
