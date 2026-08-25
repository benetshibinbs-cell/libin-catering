/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Cinematic Hero Atmosphere Engine (WebGL / Three.js + GLSL Procedural Shaders)
 * 
 * Features:
 * - Multi-octave GLSL Fractional Brownian Motion (FBM) Volumetric Smoke/Fog
 * - Organic Warm Firelight Bloom & Subtle Flame Harmonics
 * - Floating Glowing Ember Particles with Additive Blending
 * - Mouse-Responsive Parallax Depth & Mobile Touch Adaptation
 * - Automatic Performance Throttle (IntersectionObserver & PixelRatio Clamping)
 * - Pure CSS Graceful Degradation Fallback
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check WebGL availability
  function isWebGLSupported() {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function initHeroAtmosphere() {
    const container = document.querySelector('.hero-fx-container');
    const canvas = document.getElementById('heroAtmosphereCanvas');
    const fallbackEl = document.querySelector('.hero-fx-fallback');

    if (!container || !canvas) return;

    // If WebGL is not supported, Three.js is not loaded, or reduced motion is active -> Activate CSS Fallback
    if (!isWebGLSupported() || typeof THREE === 'undefined' || prefersReducedMotion) {
      if (fallbackEl) fallbackEl.style.display = 'block';
      if (canvas) canvas.style.display = 'none';
      return;
    }

    try {
      const heroSection = container.closest('.hero-section') || container;
      let width = heroSection.clientWidth || window.innerWidth;
      let height = heroSection.clientHeight || window.innerHeight;

      // -----------------------------------------------------------------------
      // 1. Scene, Camera, and High-Performance Renderer
      // -----------------------------------------------------------------------
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance'
      });

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);

      // -----------------------------------------------------------------------
      // 2. GLSL Procedural Fog & Organic Firelight Bloom Shader
      // -----------------------------------------------------------------------
      const fogVertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fogFragmentShader = `
        precision highp float;
        varying vec2 vUv;
        
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;

        // 2D Hash & Simplex-style Noise
        vec2 hash2(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(
            mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
            mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
        }

        // Fractional Brownian Motion (4 octaves for rich volumetric smoke)
        float fbm(vec2 p) {
          float value = 0.0;
          float amp = 0.52;
          float freq = 1.0;
          for (int i = 0; i < 4; i++) {
            value += amp * noise(p * freq);
            freq *= 2.12;
            amp *= 0.48;
          }
          return value;
        }

        void main() {
          vec2 uv = vUv;
          float aspect = uResolution.x / uResolution.y;
          vec2 st = uv * vec2(aspect, 1.0);

          // Subtle interactive parallax offset
          vec2 mouseOffset = (uMouse - 0.5) * 0.08;

          // Slow organic smoke motion (drift right + convective billow up)
          float t = uTime * 0.07;
          vec2 smokeUv1 = st * 1.35 + vec2(-t * 0.45, -t * 0.25) + mouseOffset * 0.5;
          vec2 smokeUv2 = st * 2.2 + vec2(t * 0.32, -t * 0.4) - mouseOffset * 0.8;

          // Multi-layer turbulence
          float n1 = fbm(smokeUv1);
          float n2 = fbm(smokeUv2 + n1 * 0.65);
          float combinedSmoke = smoothstep(-0.25, 0.65, n2);

          // Height gradient: denser near bottom, dissipating gently toward the top
          float heightGradient = smoothstep(1.05, 0.0, uv.y);
          float smokeDensity = combinedSmoke * heightGradient * 0.38;

          // -------------------------------------------------------------------
          // Organic Firelight Glow / Hearth Bloom
          // -------------------------------------------------------------------
          // Positioned at bottom center-left, shifting subtly with mouse
          vec2 fireCenter = vec2(0.48 + mouseOffset.x * 0.4, 0.02 + mouseOffset.y * 0.2);
          float fireDist = length((uv - fireCenter) * vec2(aspect * 0.85, 1.3));
          
          // Organic compound sine wave harmonics for warm flame breathing
          float firePulse = sin(uTime * 1.1) * 0.08 + 
                            sin(uTime * 2.4 + 1.2) * 0.05 + 
                            sin(uTime * 0.45) * 0.12;

          float fireGlow = exp(-fireDist * (2.8 - firePulse * 0.6)) * (0.85 + firePulse);
          fireGlow = clamp(fireGlow, 0.0, 1.0);

          // Luxury Palette
          // Deep noir smoke
          vec3 smokeColor = vec3(0.07, 0.075, 0.09);
          // Rich amber/gold flame glow
          vec3 flameAmber = vec3(1.0, 0.48, 0.12);
          vec3 flameGold = vec3(0.85, 0.68, 0.22);
          vec3 fireLight = mix(flameAmber, flameGold, smoothstep(0.0, 0.7, fireGlow));

          // Composite lighting on smoke
          vec3 finalColor = smokeColor * smokeDensity + fireLight * (fireGlow * 0.42);
          float finalAlpha = clamp(smokeDensity * 0.75 + fireGlow * 0.38, 0.0, 0.72);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `;

      const fogUniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
      };

      const fogMaterial = new THREE.ShaderMaterial({
        vertexShader: fogVertexShader,
        fragmentShader: fogFragmentShader,
        uniforms: fogUniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false
      });

      const fogPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fogMaterial);
      scene.add(fogPlane);

      // -----------------------------------------------------------------------
      // 3. Floating Glowing Ember Particles (GPU Points + Additive Blending)
      // -----------------------------------------------------------------------
      const emberCount = window.innerWidth < 768 ? 32 : 68;
      const emberGeometry = new THREE.BufferGeometry();

      const positions = new Float32Array(emberCount * 3);
      const randoms = new Float32Array(emberCount * 4); // [speedY, swayFreq, swayAmp, phase]
      const scales = new Float32Array(emberCount);
      const colorTypes = new Float32Array(emberCount);

      for (let i = 0; i < emberCount; i++) {
        // Distribute across screen coordinates (-1 to 1)
        positions[i * 3 + 0] = (Math.random() * 2 - 1);
        positions[i * 3 + 1] = (Math.random() * 2 - 1);
        positions[i * 3 + 2] = 0;

        randoms[i * 4 + 0] = 0.0018 + Math.random() * 0.0035; // speed Y
        randoms[i * 4 + 1] = 0.8 + Math.random() * 1.6;        // sway frequency
        randoms[i * 4 + 2] = 0.04 + Math.random() * 0.12;      // sway amplitude
        randoms[i * 4 + 3] = Math.random() * Math.PI * 2;      // phase offset

        scales[i] = 2.0 + Math.random() * 4.5;
        colorTypes[i] = Math.random(); // mix factor between gold & amber spark
      }

      emberGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      emberGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 4));
      emberGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
      emberGeometry.setAttribute('aColorType', new THREE.BufferAttribute(colorTypes, 1));

      const emberVertexShader = `
        attribute vec4 aRandom;
        attribute float aScale;
        attribute float aColorType;

        uniform float uTime;
        uniform vec2 uMouse;

        varying float vAlpha;
        varying float vColorType;

        void main() {
          vec3 pos = position;
          float t = uTime;

          // Upward convective drift
          float speedY = aRandom.x;
          float swayFreq = aRandom.y;
          float swayAmp = aRandom.z;
          float phase = aRandom.w;

          // Progressive upward movement with loop reset
          float yOffset = mod(pos.y + 1.0 + t * speedY * 60.0, 2.2) - 1.1;
          
          // Horizontal swaying
          float xOffset = pos.x + sin(t * swayFreq + phase) * swayAmp + (uMouse.x - 0.5) * 0.06;

          vec3 finalPos = vec3(xOffset, yOffset, 0.0);

          // Subtle twinkle & edge fading
          float normalizedY = (yOffset + 1.0) * 0.5;
          float heightFade = smoothstep(0.0, 0.25, normalizedY) * smoothstep(1.0, 0.65, normalizedY);
          float twinkle = 0.7 + 0.3 * sin(t * 3.5 + phase * 4.0);

          vAlpha = heightFade * twinkle * 0.9;
          vColorType = aColorType;

          gl_Position = vec4(finalPos, 1.0);
          gl_PointSize = aScale * (0.85 + 0.3 * twinkle);
        }
      `;

      const emberFragmentShader = `
        precision highp float;
        varying float vAlpha;
        varying float vColorType;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Soft Gaussian point falloff with incandescent center
          float softCircle = smoothstep(0.5, 0.05, dist);
          float hotCore = smoothstep(0.18, 0.0, dist);

          vec3 goldColor = vec3(1.0, 0.82, 0.32);
          vec3 amberColor = vec3(1.0, 0.45, 0.12);
          vec3 emberColor = mix(amberColor, goldColor, vColorType);
          emberColor += vec3(1.0, 1.0, 0.9) * hotCore * 0.65;

          gl_FragColor = vec4(emberColor, vAlpha * softCircle);
        }
      `;

      const emberUniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
      };

      const emberMaterial = new THREE.ShaderMaterial({
        vertexShader: emberVertexShader,
        fragmentShader: emberFragmentShader,
        uniforms: emberUniforms,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });

      const emberPoints = new THREE.Points(emberGeometry, emberMaterial);
      scene.add(emberPoints);

      // -----------------------------------------------------------------------
      // 4. Mouse Tracking & Fluid Parallax Interpolation
      // -----------------------------------------------------------------------
      const targetMouse = { x: 0.5, y: 0.5 };
      const currentMouse = { x: 0.5, y: 0.5 };

      window.addEventListener('mousemove', (e) => {
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
      }, { passive: true });

      // Touch handler for mobile parallax
      window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          targetMouse.x = e.touches[0].clientX / window.innerWidth;
          targetMouse.y = 1.0 - (e.touches[0].clientY / window.innerHeight);
        }
      }, { passive: true });

      // -----------------------------------------------------------------------
      // 5. Render Loop & IntersectionObserver Lifecycle
      // -----------------------------------------------------------------------
      let isVisible = true;
      let animFrameId = null;
      const clock = new THREE.Clock();

      function animate() {
        if (!isVisible) return;

        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse damping (lerp)
        currentMouse.x += (targetMouse.x - currentMouse.x) * 0.04;
        currentMouse.y += (targetMouse.y - currentMouse.y) * 0.04;

        // Add subtle auto-drift for mobile when mouse is still
        const autoDriftX = Math.sin(elapsedTime * 0.35) * 0.03;
        const autoDriftY = Math.cos(elapsedTime * 0.28) * 0.02;

        const finalMouseX = currentMouse.x + autoDriftX;
        const finalMouseY = currentMouse.y + autoDriftY;

        // Update uniforms
        fogUniforms.uTime.value = elapsedTime;
        fogUniforms.uMouse.value.set(finalMouseX, finalMouseY);

        emberUniforms.uTime.value = elapsedTime;
        emberUniforms.uMouse.value.set(finalMouseX, finalMouseY);

        renderer.render(scene, camera);
        animFrameId = requestAnimationFrame(animate);
      }

      // Resize handler
      function handleResize() {
        width = heroSection.clientWidth || window.innerWidth;
        height = heroSection.clientHeight || window.innerHeight;

        renderer.setSize(width, height);
        fogUniforms.uResolution.value.set(width, height);
      }

      window.addEventListener('resize', handleResize, { passive: true });

      // Pause loop when scrolled out of view to preserve 100% battery & CPU
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              isVisible = true;
              if (!animFrameId) {
                clock.start();
                animFrameId = requestAnimationFrame(animate);
              }
            } else {
              isVisible = false;
              if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
              }
            }
          });
        }, { threshold: 0.05 });

        observer.observe(heroSection);
      }

      // Start animation
      animFrameId = requestAnimationFrame(animate);

    } catch (err) {
      console.warn('WebGL hero atmosphere initialization fallback active:', err);
      if (fallbackEl) fallbackEl.style.display = 'block';
      if (canvas) canvas.style.display = 'none';
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroAtmosphere);
  } else {
    initHeroAtmosphere();
  }
})();
