/* ═══════════════════════════════════════════════════════════
   DAVTECH II — JAVASCRIPT
   Toutes les fonctionnalités du site
═══════════════════════════════════════════════════════════ */

'use strict';

// ── LOADER ──────────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hide'), 1600);
  }
});

// ── NAVBAR SCROLL ───────────────────────────────────────────
(function() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  
  if (!navbar) return;
  
  function updateNav() {
    // Scrolled state
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    
    // Active link
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (window.scrollY >= top - 150 && window.scrollY < top + height - 150) {
        current = section.id;
      }
    });
    
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

// ── MENU MOBILE ─────────────────────────────────────────────
(function() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav-link');
  
  if (!toggle || !menu) return;
  
  const closeMenu = () => {
    toggle.classList.remove('active');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  };
  
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('active');
    menu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  
  links.forEach(link => link.addEventListener('click', closeMenu));
  
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });
})();

// ── SCROLL REVEAL ───────────────────────────────────────────
(function() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  reveals.forEach(el => observer.observe(el));
})();

// ── COMPTEURS ANIMÉS ────────────────────────────────────────
(function() {
  const counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;
  
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, step);
  }
  
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          counters.forEach(counter => animateCounter(counter));
        }, 500);
        heroObs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  
  heroObs.observe(hero);
})();

// ── BARRES DE COMPÉTENCES ───────────────────────────────────
(function() {
  const bars = document.querySelectorAll('.skill-fill[data-width]');
  const compSection = document.querySelector('.competences');
  
  if (!bars.length || !compSection) return;
  
  let animated = false;
  
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        bars.forEach((bar, i) => {
          setTimeout(() => {
            bar.style.width = bar.dataset.width + '%';
          }, i * 100);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  
  obs.observe(compSection);
})();

// ── FORMULAIRE CONTACT ──────────────────────────────────────
(function() {
  const form = document.getElementById('contactForm');
  const message = document.getElementById('formMessage');
  
  if (!form || !message) return;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
  
  function validate(data) {
    if (!data.name.trim()) {
      return 'Veuillez renseigner votre nom.';
    }
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      return 'Numéro de téléphone invalide.';
    }
    if (!emailRegex.test(data.email)) {
      return 'Adresse email invalide.';
    }
    if (!data.message.trim()) {
      return 'Veuillez décrire votre besoin.';
    }
    return null;
  }
  
  function showMessage(type, text) {
    message.className = 'form-message ' + type;
    message.innerHTML = text;
    message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (type === 'success') {
      setTimeout(() => {
        message.className = 'form-message';
      }, 8000);
    }
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const data = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      service: document.getElementById('service').value,
      message: document.getElementById('message').value
    };
    
    const error = validate(data);
    if (error) {
      showMessage('error', '<i class="fa-solid fa-circle-exclamation"></i> ' + error);
      return;
    }
    
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';
    
    // ── ENVOI FIREBASE FIRESTORE ───────────────────────────
    async function sendToFirebase() {
      if (!window.__firebaseReady || !window.__db) {
        showMessage('error', '<i class="fa-solid fa-circle-exclamation"></i> Firebase non configuré. Appelez-nous au <a href="tel:0142375751">01 42 37 57 51</a>.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Envoyer ma demande';
        return;
      }
      try {
        await window.__addDoc(window.__collection(window.__db, 'messages'), {
          ...data,
          date: window.__serverTimestamp(),
          lu: false
        });
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Envoyer ma demande';
        showMessage('success', '<i class="fa-solid fa-circle-check"></i> <strong>Message envoyé !</strong><br/>Nous vous recontacterons dans les plus brefs délais.');
        form.reset();
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Envoyer ma demande';
        showMessage('error', '<i class="fa-solid fa-circle-exclamation"></i> Erreur. Appelez-nous au <a href="tel:0142375751">01 42 37 57 51</a>.');
      }
    }

    if (window.__firebaseReady) {
      sendToFirebase();
    } else {
      window.addEventListener('firebaseReady', sendToFirebase, { once: true });
    }
  });
})();

// ── BACK TO TOP ─────────────────────────────────────────────
(function() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ── WHATSAPP FAB ANIMATION ──────────────────────────────────
(function() {
  const fab = document.getElementById('whatsappFab');
  if (!fab) return;
  
  // Animation de présence toutes les 10 secondes
  setInterval(() => {
    fab.style.transform = 'scale(1.15)';
    setTimeout(() => {
      fab.style.transform = '';
    }, 300);
  }, 10000);
})();

// ── SMOOTH SCROLL ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const target = document.querySelector(targetId);
    if (!target) return;
    
    e.preventDefault();
    
    const offset = 80;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Fermer le menu mobile si ouvert
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (toggle && menu) {
      toggle.classList.remove('active');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});

// ── HOVER MAGNETIQUE BOUTONS ────────────────────────────────
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-lg').forEach(btn => {
  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
    this.style.transform = `translate(${x}px, ${y}px)`;
  });
  
  btn.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

// ── PARALLAX HERO GLOW ──────────────────────────────────────
(function() {
  const glow = document.querySelector('.hero-glow');
  if (!glow) return;
  
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < 800) {
      glow.style.transform = `translateY(${y * 0.1}px)`;
    }
  }, { passive: true });
})();

// ── EASTER EGG : Triple-clic sur le logo ────────────────────
(function() {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  
  let clicks = 0;
  let timer = null;
  
  logo.addEventListener('click', (e) => {
    if (e.ctrlKey || e.metaKey) return; // Ignore if modifier key
    
    clicks++;
    
    if (timer) clearTimeout(timer);
    
    if (clicks === 3) {
      // Easter egg activé !
      document.body.style.background = 'linear-gradient(45deg, #ffd700, #000)';
      document.body.style.animation = 'hue-rotate 3s linear infinite';
      
      const style = document.createElement('style');
      style.textContent = '@keyframes hue-rotate { 0%{filter:hue-rotate(0deg);} 100%{filter:hue-rotate(360deg);} }';
      document.head.appendChild(style);
      
      setTimeout(() => {
        document.body.style.background = '';
        document.body.style.animation = '';
        style.remove();
      }, 3000);
      
      clicks = 0;
    } else {
      timer = setTimeout(() => { clicks = 0; }, 500);
    }
  });
})();

// ── LOG DE BIENVENUE ────────────────────────────────────────
console.log(
  '%c⚡ DAVTECH II ⚡',
  'font-size:24px; font-weight:bold; color:#ffd700; background:#000; padding:10px 20px; border-radius:5px;'
);
console.log(
  '%cÉlectricien Bâtiment Professionnel\nBAC F3 Électrotechnique\n\n📞 01 42 37 57 51\n📧 dansoudavid225@gmail.com',
  'font-size:14px; color:#666; line-height:1.8;'
);
