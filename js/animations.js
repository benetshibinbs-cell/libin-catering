/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * GSAP & Scroll Animations with Robust Layout Refresh
 */

(function () {
  'use strict';

  function initScrollAnimations() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof gsap === 'undefined') {
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Hero Section Entrance Animation
    if (document.querySelector('.hero-badge')) {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
      heroTl.fromTo('.hero-badge', { opacity: 0, y: -15 }, { opacity: 1, y: 0, delay: 0.1, clearProps: 'transform' })
            .fromTo('.hero-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, clearProps: 'transform' }, '-=0.4')
            .fromTo('.hero-desc', { opacity: 0, y: 15 }, { opacity: 1, y: 0, clearProps: 'transform' }, '-=0.4')
            .fromTo('.hero-btn-group', { opacity: 0, y: 15 }, { opacity: 1, y: 0, clearProps: 'transform' }, '-=0.4')
            .fromTo('.hero-stats', { opacity: 0, y: 15 }, { opacity: 1, y: 0, clearProps: 'transform' }, '-=0.3');
    }

    // 2. Scroll Trigger Card Reveals (Safe & Self-Cleaning)
    if (typeof ScrollTrigger !== 'undefined') {
      // Section headers
      gsap.utils.toArray('.section-header').forEach(header => {
        gsap.fromTo(header, 
          { opacity: 0, y: 25 }, 
          {
            scrollTrigger: {
              trigger: header,
              start: 'top 90%',
              toggleActions: 'play none none none',
              once: true
            },
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            clearProps: 'transform'
          }
        );
      });

      // Signature Service Cards
      const serviceCards = document.querySelectorAll('.service-card');
      if (serviceCards.length > 0) {
        gsap.fromTo(serviceCards,
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: serviceCards[0],
              start: 'top 90%',
              once: true
            },
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'transform'
          }
        );
      }

      // Why Choose Us Cards (Fixed & Safe)
      const whyCards = document.querySelectorAll('.why-us-card');
      if (whyCards.length > 0) {
        gsap.fromTo(whyCards,
          { opacity: 0, y: 25 },
          {
            scrollTrigger: {
              trigger: whyCards[0].closest('.row') || whyCards[0],
              start: 'top 92%',
              once: true
            },
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'transform'
          }
        );
      }

      // Animated Stat Counters
      document.querySelectorAll('.counter-val').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0', 10);
        if (target > 0) {
          ScrollTrigger.create({
            trigger: counter,
            start: 'top 92%',
            once: true,
            onEnter: () => {
              gsap.to(counter, {
                innerText: target,
                duration: 1.8,
                snap: { innerText: 1 },
                ease: 'power2.out'
              });
            }
          });
        }
      });

      // Refresh positions
      ScrollTrigger.refresh();
    }
  }

  // Global refresh method callable after dynamic DOM updates
  window.refreshScrollAnimations = function () {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  };

  document.addEventListener('DOMContentLoaded', initScrollAnimations);
  window.addEventListener('load', () => {
    if (window.refreshScrollAnimations) window.refreshScrollAnimations();
  });
})();
