/**
 * ============================================================================
 * ADITYA FAZAR SANJAYA — 3D VISUALIZATION & DIGITAL CONTENT CREATION
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

  // Case study database matching Aditya Fazar Sanjaya's authentic CV
  const projectDatabase = {
    p1: {
      title: 'Digital Twin NTU WP3',
      category: '3D & AR/VR',
      year: '2024',
      discipline: 'Digital Twin & Research Visualization',
      tools: 'Blender · Unity · Unreal Engine',
      deliverables: '3D Digital Twin Assets, Engine Integration, Research Pipeline',
      role: '3D Artist Intern (SCCIC ITB)',
      desc: 'Responsible for accurate and high-detail 3D asset visualization for the Digital Twin NTU WP3 research initiative at the Smart City & Community Innovation Center (SCCIC ITB).',
      solution: 'Modeled functional spatial geometries in Blender and integrated assets into Unity and Unreal Engine pipelines, ensuring research data was represented with scientific accuracy and real-time performance.'
    },
    p2: {
      title: 'Indonesian Warship AR System',
      category: '3D & AR/VR',
      year: '2023',
      discipline: 'Augmented Reality & Naval Visualization',
      tools: 'Blender · AR Engine · PBR Pipeline',
      deliverables: 'Functional 3D Warship Assets, Interactive AR Deployment, Optimized Topology',
      role: 'Freelance 3D Artist (LPPM STMIK AMIK Bandung)',
      desc: 'Designed and produced functional, scale-accurate 3D assets for a large-scale Augmented Reality project visualizing the Indonesian Naval Warship (Kapal Perang Indonesia) for LPPM STMIK AMIK Bandung.',
      solution: 'Engineered clean hard-surface geometry with low draw-calls to enable smooth mobile AR projection while preserving essential architectural details and armament configurations.'
    },
    p3: {
      title: 'Metaverse Balai Kota Bandung & Dago Dipatiukur',
      category: '3D & AR/VR',
      year: '2023',
      discipline: 'Metaverse Development & Urban Digital Twin',
      tools: 'Blender · Unreal Engine · Unity',
      deliverables: 'Phase 1 & 2 Civic Assets, Real-Time Interactive Environment, Prototype Simulation',
      role: 'Lead 3D Artist & Metaverse Researcher',
      desc: 'Served as the core 3D Artist in the Metaverse Balai Kota Bandung research project (Phase 1 & 2) and the Dago Dipatiukur Ganesha Digital Twin research prototype for SCCIC ITB.',
      solution: 'Managed full pipeline from spatial photogrammetry to polygonal modeling, texturing, and engine optimization, transforming civic urban research data into immersive virtual environments.'
    },
    p4: {
      title: 'Urbansolv Integrated 3D & Brand Identity',
      category: 'VISUAL & BRAND DESIGN',
      year: '2025',
      discipline: '3D Generalist & Creative Coordination',
      tools: 'Blender · Illustrator · Presentation Decks',
      deliverables: '3D Project Visualizations, Brand Presentation Decks, Instagram Content',
      role: 'Senior 3D Generalist & Creative Coordinator',
      desc: 'Key coordinator for Urbansolv creative team, driving production and management of corporate visual assets, pitch decks, and Instagram branding content under Lead direction.',
      solution: 'Produced professional 3D visual renders for enterprise projects, coordinated internal and social documentation, and designed UI foundations during an impactful 10-month tenure.'
    },
    p5: {
      title: 'Interactive AR: Story of Malin Kundang',
      category: '3D & AR/VR',
      year: '2023',
      discipline: 'Cultural Heritage & Augmented Reality',
      tools: 'Blender · Unity · AR Frameworks',
      deliverables: 'Interactive AR Environment, Character Models, Storyboard Animation',
      role: '3D Artist & AR Experience Designer',
      desc: 'A mobile Augmented Reality cultural initiative bringing the classic Indonesian folklore "Story of Malin Kundang" into an engaging, educational 3D spatial format.',
      solution: 'Created character and environmental 3D models with optimized polygon budgets for smooth mobile performance, incorporating interactive touch triggers to animate narrative chapters.'
    },
    p6: {
      title: 'Bandung Creative Hub Magazine & Media',
      category: 'DIGITAL CONTENT',
      year: '2025',
      discipline: 'Editorial Photography & Visual Media',
      tools: 'Digital Photography · Lightroom · Premiere Pro',
      deliverables: 'Lead Magazine Photojournalism, Editorial Layouts, Regular Instagram Visuals',
      role: 'Internship Content Creator & Lead Magazine Photographer',
      desc: 'Lead photographer for Bandung Creative HUB internal magazine, responsible for capturing creative sector events and developing regular social media content.',
      solution: 'Delivered high-impact photo stories and consistent social media visual assets across digital and print media, reinforcing Bandung Creative Hub regional brand reputation.'
    },
    p7: {
      title: 'STMIK AMIK Bandung Official Video Series',
      category: 'DIGITAL CONTENT',
      year: '2023',
      discipline: 'End-to-End Video Production & Direction',
      tools: 'Premiere Pro · After Effects · Multi-Camera Studio',
      deliverables: 'Official YouTube Channel Series, Instagram Reels, Event Documentation',
      role: 'Content Producer & Video Lead',
      desc: 'Led full production lifecycle for official STMIK AMIK Bandung YouTube channel and institutional digital marketing campaigns over a 19-month period.',
      solution: 'Managed concepting, filming, documentary coverage, and post-production color and sound, driving significant increases in institutional audience engagement and social metrics.'
    },
    p8: {
      title: 'BEM STMIK Amik Digital Media Ecosystem',
      category: 'VISUAL & BRAND DESIGN',
      year: '2024',
      discipline: 'Department Leadership & Information Infrastructure',
      tools: 'Figma · Illustrator · Graphic Systems',
      deliverables: 'Department Media Guidelines, Public Campaign Graphics, Information Architecture',
      role: 'Head of Communication & IT Department (BEM)',
      desc: 'Led and managed the student executive board departmental team focusing on digital communication, campus publications, and media infrastructure.',
      solution: 'Streamlined design pipelines for social media announcements, graphic publications, and campus outreach, fostering student advocacy and transparent institutional information.'
    },
    'p-feat-1': {
      title: 'Digital Twin NTU WP3 (SCCIC ITB)',
      category: 'FEATURED RESEARCH',
      year: '2024',
      discipline: 'Digital Twin & Advanced 3D Engine Integration',
      tools: 'Blender · Unity · Unreal Engine',
      deliverables: 'Real-Time 3D Research Assets, Spatial Geometries, Engine Shaders',
      role: '3D Artist Intern',
      desc: 'Pioneering scientific visualization for the Digital Twin NTU WP3 research initiative conducted with Smart City & Community Innovation Center (SCCIC ITB).',
      solution: 'Accurately modeled complex architectural and functional structures in Blender, optimizing vertex counts and UV layouts for real-time physics and research data rendering in Unreal Engine and Unity.'
    },
    'p-feat-2': {
      title: 'Metaverse Balai Kota Bandung & Dago Dipatiukur',
      category: 'FEATURED METAVERSE',
      year: '2023',
      discipline: 'Virtual City & Spatial Computing',
      tools: 'Blender · Unreal Engine · Spatial Computing',
      deliverables: 'Civic Metaverse Assets (Phase 1 & 2), Dago Dipatiukur Digital Twin Prototype',
      role: 'Lead 3D Artist & Researcher',
      desc: 'Groundbreaking civic metaverse research transforming Bandung historical and administrative landmarks into an interactive virtual twin.',
      solution: 'Executed photorealistic spatial modeling, PBR material synthesis, and real-time engine staging, successfully translating municipal research into an exploratory virtual realm.'
    },
    'p-feat-3': {
      title: 'Indonesian Warship AR System (LPPM STMIK)',
      category: 'FEATURED AUGMENTED REALITY',
      year: '2023',
      discipline: 'High-Fidelity AR Military Visualization',
      tools: 'Blender · AR Frameworks · Substance Texturing',
      deliverables: 'Scale 3D Warship Assets, Interactive Tactical Breakdowns, Mobile AR App',
      role: '3D Artist & AR Specialist',
      desc: 'Large-scale Augmented Reality visualization of the Indonesian Warship (Kapal Perang Indonesia) engineered for educational and institutional research.',
      solution: 'Constructed an anatomically accurate 3D model with optimized draw calls, layered deck breakdowns, and real-world scale tracking for mobile AR devices.'
    },
    'p-feat-4': {
      title: 'Urbansolv Integrated 3D & Creative Direction',
      category: 'FEATURED COMMERCIAL',
      year: '2025',
      discipline: 'Senior 3D Generalist & Creative Coordination',
      tools: 'Blender · Illustrator · Presentation Decks',
      deliverables: 'Corporate 3D Visuals, Investor Presentation Assets, Social Branding',
      role: 'Senior 3D Generalist & Creative Coordinator',
      desc: 'End-to-end creative coordination and 3D visual production for Urbansolv corporate initiatives and high-stake presentations.',
      solution: 'Served as key coordinator across the creative team, ensuring brand consistency across Instagram campaigns, pitch decks, and architectural 3D visualizations.'
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
