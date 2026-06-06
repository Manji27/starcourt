/* =====================================================================
   STARCOURT MALL — INTERACTIONS
   ===================================================================== */

(() => {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');

  /* ---------- Nav scroll state ---------- */
  if (nav) {
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 12);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile burger ---------- */
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    nav.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealTargets = [
    '.about-head', '.about-body', '.about-stats',
    '.section-head', '.store-card', '.event-ticket',
    '.food-tray', '.food-stall', '.movie',
    '.map-frame', '.gal', '.info-card',
    '.cta-inner', '.footer-top'
  ];

  const all = document.querySelectorAll(revealTargets.join(','));
  all.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 8) * 60}ms`;
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    all.forEach((el) => io.observe(el));
  } else {
    all.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Map floor toggle (UI only — single illustrated plan) ---------- */
  const mapToggles = document.querySelectorAll('.map-toggle');
  mapToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      mapToggles.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // Subtle visual cue: hue-rotate on the SVG depending on level
      const svg = document.querySelector('.map-svg');
      if (!svg) return;
      const isLower = btn.dataset.floor === 'lower';
      svg.style.transition = 'filter 0.5s ease';
      svg.style.filter = isLower
        ? 'drop-shadow(0 0 24px rgba(255, 122, 45, 0.18)) hue-rotate(-25deg)'
        : 'drop-shadow(0 0 24px rgba(0, 217, 255, 0.1))';
    });
  });

  /* ---------- Smooth-scroll active nav link ---------- */
  const navLinks = (nav || document).querySelectorAll('.nav-links a');
  const sections = Array.from(navLinks).map((link) => {
    const id = link.getAttribute('href');
    return id && id.startsWith('#') ? document.querySelector(id) : null;
  });

  const setActive = () => {
    const y = window.scrollY + 140;
    let activeIndex = -1;
    sections.forEach((sec, i) => {
      if (sec && sec.offsetTop <= y) activeIndex = i;
    });
    navLinks.forEach((link, i) => {
      link.style.opacity = i === activeIndex ? '1' : '';
      link.style.color = i === activeIndex ? 'var(--neon-pink-2)' : '';
    });
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ---------- Live "Now" widget in hero meta ---------- */
  const nowEl = document.querySelector('.hero-meta-item:first-child .hero-meta-value');
  if (nowEl) {
    const update = () => {
      const d = new Date();
      const h = d.getHours();
      const isOpen = h >= 10 && h < 21;
      nowEl.textContent = isOpen ? '10:00 — 21:00 · OPEN' : '10:00 — 21:00 · CLOSED';
    };
    update();
    setInterval(update, 60_000);
  }

  /* ---------- Subtle parallax on hero badge ---------- */
  const badge = document.querySelector('.hero-badge');
  if (badge && window.matchMedia('(min-width: 1024px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      badge.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ---------- Easter egg : l'Envers (the Upside Down) ----------
     Triple-clic sur le logo Starcourt → les néons grésillent et
     tout le mall bascule dans l'Envers. Re-triple-clic (ou Échap)
     pour remonter à la surface. */
  const logo = document.querySelector('.starcourt-hero .logo');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showToast = (message) => {
    let toast = document.querySelector('.ud-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'ud-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
  };

  const toggleUpsideDown = () => {
    const body = document.body;
    const entering = !body.classList.contains('upside-down');

    // grésillement des néons pendant la bascule
    if (!reducedMotion) {
      body.classList.add('ud-glitch');
      setTimeout(() => body.classList.remove('ud-glitch'), 900);
    }

    if (entering) {
      if (!document.querySelector('.ud-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'ud-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
      }
      body.classList.add('upside-down');
      showToast("Vous êtes dans l'Envers · Échap (ou triple-clic sur le logo) pour remonter");
    } else {
      body.classList.remove('upside-down');
      showToast('De retour au Starcourt — il fait bon, non ?');
    }
  };

  if (logo) {
    let clicks = 0;
    let clickTimer = null;

    logo.addEventListener('click', (e) => {
      e.preventDefault();
      clicks += 1;
      clearTimeout(clickTimer);

      if (clicks >= 3) {
        clicks = 0;
        toggleUpsideDown();
        return;
      }

      clickTimer = setTimeout(() => {
        // simple clic : comportement normal du lien (retour en haut)
        if (clicks === 1) window.scrollTo({ top: 0, behavior: 'smooth' });
        clicks = 0;
      }, 450);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('upside-down')) {
      toggleUpsideDown();
    }
  });
})();
