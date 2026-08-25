/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * GSAP & Scroll Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof gsap === 'undefined') {
    return;
  }

  // Register ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 1. Hero Reveal Animations
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
  
  if (document.querySelector('.hero-badge')) {
    heroTl.from('.hero-badge', { opacity: 0, y: -20, delay: 0.2 })
          .from('.hero-title', { opacity: 0, y: 30, duration: 1 }, '-=0.5')
          .from('.hero-desc', { opacity: 0, y: 20 }, '-=0.6')
          .from('.hero-btn-group', { opacity: 0, y: 20 }, '-=0.5')
          .from('.hero-stats', { opacity: 0, y: 20 }, '-=0.4');
  }

  // 2. Scroll Trigger Card Reveals
  if (typeof ScrollTrigger !== 'undefined') {
    // Section headers reveal
    gsap.utils.toArray('.section-header').forEach(header => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    // Service Cards Stagger
    if (document.querySelectorAll('.service-card').length > 0) {
      gsap.from('.service-card', {
        scrollTrigger: {
          trigger: '.service-card',
          start: 'top 85%'
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out'
      });
    }

    // Why Choose Us Cards Stagger
    if (document.querySelectorAll('.why-us-card').length > 0) {
      gsap.from('.why-us-card', {
        scrollTrigger: {
          trigger: '.why-us-card',
          start: 'top 85%'
        },
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out'
      });
    }

    // Animated Counter for Stats
    const statCounters = document.querySelectorAll('.counter-val');
    statCounters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target') || '0', 10);
      if (target > 0) {
        ScrollTrigger.create({
          trigger: counter,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              innerText: target,
              duration: 2,
              snap: { innerText: 1 },
              ease: 'power2.out'
            });
          }
        });
      }
    });
  }

  // =========================================================================
  // 3. Cinematic Hero Fire & Glowing Embers Particle Engine
  // =========================================================================
  initHeroFireEffect();
});

function initHeroFireEffect() {
  const canvas = document.getElementById('heroFireCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animationFrameId = null;
  let isVisible = true;

  const particles = [];
  const MAX_PARTICLES = window.innerWidth < 768 ? 45 : 85;

  const PALETTE = [
    { r: 255, g: 235, b: 140 }, // Bright yellow/white core
    { r: 255, g: 175, b: 35 },  // Gold amber
    { r: 255, g: 110, b: 15 },  // Fiery orange
    { r: 235, g: 65,  b: 10 },  // Flame red
    { r: 197, g: 155, b: 39 }   // Libin gold
  ];

  function resizeCanvas() {
    const parent = canvas.parentElement || canvas.closest('.hero-section');
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
  }

  class FireEmber {
    constructor(isInitial = false) {
      this.reset(isInitial);
    }

    reset(isInitial = false) {
      this.x = Math.random() * width;
      this.y = isInitial ? Math.random() * height : height + Math.random() * 20;
      this.size = 1.2 + Math.random() * 2.8;
      this.baseSize = this.size;
      this.vy = -(0.7 + Math.random() * 1.6);
      this.vx = (Math.random() - 0.5) * 0.6;
      this.swaySpeed = 0.015 + Math.random() * 0.03;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.swayAmplitude = 0.4 + Math.random() * 0.8;
      this.life = 0;
      this.maxLife = 120 + Math.random() * 160;
      this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.flickerSpeed = 0.05 + Math.random() * 0.1;
      this.opacity = 0;
    }

    update(time) {
      this.life++;
      this.y += this.vy;
      this.x += this.vx + Math.sin(this.life * this.swaySpeed + this.swayOffset) * this.swayAmplitude;

      // Smooth fade-in, flicker, and fade-out
      const progress = this.life / this.maxLife;
      if (progress < 0.2) {
        this.opacity = (progress / 0.2) * 0.85;
      } else if (progress > 0.7) {
        this.opacity = ((1 - progress) / 0.3) * 0.85;
      } else {
        this.opacity = 0.65 + Math.sin(this.life * this.flickerSpeed) * 0.25;
      }

      this.size = Math.max(0.5, this.baseSize * (1 - progress * 0.4));

      if (this.life >= this.maxLife || this.y < -10 || this.x < -20 || this.x > width + 20) {
        this.reset(false);
      }
    }

    draw(context) {
      if (this.opacity <= 0) return;

      context.save();
      context.globalAlpha = Math.max(0, Math.min(1, this.opacity));

      // Draw glowing ember
      const { r, g, b } = this.color;
      const glowRad = this.size * 2.8;

      const grad = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRad);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
      grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.5)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      context.fillStyle = grad;
      context.beginPath();
      context.arc(this.x, this.y, glowRad, 0, Math.PI * 2);
      context.fill();

      // Sharp central spark
      context.fillStyle = `rgba(255, 255, 255, ${Math.min(1, this.opacity + 0.2)})`;
      context.beginPath();
      context.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
      context.fill();

      context.restore();
    }
  }

  // Populate initial particle pool
  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push(new FireEmber(true));
    }
  }

  let lastTime = 0;
  function render(time) {
    if (!isVisible) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(time);
      particles[i].draw(ctx);
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Setup observer to pause when scrolled away
  const heroSection = canvas.closest('.hero-section');
  if (heroSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible = true;
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(render);
          }
        } else {
          isVisible = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(heroSection);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
  }, { passive: true });

  resizeCanvas();
  initParticles();
  animationFrameId = requestAnimationFrame(render);
}

