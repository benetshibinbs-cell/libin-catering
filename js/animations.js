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
});

