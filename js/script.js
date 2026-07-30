/* ================================================================
   PORTFOLIO SCRIPT - TECHNICAL VIEWPORT SYSTEM
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initCustomCursor();
    initNavigation();
    initScrollReveal();
    initProjects();
    initCounters();
    initContactForm();
    initModelViewer();

    // Mise à jour automatique de l'année
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ----------------------------------------------------------------
   FONCTIONS GLOBALE POUR LE SLIDER ET LE CARROUSEL D'IMAGES (HTML)
---------------------------------------------------------------- */

/**
 * Défilement horizontal de la grille de projets
 * @param {'left'|'right'} direction
 */
function scrollProjects(direction) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const scrollAmount = 360; // Distance de défilement en px
    grid.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
    });
}

/**
 * Navigation dans les images d'une carte de projet
 * @param {HTMLElement} button
 * @param {number} direction (-1 pour précédent, 1 pour suivant)
 */
function changeProjectImage(button, direction) {
    const mediaContainer = button.closest('.project-card__media');
    if (!mediaContainer) return;

    const images = mediaContainer.querySelectorAll('.project-card__img-item');
    const counter = mediaContainer.querySelector('.img-counter');

    if (images.length <= 1) return;

    let activeIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    if (activeIndex === -1) activeIndex = 0;

    images[activeIndex].classList.remove('active');
    let newIndex = (activeIndex + direction + images.length) % images.length;
    images[newIndex].classList.add('active');

    if (counter) {
        counter.textContent = `${newIndex + 1}/${images.length}`;
    }
}

/* ----------------------------------------------------------------
   STARFIELD BACKGROUND
---------------------------------------------------------------- */
function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let stars = [];
    let width, height;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        generateStars();
    }

    function generateStars() {
        const count = Math.min(280, Math.floor((width * height) / 5200));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.2 + 0.3,
            baseAlpha: Math.random() * 0.5 + 0.25,
            twinkleSpeed: Math.random() * 0.015 + 0.004,
            twinklePhase: Math.random() * Math.PI * 2,
            depth: Math.random() * 0.6 + 0.4,
        }));
    }

    let shootingStar = null;
    function maybeSpawnShootingStar() {
        if (shootingStar || prefersReducedMotion) return;
        if (Math.random() < 0.0015) {
            const startX = Math.random() * width * 0.6;
            shootingStar = {
                x: startX,
                y: Math.random() * height * 0.3,
                vx: 6 + Math.random() * 4,
                vy: 3 + Math.random() * 2,
                life: 1,
            };
        }
    }

    let scrollParallax = 0;
    window.addEventListener('scroll', () => {
        scrollParallax = window.scrollY * 0.02;
    }, { passive: true });

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach((s) => {
            const alpha = prefersReducedMotion
                ? s.baseAlpha
                : s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.25;
            ctx.beginPath();
            const y = s.y - scrollParallax * s.depth;
            const wrappedY = ((y % height) + height) % height;
            ctx.arc(s.x, wrappedY, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(230, 238, 255, ${Math.max(0, Math.min(1, alpha))})`;
            ctx.fill();
        });

        maybeSpawnShootingStar();
        if (shootingStar) {
            const s = shootingStar;
            ctx.save();
            ctx.strokeStyle = `rgba(150, 200, 255, ${s.life})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
            ctx.stroke();
            ctx.restore();
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.02;
            if (s.life <= 0 || s.x > width || s.y > height) shootingStar = null;
        }

        t += 1;
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
}

/* ----------------------------------------------------------------
   CUSTOM CURSOR
---------------------------------------------------------------- */
function initCustomCursor() {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;
    let targetX = ringX, targetY = ringY;

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        dot.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
    });

    function animateRing() {
        ringX += (targetX - ringX) * 0.18;
        ringY += (targetY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .project-card, .skill-card, .filter').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    });
}

/* ----------------------------------------------------------------
   NAVIGATION
---------------------------------------------------------------- */
function initNavigation() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('navBurger');
    const mobileMenu = document.getElementById('navMobile');
    const navLinks = document.querySelectorAll('[data-nav]');
    const sections = document.querySelectorAll('main > section[id]');

    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('is-scrolled', window.scrollY > 24);
        }, { passive: true });
    }

    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', String(isOpen));
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (mobileMenu && burger) {
                mobileMenu.classList.remove('is-open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.nav__link').forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => observer.observe(section));
}

