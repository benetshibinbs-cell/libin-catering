/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Light Cinematic Fire & Smoke Atmosphere Engine (Particles Removed)
 * 
 * Features:
 * - Light & Soft Procedural Fire Flame Simulation (Domain-Warped GLSL Simplex FBM)
 * - Gentle Volumetric Wispy Smoke with Warm Culinary Firelight
 * - Clean & Elegant: Ember/Spark Particles Removed for a Minimal Luxury Aesthetic
 * - Interactive Subtle Wind Wake (Mouse & Touch Drag Deflection)
 * - Ultra Smooth 60 FPS GPU Shader with 2D Canvas Fallback
 * - Responsive Resolution Clamping & IntersectionObserver Battery Preservation
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    if (prefersReducedMotion) {
      if (fallbackEl) fallbackEl.style.display = 'block';
      if (canvas) canvas.style.display = 'none';
      return;
    }

    // Check if Three.js is available & WebGL is supported
    if (!isWebGLSupported() || typeof THREE === 'undefined') {
      initCanvas2DFallback(canvas, container);
      return;
    }

    try {
      const heroSection = container.closest('.hero-section') || container;
      let width = heroSection.clientWidth || window.innerWidth;
      let height = heroSection.clientHeight || window.innerHeight;

      // -----------------------------------------------------------------------
      // 1. Scene, Orthographic Camera, and High-Performance Renderer
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
      // 2. Light Procedural Fire & Gentle Wispy Smoke GLSL Shader
      // -----------------------------------------------------------------------
      const fireSmokeVertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fireSmokeFragmentShader = `
        precision highp float;
        varying vec2 vUv;
        
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec2 uWind;

        // 2D Hash & Fast Simplex-style Noise
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

        // Multi-octave Fractional Brownian Motion (Light Smoke & Flame turbulence)
        float fbm(vec2 p) {
          float v = 0.0;
          float amp = 0.5;
          float freq = 1.0;
          for (int i = 0; i < 4; i++) {
            v += amp * noise(p * freq);
            freq *= 2.1;
            amp *= 0.48;
          }
          return v;
        }

        // Domain-warping for soft, organic smoke eddies
        float domainWarpFbm(vec2 p, float time) {
          vec2 q = vec2(
            fbm(p + vec2(0.0, -time * 0.3)),
            fbm(p + vec2(4.2, 1.1 - time * 0.25))
          );

          vec2 r = vec2(
            fbm(p + 2.8 * q + vec2(1.4 - time * 0.35, 7.2)),
            fbm(p + 2.8 * q + vec2(6.3, 2.2 - time * 0.4))
          );

          return fbm(p + 3.0 * r);
        }

        void main() {
          vec2 uv = vUv;
          float aspect = uResolution.x / uResolution.y;
          vec2 st = vec2(uv.x * aspect, uv.y);

          // Subtle interactive mouse wind deflection
          vec2 mouseOffset = (uMouse - vec2(0.5, 0.3)) * 0.12;
          vec2 windOffset = uWind * 0.1;
          vec2 totalOffset = mouseOffset + windOffset;

          float t = uTime;

          // ===================================================================
          // 1. LIGHT & SOFT CULINARY FIRE FLAMES (Base Warmth)
          // ===================================================================
          vec2 fireBaseSt = vec2(st.x - (0.5 * aspect + totalOffset.x * 0.5), st.y - 0.0);
          
          // Gentle upward convection
          vec2 flameCoord = vec2(fireBaseSt.x * 2.2, fireBaseSt.y * 3.0);
          float flameTime = t * 1.6;

          // Soft flame domain-warping
          float flameWarp1 = fbm(flameCoord * 1.5 + vec2(totalOffset.x * 1.2, -flameTime * 1.1));
          float flameWarp2 = fbm(flameCoord * 2.6 + vec2(-flameWarp1 * 1.4, -flameTime * 1.6));
          
          vec2 warpedFlameUv = flameCoord + vec2(flameWarp1 * 0.45, flameWarp2 * 0.6);
          float flameNoise = fbm(warpedFlameUv + vec2(0.0, -flameTime * 0.9));

          // Base flame parabolic mask (gentle tapering width)
          float flameWidth = 1.1 + 0.12 * sin(t * 1.4);
          float flameShape = 1.0 - (fireBaseSt.x * fireBaseSt.x) / (flameWidth * flameWidth);
          flameShape = clamp(flameShape, 0.0, 1.0);

          // Soft height envelope: gentle, warm, lower-third presence
          float flameHeight = 0.38 + 0.08 * sin(t * 2.0 + flameWarp1 * 1.5);
          float flameVerticalFade = smoothstep(flameHeight, 0.01, uv.y);

          // Light flame intensity (soft & ethereal, not harsh)
          float flameIntensity = (flameNoise * 0.55 + 0.45) * flameShape * flameVerticalFade;
          flameIntensity = pow(flameIntensity, 1.5) * 1.1;
          flameIntensity = clamp(flameIntensity, 0.0, 0.85);

          // Soft Culinary Flame Heat Palette (Elegantly Balanced)
          vec3 coreWhiteGold = vec3(1.0, 0.96, 0.88);   // Soft incandescent warm white
          vec3 warmSaffron = vec3(1.0, 0.75, 0.22);     // Saffron gold
          vec3 softAmber = vec3(1.0, 0.45, 0.10);       // Gentle amber
          vec3 gentleRed = vec3(0.70, 0.12, 0.04);      // Soft ruby rim

          vec3 flameColor = gentleRed;
          flameColor = mix(flameColor, softAmber, smoothstep(0.12, 0.38, flameIntensity));
          flameColor = mix(flameColor, warmSaffron, smoothstep(0.38, 0.68, flameIntensity));
          flameColor = mix(flameColor, coreWhiteGold, smoothstep(0.68, 0.95, flameIntensity));

          // Gentle ambient hearth fire bloom glow
          float hearthDist = length(vec2((uv.x - 0.5) * aspect * 0.85, (uv.y - 0.02) * 1.6));
          float hearthPulse = 0.88 + 0.12 * sin(t * 1.8) + 0.05 * cos(t * 3.2);
          float hearthGlow = exp(-hearthDist * 2.4) * hearthPulse * 0.45;
          vec3 hearthBloomColor = mix(softAmber, warmSaffron, 0.6);

          // ===================================================================
          // 2. LIGHT & WISPY VOLUMETRIC SMOKE PLUMES
          // ===================================================================
          // Smoke rises gently and dissipates into delicate culinary wisps
          float smokeTime = t * 0.28;
          vec2 smokeUv1 = vec2(st.x * 1.2 + totalOffset.x * 0.6, st.y * 1.4 - smokeTime * 0.65);
          vec2 smokeUv2 = vec2(st.x * 1.8 - totalOffset.x * 0.5, st.y * 1.9 - smokeTime * 0.9);

          float smokeWarp = domainWarpFbm(smokeUv1, smokeTime);
          float smokeNoise2 = fbm(smokeUv2 + smokeWarp * 0.7);

          // Soft wispy smoke density
          float smokeDensity = smoothstep(-0.15, 0.7, smokeNoise2 + smokeWarp * 0.3);
          
          // Gentle vertical envelope: fades out smoothly upwards
          float smokeVerticalEnvelope = smoothstep(0.0, 0.2, uv.y) * smoothstep(0.95, 0.15, uv.y);
          smokeDensity *= smokeVerticalEnvelope * 0.42;

          // Warm firelight rim illumination on smoke
          float fireIllumination = exp(-length(vec2((uv.x - 0.5) * aspect * 1.0, uv.y * 1.7)) * 2.1) * hearthPulse;
          
          // Culinary soft vapor tones
          vec3 ambientVapor = vec3(0.42, 0.40, 0.44);     // Soft translucent vapor
          vec3 illuminatedVapor = vec3(0.95, 0.68, 0.32); // Warm firelit golden smoke
          vec3 smokeColor = mix(ambientVapor, illuminatedVapor, clamp(fireIllumination * 1.1, 0.0, 0.75));

          // ===================================================================
          // 3. COMPOSITE LIGHT FIRE & SMOKE
          // ===================================================================
          vec3 finalColor = vec3(0.0);
          
          // Add soft illuminated smoke
          finalColor += smokeColor * (smokeDensity * 0.7);

          // Add gentle hearth fire bloom
          finalColor += hearthBloomColor * (hearthGlow * 0.35);

          // Add soft licking flame accents
          finalColor += flameColor * (flameIntensity * 0.75);

          // Clean, soft alpha transparency for light atmospheric luxury
          float finalAlpha = clamp(
            flameIntensity * 0.65 + 
            smokeDensity * 0.45 + 
            hearthGlow * 0.35, 
            0.0, 0.55
          );

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `;

      const fireUniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.3) },
        uWind: { value: new THREE.Vector2(0.0, 0.0) }
      };

      const fireMaterial = new THREE.ShaderMaterial({
        vertexShader: fireSmokeVertexShader,
        fragmentShader: fireSmokeFragmentShader,
        uniforms: fireUniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false
      });

      const firePlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fireMaterial);
      scene.add(firePlane);

      // -----------------------------------------------------------------------
      // 3. Pointer Tracking & Subtle Fluid Wind Impulse
      // -----------------------------------------------------------------------
      const targetMouse = { x: 0.5, y: 0.3 };
      const currentMouse = { x: 0.5, y: 0.3 };
      const windVelocity = { x: 0.0, y: 0.0 };
      let lastMousePos = { x: 0.5, y: 0.3, time: performance.now() };

      function onPointerMove(clientX, clientY) {
        const x = clientX / window.innerWidth;
        const y = 1.0 - (clientY / window.innerHeight);
        
        targetMouse.x = x;
        targetMouse.y = y;

        const now = performance.now();
        const dt = Math.max(now - lastMousePos.time, 16) / 1000;
        const vx = (x - lastMousePos.x) / dt;
        const vy = (y - lastMousePos.y) / dt;

        // Apply gentle wind push
        windVelocity.x = Math.max(-1.0, Math.min(1.0, windVelocity.x + vx * 0.025));
        windVelocity.y = Math.max(-1.0, Math.min(1.0, windVelocity.y + vy * 0.025));

        lastMousePos = { x, y, time: now };
      }

      window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      // -----------------------------------------------------------------------
      // 4. Render Loop & Lifecycle Optimizations
      // -----------------------------------------------------------------------
      let isVisible = true;
      let animFrameId = null;
      const clock = new THREE.Clock();

      function animate() {
        if (!isVisible) return;

        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse damping (lerp)
        currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
        currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;

        // Wind velocity damping & organic ambient draft
        windVelocity.x *= 0.95;
        windVelocity.y *= 0.95;

        const ambientDraftX = Math.sin(elapsedTime * 0.5) * 0.03;
        const ambientDraftY = Math.cos(elapsedTime * 0.35) * 0.015;

        const totalWindX = windVelocity.x + ambientDraftX;
        const totalWindY = windVelocity.y + ambientDraftY;

        // Update Shader Uniforms
        fireUniforms.uTime.value = elapsedTime;
        fireUniforms.uMouse.value.set(currentMouse.x, currentMouse.y);
        fireUniforms.uWind.value.set(totalWindX, totalWindY);

        renderer.render(scene, camera);
        animFrameId = requestAnimationFrame(animate);
      }

      // Resize Handler
      function handleResize() {
        width = heroSection.clientWidth || window.innerWidth;
        height = heroSection.clientHeight || window.innerHeight;

        renderer.setSize(width, height);
        fireUniforms.uResolution.value.set(width, height);
      }

      window.addEventListener('resize', handleResize, { passive: true });

      // IntersectionObserver for 0% battery/CPU consumption when scrolled out of view
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
      console.warn('WebGL initialization error, falling back to Canvas 2D:', err);
      initCanvas2DFallback(canvas, container);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Clean & Lightweight Canvas 2D Fallback Engine (No Particles)
  // ---------------------------------------------------------------------------
  function initCanvas2DFallback(canvas, container) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const fallbackEl = document.querySelector('.hero-fx-fallback');
      if (fallbackEl) fallbackEl.style.display = 'block';
      return;
    }

    const heroSection = container.closest('.hero-section') || container;
    let width = (canvas.width = heroSection.clientWidth || window.innerWidth);
    let height = (canvas.height = heroSection.clientHeight || window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = heroSection.clientWidth || window.innerWidth;
      height = canvas.height = heroSection.clientHeight || window.innerHeight;
    }, { passive: true });

    // Soft Wispy Smoke & Flame Puffs (No Sparks/Particles)
    const puffs = [];
    const puffCount = 28;

    class SmokePuff2D {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = width * (0.35 + Math.random() * 0.3);
        this.y = init ? height * (0.5 + Math.random() * 0.5) : height + Math.random() * 20;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -(0.8 + Math.random() * 1.4);
        this.radius = 35 + Math.random() * 55;
        this.maxRadius = this.radius * (1.8 + Math.random() * 1.2);
        this.alpha = 0.0;
        this.maxAlpha = 0.08 + Math.random() * 0.12;
        this.life = 0;
        this.maxLife = 140 + Math.random() * 100;
        this.isWarm = Math.random() > 0.6;
      }

      update() {
        this.life++;
        this.x += this.vx + Math.sin(this.life * 0.04) * 0.4;
        this.y += this.vy;
        this.radius += (this.maxRadius - this.radius) * 0.012;

        const progress = this.life / this.maxLife;
        if (progress < 0.25) {
          this.alpha = (progress / 0.25) * this.maxAlpha;
        } else if (progress > 0.55) {
          this.alpha = (1.0 - (progress - 0.55) / 0.45) * this.maxAlpha;
        }

        if (this.life >= this.maxLife || this.y < -this.radius) {
          this.reset();
        }
      }

      draw(c) {
        if (this.alpha <= 0) return;
        c.save();
        c.beginPath();
        const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        
        if (this.isWarm) {
          grad.addColorStop(0, `rgba(255, 180, 60, ${this.alpha * 0.9})`);
          grad.addColorStop(0.45, `rgba(220, 110, 30, ${this.alpha * 0.45})`);
          grad.addColorStop(1, 'rgba(120, 40, 10, 0)');
        } else {
          grad.addColorStop(0, `rgba(210, 195, 185, ${this.alpha * 0.65})`);
          grad.addColorStop(0.5, `rgba(90, 85, 95, ${this.alpha * 0.3})`);
          grad.addColorStop(1, 'rgba(40, 35, 45, 0)');
        }

        c.fillStyle = grad;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    for (let i = 0; i < puffCount; i++) {
      puffs.push(new SmokePuff2D());
    }

    function loop2D() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      puffs.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      requestAnimationFrame(loop2D);
    }

    loop2D();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroAtmosphere);
  } else {
    initHeroAtmosphere();
  }
})();
