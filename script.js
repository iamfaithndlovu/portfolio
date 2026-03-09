/* ============================================================
   FAITH NDLOVU — Portfolio Script
   Vanilla JS — No frameworks, no dependencies
   ============================================================ */

'use strict';

// ── Utility: debounce ─────────────────────────────────────
function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

// ── 1. Custom Cursor — Crosshair ──────────────────────────
(function initCursor() {
  const cross = document.getElementById('cursorCross');
  if (!cross) return;

  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cross.style.left = mx + 'px';
    cross.style.top  = my + 'px';
  });

  // Hover effect on interactive elements
  const hoverEls = document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card, .badge-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cross.classList.add('hover'));
    el.addEventListener('mouseleave', () => cross.classList.remove('hover'));
  });

  document.addEventListener('mouseleave', () => { cross.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cross.style.opacity = '1'; });
})();

// ── 2. Navigation: scroll behaviour & active links ────────
(function initNav() {
  const nav     = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll detection
  const onScroll = debounce(() => {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    // Active link highlight
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, 10);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu if open
      closeMobileMenu();
    });
  });
})();

// ── 3. Mobile Menu ────────────────────────────────────────
const menuBtn    = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu() {
  menuBtn?.classList.remove('open');
  mobileMenu?.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}

menuBtn?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

// Close when clicking outside the nav
document.addEventListener('click', e => {
  const nav = document.getElementById('nav');
  if (mobileMenu?.classList.contains('open') && !nav?.contains(e.target)) {
    closeMobileMenu();
  }
});

// ── 4. Hero Canvas — Particle Network ─────────────────────
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const ACCENT  = '#2b45ff';
  const ACCENT2 = '#3b82f6';
  let W, H, particles;
  const COUNT   = 80;
  const RADIUS  = 140;
  const DOT_R   = 1.5;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = DOT_R;
      this.color = Math.random() > 0.5 ? ACCENT : ACCENT2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < RADIUS) {
          const alpha = (1 - dist / RADIUS) * 0.25;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(43,69,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', debounce(resize, 200));
  init();
  draw();
})();

// ── 5. Scroll Reveal ──────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up');

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  els.forEach(el => observer.observe(el));

  // Trigger hero elements immediately
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up').forEach(el => el.classList.add('visible'));
  }, 100);
})();

// ── 6. Skill Bars ─────────────────────────────────────────
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        fill.style.width = fill.dataset.width + '%';
        observer.unobserve(fill);
      }
    }),
    { threshold: 0.4 }
  );

  fills.forEach(fill => observer.observe(fill));
})();

// ── 7. Terminal Typewriter ────────────────────────────────
(function initTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = [
    { type: 'cmd',    text: 'whoami' },
    { type: 'output', text: 'faith_ndlovu' },
    { type: 'cmd',    text: 'cat roles.txt' },
    { type: 'output', text: 'Frontend Developer' },
    { type: 'output', text: 'Penetration Tester' },
    { type: 'cmd',    text: 'nmap -sV localhost' },
    { type: 'output', text: 'PORT     STATE   SERVICE' },
    { type: 'output', text: '80/tcp   open    http' },
    { type: 'output', text: '443/tcp  open    https' },
    { type: 'cmd',    text: 'python3 enum.py --target 127.0.0.1' },
    { type: 'output', text: '[+] Scanning...' },
    { type: 'output', text: '[+] 3 vulnerabilities found' },
    { type: 'output', text: '[!] Reporting done.' },
  ];

  body.innerHTML = '';

  let lineIdx = 0;
  let charIdx = 0;
  let currentEl = null;

  // Cursor blink element
  function appendCursor() {
    const cursor = document.createElement('span');
    cursor.className = 'typed-cursor';
    cursor.textContent = '_';
    return cursor;
  }

  function typeLine() {
    if (lineIdx >= lines.length) {
      // Stop after full reveal so terminal remains static.
      return;
    }

    const line   = lines[lineIdx];
    const row    = document.createElement('div');
    row.className = 'term-line';

    if (line.type === 'cmd') {
      const prompt = document.createElement('span');
      prompt.className = 'prompt';
      prompt.textContent = '$ ';
      row.appendChild(prompt);

      const cmdEl = document.createElement('span');
      cmdEl.className = 'cmd';
      row.appendChild(cmdEl);
      body.appendChild(row);
      currentEl = cmdEl;

      typeChars(line.text, 60, () => {
        lineIdx++;
        charIdx = 0;
        setTimeout(typeLine, 250);
      });
    } else {
      row.classList.add('output');
      row.textContent = line.text;
      body.appendChild(row);
      lineIdx++;
      charIdx = 0;
      setTimeout(typeLine, 100);
    }

    body.scrollTop = body.scrollHeight;
  }

  function typeChars(text, speed, cb) {
    if (charIdx < text.length) {
      currentEl.textContent = text.slice(0, charIdx + 1);
      charIdx++;
      setTimeout(() => typeChars(text, speed, cb), speed);
    } else {
      cb();
    }
  }

  function typeNextLine() { typeLine(); }

  // Only start when terminal is in view
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      typeNextLine();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(body);
})();