/* ----------------------------------------------------------------
   SCROLL REVEAL
---------------------------------------------------------------- */
function initScrollReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    items.forEach(item => observer.observe(item));
}

/* ----------------------------------------------------------------
   PROJECTS FILTERS & MODALS
---------------------------------------------------------------- */
function initProjects() {
    const filters = document.querySelectorAll('.filter');
    const cards = document.querySelectorAll('.project-card');

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.getAttribute('data-filter');

            cards.forEach(card => {
                if (cat === 'all' || card.getAttribute('data-category') === cat) {
                    card.classList.remove('is-hidden');
                } else {
                    card.classList.add('is-hidden');
                }
            });
        });
    });

    // Gestion de la fenêtre modale
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.getElementById('modalClose');
    const backdrop = document.getElementById('modalBackdrop');

    const projectDetails = {
        'p1': {
            title: "Châssis Monocoque Optimisé",
            meta: "CATÉGORIE: CAO & FEA // DATE: 2026",
            description: "Étude complète menée dans le cadre de la conception d'une structure légère à haute rigidité.",
            details: [
                "Analyse par éléments finis (FEA) sous ANSYS avec maillage quadratique affiné aux zones critiques.",
                "Optimisation topologique : réduction de la masse globale de 15% sans altération de la rigidité en torsion.",
                "Validation du choix des matériaux composites renforcés par des fibres de carbone."
            ]
        },
        'p2': {
            title: "Bras Robotique Articulé 5-Axes",
            meta: "CATÉGORIE: ROBOTIQUE // DATE: 2025",
            description: "Conception mécatronique de A à Z avec contrôle vectoriel de positionnement.",
            details: [
                "Modélisation complète des pièces sous SolidWorks et ajustement des tolérances d'impression 3D.",
                "Programmation en C++ sur carte microcontrôleur avec asservissement PID des moteurs.",
                "Algorithme de cinématique inverse permettant de suivre des trajectoires dans l'espace 3D."
            ]
        },
        'p3': {
            title: "Simulateur d'Orbite & Trajectoire",
            meta: "CATÉGORIE: SIMULATION CODE // DATE: 2025",
            description: "Moteur de calcul de mécanique céleste pour l'étude de trajectoires d'engins spatiaux.",
            details: [
                "Résolution numérique d'équations différentielles ordinaires par méthode de Runge-Kutta (RK4).",
                "Simulation d'assistance gravitationnelle ('effet fronde') au voisinage de corps célestes.",
                "Visualisation graphique interactive 2D/3D générée via Matplotlib et SciPy."
            ]
        }
    };

    document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const pId = btn.getAttribute('data-modal');
            const data = projectDetails[pId];

            if (data && modal && modalContent) {
                modalContent.innerHTML = `
                    <h3>${data.title}</h3>
                    <div class="modal__meta">${data.meta}</div>
                    <p>${data.description}</p>
                    <h4>MÉTHODOLOGIE & RÉSULTATS</h4>
                    <ul>
                        ${data.details.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <div class="modal__links">
                        <a href="#" class="btn btn--primary">TELECHARGER_DOSSIER.PDF</a>
                    </div>
                `;
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
            }
        });
    });

    const closeModal = () => {
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Fermeture avec la touche Échap
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

/* ----------------------------------------------------------------
   ANIMATED COUNTERS
---------------------------------------------------------------- */
function initCounters() {
    const stats = document.querySelectorAll('.stat__number');
    let triggered = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !triggered) {
                triggered = true;
                stats.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    let count = 0;
                    const step = Math.max(1, Math.ceil(target / 40));

                    const update = () => {
                        count += step;
                        if (count < target) {
                            counter.textContent = count;
                            setTimeout(update, 30);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    update();
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats');
    if (statsSection) observer.observe(statsSection);
}

/* ----------------------------------------------------------------
   CONTACT FORM
---------------------------------------------------------------- */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactStatus');

    if (form && status) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            status.textContent = "TRANSMISSION_EN_COURS...";

            setTimeout(() => {
                status.textContent = "✔ MESSAGE_TRANSMIS_AVEC_SUCCES";
                form.reset();
            }, 1000);
        });
    }
}

/* ----------------------------------------------------------------
   MODEL VIEWER READY
---------------------------------------------------------------- */
function initModelViewer() {
    console.log("3D Viewport initialized & ready for WebGL context.");
}