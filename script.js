/* =========================================================
   TexNova — script.js
   Menu mobile · smooth scroll · reveal on scroll · extras
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav__link');
  const toTop = document.getElementById('toTop');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ano automático no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menu mobile (hambúrguer) ---------- */
  const closeMenu = () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    navMenu.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('menu-open');
  };

  navToggle.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920 && navMenu.classList.contains('open')) closeMenu();
  });

  /* ---------- Smooth scroll com compensação do header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const offset = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset + 1;

      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Header ao rolar + botão voltar ao topo ---------- */
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    toTop.classList.toggle('visible', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Link ativo conforme a seção visível ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(section => sectionObserver.observe(section));

  /* ---------- Revelação ao rolar (escalonada) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  // Atraso escalonado para itens irmãos (cards, passos, pilares)
  document.querySelectorAll('.services__grid, .timeline, .pillars__list, .hero__text, .team__grid').forEach(group => {
    group.querySelectorAll(':scope > .reveal').forEach((el, i) => {
      el.style.setProperty('--delay', `${i * 0.1}s`);
    });
  });

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Contadores animados do hero ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = el => {
    const end = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) { el.textContent = end + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Fotos da equipe: mostra iniciais se a foto não existir ---------- */
  document.querySelectorAll('.member__photo img').forEach(img => {
    const showInitials = () => img.closest('.member__photo').classList.add('no-photo');
    if (img.complete && img.naturalWidth === 0) showInitials();
    img.addEventListener('error', showInitials);
  });

  /* ---------- Brilho que acompanha o mouse nos cards ---------- */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  /* ---------- Formulário de contato (simulado) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    const validate = field => {
      const wrapper = field.closest('.field');
      let valid = field.checkValidity();
      if (field.type === 'email' && field.value) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      }
      wrapper.classList.toggle('invalid', !valid);
      return valid;
    };

    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validate(field));
      field.addEventListener('input', () => {
        if (field.closest('.field').classList.contains('invalid')) validate(field);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('[required]')];
      const allValid = fields.map(validate).every(Boolean);

      status.className = 'form__status';
      if (!allValid) {
        status.textContent = 'Por favor, preencha os campos obrigatórios corretamente.';
        status.classList.add('error');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      // Simulação de envio — substitua por integração real (API, e-mail, CRM)
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.textContent = original;
        status.textContent = 'Solicitação enviada! Um especialista TexNova entrará em contato em breve.';
        status.classList.add('success');
      }, 1200);
    });
  }
});
