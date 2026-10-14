/**
 * ============================================================================
 * ADITYA PRATAMA — VISUAL COMMUNICATION DESIGN PORTFOLIO 2026
 * MAIN CONTROLLER SCRIPT (main.js)
 * Implements: Preloader, Custom Cursor, Magnetic Effects, 3D Card Tilt,
 * Scroll Reveals, Horizontal Archive Scroll, Filter System, Modal Dialog,
 * Contact Form, Dynamic Local Clock & Interactive Hero Canvas.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. PRELOADER & LOADING SEQUENCE
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderCounter = document.getElementById('preloader-counter');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderStatus = document.getElementById('preloader-status');

  const statusMessages = [
    'INITIALIZING ASSETS',
    'CALIBRATING 3D SHADERS',
    'COMPOSITING MOTION GRAPHICS',
    'LOADING DESIGN TOKENS',
    'READY FOR EXPLORATION'
  ];

  let loadProgress = 0;
  const loadDuration = 1800; // ms
  const intervalTime = 25;
  const incrementStep = 100 / (loadDuration / intervalTime);

  const loadingInterval = setInterval(() => {
    loadProgress += incrementStep + Math.random() * 2.5;

    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(loadingInterval);
      finishLoading();
    }

    if (preloaderCounter) {
      preloaderCounter.textContent = Math.floor(loadProgress);
    }
    if (preloaderBar) {
      preloaderBar.style.width = `${loadProgress}%`;
    }

    // Update status text based on percentage
    if (preloaderStatus) {
      const statusIdx = Math.min(
        Math.floor((loadProgress / 100) * statusMessages.length),
        statusMessages.length - 1
      );
      preloaderStatus.textContent = statusMessages[statusIdx];
    }
  }, intervalTime);

  function finishLoading() {
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('preloader--done');
      }
      document.body.classList.remove('loading');

      // Trigger initial animations
      triggerHeroAnimations();

      // Remove preloader from DOM flow after animation finishes
      setTimeout(() => {
        if (preloader) {
          preloader.classList.add('preloader--hidden');
        }
      }, 1000);
    }, 400);
  }

  function triggerHeroAnimations() {
    const heroReveals = document.querySelectorAll('#hero .reveal-fade, #hero .reveal-text');
    heroReveals.forEach((el) => {
      el.classList.add('active');
    });
  }

  /* ==========================================================================
     2. CUSTOM CURSOR WITH LERP & MAGNETIC ATTRACTION
     ========================================================================== */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorCircle = document.getElementById('cursor-circle');

  let mouseX = -100;
  let mouseY = -100;
  let circleX = -100;
  let circleY = -100;
  let isCursorVisible = false;

  // Track real mouse position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isCursorVisible) {
      isCursorVisible = true;
      if (cursorDot) cursorDot.classList.remove('cursor--hidden');
      if (cursorCircle) cursorCircle.classList.remove('cursor--hidden');
    }

    // Dot follows instantly
    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }
  }, { passive: true });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    isCursorVisible = false;
    if (cursorDot) cursorDot.classList.add('cursor--hidden');
    if (cursorCircle) cursorCircle.classList.add('cursor--hidden');
  });

  // Smooth lerp loop for the outer circle
  function updateCursor() {
    // Lerp formula: current + (target - current) * factor
    circleX += (mouseX - circleX) * 0.16;
    circleY += (mouseY - circleY) * 0.16;

    if (cursorCircle) {
      cursorCircle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0)`;
    }

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Expand cursor on interactive elements
  const interactiveSelectors = 'a, button, input, select, textarea, .project-card, .tool-badge, .chip, .timeline__card';
  document.querySelectorAll(interactiveSelectors).forEach((elem) => {
    elem.addEventListener('mouseenter', () => {
      if (cursorCircle) cursorCircle.classList.add('cursor--hover');
    });
    elem.addEventListener('mouseleave', () => {
      if (cursorCircle) cursorCircle.classList.remove('cursor--hover');
    });
  });

  /* Magnetic button physics */
  const magneticButtons = document.querySelectorAll('.magnetic-btn');
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Magnetic pull factor
      const pull = 0.28;
      btn.style.transform = `translate3d(${distanceX * pull}px, ${distanceY * pull}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });

  /* ==========================================================================
     3. STICKY SMART NAVIGATION & MOBILE MENU
     ========================================================================== */
  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Background blur when scrolled past header height
    if (currentScrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    // Hide on scroll down, show on scroll up
    if (currentScrollY > 200 && currentScrollY > lastScrollY && !mobileMenu.classList.contains('mobile-menu--open')) {
      header.classList.add('header--hidden');
    } else {
      header.classList.remove('header--hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // Mobile menu toggle
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('mobile-menu--open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on clicking mobile links
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  function openMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('mobile-menu--open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('mobile-menu--open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     4. INTERSECTION OBSERVER SCROLL REVEALS & STAT COUNTERS
     ========================================================================== */
  const revealElements = document.querySelectorAll(
    '.reveal-fade:not(#hero *), .reveal-slide-up, .reveal-slide-left, .reveal-slide-right'
  );

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  });

  revealElements.forEach((elem) => revealObserver.observe(elem));

  /* Number Counter Animation in About Section */
  const statItems = document.querySelectorAll('.stat-item');
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const item = entry.target;
        const targetVal = parseInt(item.getAttribute('data-count'), 10);
        const counterValEl = item.querySelector('.counter-val');

        if (counterValEl && !item.classList.contains('counted')) {
          item.classList.add('counted');
          animateCounter(counterValEl, targetVal);
        }
        observer.unobserve(item);
      }
    });
  }, { threshold: 0.5 });

  statItems.forEach((item) => statsObserver.observe(item));

  function animateCounter(element, target) {
    const duration = 1600; // ms
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);

      element.textContent = current < 10 && target < 10 ? `0${current}` : current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target < 10 ? `0${target}` : target;
      }
    }

    requestAnimationFrame(step);
  }

  /* Animated Skill Bars on Scroll */
  const skillBarItems = document.querySelectorAll('.skill-bar-item');
  const skillsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.skill-bar-fill');
        if (fill) {
          fill.classList.add('filled');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBarItems.forEach((item) => skillsObserver.observe(item));

  /* ==========================================================================
     5. WORKS / PROJECTS FILTER SYSTEM
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Toggle active states on buttons
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterCategory = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        const match = filterCategory === 'all' || cardCategory === filterCategory;

        if (match) {
          card.classList.remove('card--hidden');
          card.classList.add('filter-enter');
          setTimeout(() => {
            card.classList.remove('filter-enter');
          }, 400);
        } else {
          card.classList.add('card--hidden');
        }
      });
    });
  });

  /* ==========================================================================
     6. 3D CARD TILT EFFECT (Vanilla JS Physics)
     ========================================================================== */
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7; // Max degrees
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  /* ==========================================================================
     7. FEATURED PROJECTS HORIZONTAL SCROLL & CONTROLS
     ========================================================================== */
  const trackContainer = document.getElementById('featured-track-container');
  const featTrack = document.getElementById('featured-track');
  const featPrevBtn = document.getElementById('feat-prev');
  const featNextBtn = document.getElementById('feat-next');
  const featProgressBar = document.getElementById('featured-progress-bar');

  if (trackContainer && featTrack) {
    // Update progress bar on scroll
    trackContainer.addEventListener('scroll', () => {
      const maxScroll = trackContainer.scrollWidth - trackContainer.clientWidth;
      if (maxScroll > 0) {
        const percentage = (trackContainer.scrollLeft / maxScroll) * 100;
        if (featProgressBar) {
          featProgressBar.style.width = `${Math.max(percentage, 10)}%`;
        }
      }
    }, { passive: true });

    // Next / Prev buttons
    if (featNextBtn) {
      featNextBtn.addEventListener('click', () => {
        const scrollAmount = trackContainer.clientWidth * 0.75;
        trackContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }

    if (featPrevBtn) {
      featPrevBtn.addEventListener('click', () => {
        const scrollAmount = trackContainer.clientWidth * 0.75;
        trackContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }

    // Mouse drag scrolling support
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    trackContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      trackContainer.classList.add('active');
      startX = e.pageX - trackContainer.offsetLeft;
      scrollLeft = trackContainer.scrollLeft;
    });

    trackContainer.addEventListener('mouseleave', () => {
      isDown = false;
      trackContainer.classList.remove('active');
    });

    trackContainer.addEventListener('mouseup', () => {
      isDown = false;
      trackContainer.classList.remove('active');
    });

    trackContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - trackContainer.offsetLeft;
      const walk = (x - startX) * 1.6; // Scroll speed multiplier
      trackContainer.scrollLeft = scrollLeft - walk;
    });
  }

  /* ==========================================================================
     8. PROJECT DETAIL MODAL DIALOG
     ========================================================================== */
  const projectModal = document.getElementById('project-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss');

  // Case study database
  const projectDatabase = {
    p1: {
      title: 'Aetheria Brand System',
      category: 'GRAPHIC DESIGN',
      year: '2025',
      discipline: 'Visual Identity & Editorial',
      tools: 'Photoshop · Illustrator · InDesign',
      deliverables: 'Brand Manual, Custom Font, Stationery, Signage',
      role: 'Lead Visual Designer',
      desc: 'Aetheria is an avant-garde architectural atelier based in Kyoto and Zurich. The objective was to craft a monolithic yet delicate visual identity system that mirrored their spatial philosophy: concrete solidity juxtaposed with ethereal natural light.',
      solution: 'Developed a bespoke typographic system featuring sharp high-contrast serif headlines paired with modular geometric grids. Created tactile print collateral using blind debossing, cotton rag stock, and sustainable metallic foil accents.'
    },
    p2: {
      title: 'Kronos Wealth OS',
      category: 'UI/UX DESIGN',
      year: '2026',
      discipline: 'Fintech & Mobile Product Design',
      tools: 'Figma · Protopie · Cinema 4D',
      deliverables: 'iOS Design System, Web Terminal, Micro-interactions',
      role: 'Product Designer & Design Ops',
      desc: 'Kronos is an algorithmic wealth management platform catering to modern private investors. The challenge was converting complex portfolio variance, high-frequency yield data, and risk metrics into an effortlessly legible, serene interface.',
      solution: 'Architected a modular dashboard with customizable data widgets, dark-mode-first contrast ratios meeting WCAG AAA compliance, and haptic feedback triggers for trade execution. Accelerated user task completion by 42%.'
    },
    p3: {
      title: 'Chrono Motion Film',
      category: 'VIDEO EDITING & MOTION',
      year: '2025',
      discipline: 'Commercial Editing & Color Grade',
      tools: 'Premiere Pro · DaVinci Resolve · After Effects',
      deliverables: '90s Hero Film, Social Cutdowns, Sound Mix',
      role: 'Director, Editor & Colorist',
      desc: 'A fast-paced commercial brand film created for a sustainable performance outerwear line. Shot on location across volcanic terrains and urban skylines, requiring seamless cross-environment continuity.',
      solution: 'Employed rhythmic match cuts, dynamic time remapping, and an ACES color management pipeline that brought out rich earthy tones against deep slate shadows. Engineered custom binaural sound design for visceral immersion.'
    },
    p4: {
      title: 'Cybernetic Artifacts',
      category: '3D GENERALIST',
      year: '2026',
      discipline: 'Hard Surface 3D & Procedural Art',
      tools: 'Blender · Octane Render · Substance Painter',
      deliverables: '12 Digital Sculptures, Animation Loops, 8K Textures',
      role: '3D Concept Artist & Shading Specialist',
      desc: 'An exploratory series investigating speculative technological relics unearthed in a post-human era. Focus was placed on extreme micro-detail, functional mechanical logic, and realistic material degradation.',
      solution: 'Constructed intricate procedural displacement maps and custom micro-roughness shaders in Octane. Simulated realistic anisotropic metal reflections and dust accumulation layers, rendered at photorealistic fidelity.'
    },
    p5: {
      title: 'Neo-Kyoto Poster Reel',
      category: 'GRAPHIC DESIGN',
      year: '2025',
      discipline: 'Experimental Print & Typography',
      tools: 'Illustrator · Photoshop · Risograph',
      deliverables: '10 Exhibition Prints, Catalog Book, Augmented Reality AR',
      role: 'Art Director & Typographer',
      desc: 'An exhibition poster series investigating brutalist urbanism and kanji-latin typographic synthesis. Explored traditional Japanese woodblock composition principles filtered through dystopian cyber-industrial aesthetics.',
      solution: 'Utilized multi-pass spot neon risograph printing combined with custom variable glyphs. Integrated WebAR triggers allowing gallery visitors to animate the static posters in real-time through their mobile devices.'
    },
    p6: {
      title: 'Lumen Design System',
      category: 'UI/UX DESIGN',
      year: '2025',
      discipline: 'Enterprise Design Systems',
      tools: 'Figma Tokens · Storybook · HTML/CSS',
      deliverables: '140+ Components, Guidelines, Interactive Sandbox',
      role: 'Design System Architect',
      desc: 'An enterprise-scale multi-brand design system unified across four subsidiary applications, accommodating millions of active daily enterprise users.',
      solution: 'Standardized global design tokens across color, spacing, elevation, and motion curves. Established comprehensive accessibility documentation, zero-regressions component variants, and an automated Figma-to-code synchronizer.'
    },
    p7: {
      title: 'Soundwave Dynamics',
      category: 'VIDEO EDITING & MOTION',
      year: '2026',
      discipline: 'Music Video & Kinetic Motion',
      tools: 'After Effects · Cinema 4D · Premiere',
      deliverables: 'Full Official Music Video, Stage Visuals, Teasers',
      role: 'Motion Director & Animator',
      desc: 'Official visualizer and promotional music film for an electronic producer. The project demanded continuous fluid kinetic typography responding organically to 140 BPM audio transients.',
      solution: 'Built audio-reactive expression rigs in After Effects coupled with 3D camera projection mapping onto abstract geometric planes, creating an illusion of infinite rhythmic perspective.'
    },
    p8: {
      title: 'Solaris Biosphere',
      category: '3D GENERALIST',
      year: '2025',
      discipline: '3D Environment Art & Worldbuilding',
      tools: 'Cinema 4D · Redshift · World Creator',
      deliverables: '3D Biome Suite, Fly-through Camera Pass, Asset Library',
      role: 'Lead 3D Environment Artist',
      desc: 'An extraterrestrial terrain exploration project depicting atmospheric conditions under a binary star system. Balanced speculative botanical geometry with photorealistic geological realism.',
      solution: 'Sculpted complex procedural mountain ranges and volumetric dust cloud simulations. Optimized multi-million polygon instancing arrays in Redshift with GPU-accelerated raytracing passes.'
    },
    'p-feat-1': {
      title: 'Project Omega: Spatial Interface Engine',
      category: 'FEATURED DIRECTIVE',
      year: '2026',
      discipline: 'Interactive 3D Web & Spatial UI',
      tools: 'Blender · Three.js · Figma',
      deliverables: 'WebGL Interactive Showcase, UI Suite, Sound Design',
      role: 'Lead 3D & UI Designer',
      desc: 'A groundbreaking web experience built for an electric flagship prototype. Allows visitors to manipulate realistic 3D vehicle geometry, examine aerodynamics through real-time particle streams, and customize spatial interior moods.',
      solution: 'Pioneered low-draw-call GLTF model compression allowing desktop-grade 3D graphics on mobile browsers at 60 FPS. Combined seamlessly with minimalist editorial layouts.'
    },
    'p-feat-2': {
      title: 'Vortex: 360° Dynamic Brand Universe',
      category: 'FEATURED DIRECTIVE',
      year: '2025',
      discipline: 'Omnichannel Brand System & Packaging',
      tools: 'Illustrator · After Effects · Cinema 4D',
      deliverables: 'Brand System, 3D Mockups, Kinetic Guidelines, Packaging',
      role: 'Brand Identity & Motion Director',
      desc: 'Comprehensive brand overhaul for a high-end acoustic engineering studio. The visual system was derived mathematically from resonant sound frequencies and wave physics.',
      solution: 'Designed an algorithmic logo generator that morphs based on sound input, complemented by sculptural matte-black packaging with debossed acoustic wave patterns.'
    },
    'p-feat-3': {
      title: 'Nebula: Sci-Fi Narrative Trailer',
      category: 'FEATURED DIRECTIVE',
      year: '2025',
      discipline: 'CGI Direction & Visual Effects',
      tools: 'Blender · Premiere Pro · DaVinci Resolve',
      deliverables: '3-Minute Narrative Film, FX Breakdown, Sound Design',
      role: 'Director · 3D Generalist · Sound Designer',
      desc: 'An ambitious CGI short film exploring isolation aboard an interstellar research vessel navigating a dying nebula. Built from concept sketches to final color delivery over nine months.',
      solution: 'Modeled detailed spaceship interiors, zero-gravity liquid physics, and nebula gas volumetric lighting. Recognized with awards at digital art film festivals.'
    },
    'p-feat-4': {
      title: 'Aura Mobile OS: Neomorphic UI Suite',
      category: 'FEATURED DIRECTIVE',
      year: '2026',
      discipline: 'Radical Mobile Product Design',
      tools: 'Figma · Principle · Protopie',
      deliverables: 'Complete OS Guidelines, 80+ Screens, Interactive Prototypes',
      role: 'Product Designer',
      desc: 'A reimagining of modern mobile operating systems that eliminates visual clutter in favor of soft lighting, tangible physics, and intent-driven predictive interfaces.',
      solution: 'Created an accessible depth model that replaces hard boundaries with organic elevation layers, paired with bespoke typography that enhances readability across varied lighting conditions.'
    }
  };

  // Open modal handler
  function openProjectModal(projectId) {
    const data = projectDatabase[projectId];
    if (!data) return;

    const modalCategory = document.getElementById('modal-category');
    const modalYear = document.getElementById('modal-year');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalSolution = document.getElementById('modal-solution');
    const modalDiscipline = document.getElementById('modal-discipline');
    const modalTools = document.getElementById('modal-tools');
    const modalDeliverables = document.getElementById('modal-deliverables');
    const modalRole = document.getElementById('modal-role');
    const modalVisual = document.getElementById('modal-visual');

    if (modalCategory) modalCategory.textContent = data.category;
    if (modalYear) modalYear.textContent = data.year;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.desc;
    if (modalSolution) modalSolution.textContent = data.solution;
    if (modalDiscipline) modalDiscipline.textContent = data.discipline;
    if (modalTools) modalTools.textContent = data.tools;
    if (modalDeliverables) modalDeliverables.textContent = data.deliverables;
    if (modalRole) modalRole.textContent = data.role;

    // Set styled modal visual preview
    if (modalVisual) {
      modalVisual.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; gap:1rem; text-align:center; padding:2rem;">
          <div style="font-family:var(--font-mono); font-size:0.875rem; color:var(--accent); letter-spacing:0.15em;">[ EXHIBIT PREVIEW // ${data.year} ]</div>
          <div style="font-family:var(--font-heading); font-size:1.75rem; font-weight:700; color:var(--text-primary); text-transform:uppercase;">${data.title}</div>
          <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${data.tools}</div>
        </div>
      `;
    }

    projectModal.classList.add('modal--open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeProjectModal() {
    projectModal.classList.remove('modal--open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Card click triggers
  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const pId = card.getAttribute('data-project-id');
      openProjectModal(pId);
    });
  });

  // Featured open modal buttons
  document.querySelectorAll('.open-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.getAttribute('data-target');
      openProjectModal(pId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.classList.contains('modal--open')) {
      closeProjectModal();
    }
  });

  /* ==========================================================================
     9. CONTACT SECTION: COPY EMAIL & FORM VALIDATION
     ========================================================================== */
  const copyBtn = document.getElementById('copy-email-btn');
  const copyTooltip = document.getElementById('copy-tooltip');
  const emailAddress = document.getElementById('email-address');

  if (copyBtn && emailAddress && copyTooltip) {
    copyBtn.addEventListener('click', () => {
      const emailText = emailAddress.textContent.trim();
      navigator.clipboard.writeText(emailText).then(() => {
        copyTooltip.textContent = 'Copied!';
        copyTooltip.classList.add('tooltip--show');

        setTimeout(() => {
          copyTooltip.classList.remove('tooltip--show');
          setTimeout(() => {
            copyTooltip.textContent = 'Copy';
          }, 200);
        }, 2000);
      }).catch(() => {
        // Fallback
        copyTooltip.textContent = 'Copied!';
        copyTooltip.classList.add('tooltip--show');
        setTimeout(() => copyTooltip.classList.remove('tooltip--show'), 2000);
      });
    });
  }

  // Form Handling
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        emailInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        messageInput.closest('.form-group').classList.remove('has-error');
      }

      if (!isValid) return;

      // Animate submit button state
      if (submitBtn) {
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Transmitting...';
      }

      // Simulate network response
      setTimeout(() => {
        if (formSuccess) formSuccess.classList.add('show');
        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          const btnText = submitBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'Proposal Transmitted';
        }

        // Hide success banner after 6 seconds
        setTimeout(() => {
          if (formSuccess) formSuccess.classList.remove('show');
          if (submitBtn) {
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Transmit Proposal';
          }
        }, 6000);
      }, 1000);
    });

    // Clear errors on input
    contactForm.querySelectorAll('.form-input').forEach((input) => {
      input.addEventListener('input', () => {
        input.closest('.form-group').classList.remove('has-error');
      });
    });
  }

  /* ==========================================================================
     10. FOOTER: LIVE CLOCK & BACK TO TOP
     ========================================================================== */
  const liveClock = document.getElementById('live-clock');

  function updateClock() {
    if (!liveClock) return;
    const now = new Date();
    // Format for Jakarta UTC+7
    const options = {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    try {
      liveClock.textContent = new Intl.DateTimeFormat('en-GB', options).format(now);
    } catch (e) {
      // Fallback
      liveClock.textContent = now.toTimeString().split(' ')[0];
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Set current year
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Back to top button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     11. INTERACTIVE HERO CANVAS PARTICLES & AMBIENT GRAPH
     ========================================================================== */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = 42;
    let animFrameId = null;
    let isHeroInView = true;

    function resizeCanvas() {
      width = canvas.parentElement.offsetWidth;
      height = canvas.parentElement.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.8 + 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(196, 163, 90, 0.45)' : 'rgba(163, 128, 48, 0.35)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function renderCanvas() {
      if (!isHeroInView) return;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const maxDistance = 140;

      // Draw lines between proximate particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.12 : 0.08);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark ? `rgba(196, 163, 90, ${alpha})` : `rgba(163, 128, 48, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animFrameId = requestAnimationFrame(renderCanvas);
    }

    animFrameId = requestAnimationFrame(renderCanvas);

    // Pause canvas calculation when hero is scrolled out of view for performance
    const heroSection = document.getElementById('hero');
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroInView = entry.isIntersecting;
        if (isHeroInView && !animFrameId) {
          animFrameId = requestAnimationFrame(renderCanvas);
        }
      });
    }, { threshold: 0.05 });

    if (heroSection) heroObserver.observe(heroSection);
  }
});