// ── 8. Contact Form ───────────────────────────────────────
(function initContactForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submit = document.getElementById('formSubmit');
  if (!form) return;

  function validate() {
    let ok = true;
    ['name', 'email', 'message'].forEach(id => {
      const el = form.elements[id];
      const empty = !el.value.trim();
      const emailBad = id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
      if (empty || emailBad) {
        el.classList.add('error');
        ok = false;
      } else {
        el.classList.remove('error');
      }
    });
    return ok;
  }

  form.addEventListener('input', e => {
    e.target.classList.remove('error');
    status.textContent = '';
    status.className   = 'form-status';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) {
      status.textContent = 'Please fill in all fields correctly.';
      status.className   = 'form-status error';
      return;
    }

    submit.classList.add('loading');
    submit.disabled = true;
    status.textContent = '';
    status.className   = 'form-status';

    // Simulate sending — replace with real fetch/FormSubmit/EmailJS etc.
    setTimeout(() => {
      submit.classList.remove('loading');
      submit.disabled = false;
      status.textContent = "Message sent — I'll get back to you soon!";
      status.className   = 'form-status';
      form.reset();
    }, 1800);
  });
})();

// ── 9. Footer year ────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── 10. Project card tilt effect ──────────────────────────
(function initTilt() {
  document.querySelectorAll('.project-card, .skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ── 11. Quote of the Day ──────────────────────────────────
(function initQuote() {
  const quotes = [
    { text: "The quieter you become, the more you are able to hear.", author: "Kali Linux motto" },
    { text: "An attacker only needs to find one way in; a defender needs to protect everything.", author: "Security Proverb" },
    { text: "Offense informs defense.", author: "Red Team Philosophy" },
    { text: "Know your enemy and know yourself — in a hundred battles, you will never be defeated.", author: "Sun Tzu" },
    { text: "Security is not a product, but a process.", author: "Bruce Schneier" },
    { text: "Hackers are the immune system of the internet.", author: "Keren Elazari" },
    { text: "The only truly secure system is one that is powered off.", author: "Gene Spafford" },
    { text: "With great power comes great responsibility. Use it ethically.", author: "Ethical Hacker Code" },
    { text: "If you think technology can solve your security problems, then you don't understand the problems and you don't understand the technology.", author: "Bruce Schneier" },
    { text: "Every system is hackable. The question is whether you find it before someone else does.", author: "Unknown" },
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Penetration testing is the art of thinking like an attacker while acting like a professional.", author: "Unknown" },
  ];

  const textEl   = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  const refreshBtn = document.getElementById('quoteRefresh');
  if (!textEl || !authorEl) return;

  // Use date seed for daily quote, but allow manual refresh
  let currentIdx = new Date().getDate() % quotes.length;

  function showQuote(idx, animate) {
    const q = quotes[idx];
    if (animate) {
      textEl.style.opacity = '0';
      authorEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent   = '"' + q.text + '"';
        authorEl.textContent = '— ' + q.author;
        textEl.style.opacity = '1';
        authorEl.style.opacity = '1';
      }, 300);
    } else {
      textEl.textContent   = '"' + q.text + '"';
      authorEl.textContent = '— ' + q.author;
    }
  }

  showQuote(currentIdx, false);

  refreshBtn?.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % quotes.length;
    showQuote(currentIdx, true);
  });
})();
