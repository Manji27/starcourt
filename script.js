/* =====================================================================
   STARCOURT MALL — INTERACTIONS
   ===================================================================== */

(() => {
  /* ---------- Scroll reveal ---------- */
  const revealTargets = [
    '.highlights-header', '.highlight-card',
    '.style-left', '.product-card',
    '.sweet-left', '.dessert-card',
    '.cinema-left', '.movie-card', '.cinema-bottom-banner',
    '.arcade-header', '.arcade-feature', '.arcade-screen', '.arcade-banner',
    '.ac-ribbon', '.ac-title', '.ac-intro', '.ac-cta',
    '.footer-top'
  ];

  const all = document.querySelectorAll(revealTargets.join(','));
  // cascade par grille : chaque groupe de cartes repart de zéro,
  // les éléments isolés apparaissent sans délai
  const groupCount = new Map();
  all.forEach((el) => {
    const parent = el.parentElement;
    const idx = groupCount.get(parent) || 0;
    groupCount.set(parent, idx + 1);
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(idx, 5) * 80}ms`);
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

  /* ---------- Lien de nav actif au scroll ---------- */
  const navLinks = document.querySelectorAll('.nav-links a');
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
