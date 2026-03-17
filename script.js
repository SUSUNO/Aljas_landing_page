// ============================================
//  MSU-MCEST Landing Page — Enhanced Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ─── NAVBAR SCROLL STATE ─────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // ─── MOBILE NAV TOGGLE ────────────────────
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    navToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const open = navLinks.classList.contains('open');
        navToggle.setAttribute('aria-expanded', open);
        // Animate hamburger to X
        const spans = navToggle.querySelectorAll('span');
        if (open) {
            spans[0].style.transform = 'translateY(7px) rotate(45deg)';
            spans[1].style.opacity   = '0';
            spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
            spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        }
    });

    // Close mobile nav on link click
    navLinks?.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            const spans = navToggle.querySelectorAll('span');
            spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        });
    });

    // ─── HERO PARTICLE CANVAS ────────────────
    initCanvas();

    // ─── INTERSECTION OBSERVER (REVEALS) ─────
    const revealEls = document.querySelectorAll('.reveal, .reveal-card');
    const countEls  = document.querySelectorAll('.count');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            // Stagger cards if siblings
            const delay = entry.target.classList.contains('reveal-card')
                ? getCardDelay(entry.target) * 80
                : 0;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    revealEls.forEach(el => revealObserver.observe(el));

    function getCardDelay(el) {
        const parent = el.parentElement;
        if (!parent) return 0;
        return Array.from(parent.children).indexOf(el);
    }

    // ─── ANIMATED COUNTERS ────────────────────
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target, parseInt(entry.target.dataset.target, 10) || 0, 1600);
            countObserver.unobserve(entry.target);
        });
    }, { threshold: 0.5 });

    countEls.forEach(el => countObserver.observe(el));

    function animateCount(el, end, duration) {
        const start     = performance.now();
        const easeOut   = t => 1 - Math.pow(1 - t, 3);

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const current  = Math.floor(easeOut(progress) * end);
            el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = end.toLocaleString();
        }

        requestAnimationFrame(step);
    }

    // ─── SMOOTH SCROLL ────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ─── BUTTON RIPPLE ────────────────────────
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top  - size / 2;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.25);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-anim 0.6s ease-out forwards;
                pointer-events: none;
            `;
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 620);
        });
    });

    // Inject ripple keyframes
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple-anim {
            to { transform: scale(4); opacity: 0; }
        }
    `;
    document.head.appendChild(rippleStyle);

});

// ─── HERO CANVAS PARTICLES ─────────────────────
function initCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener('resize', () => {
        resize();
        initParticles();
    }, { passive: true });

    function initParticles() {
        const count = Math.floor((W * H) / 14000);
        particles = Array.from({ length: count }, () => createParticle());
    }

    function createParticle(x, y) {
        return {
            x: x ?? Math.random() * W,
            y: y ?? Math.random() * H,
            r: Math.random() * 1.2 + 0.3,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            alpha: Math.random() * 0.5 + 0.1,
        };
    }

    initParticles();

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Draw particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -4) p.x = W + 4;
            if (p.x > W + 4) p.x = -4;
            if (p.y < -4) p.y = H + 4;
            if (p.y > H + 4) p.y = -4;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
            ctx.fill();
        });

        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 120;

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animId = requestAnimationFrame(draw);
    }

    draw();

    // Pause when out of view (perf)
    const heroSection = canvas.parentElement;
    const observer = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) {
            cancelAnimationFrame(animId);
        } else {
            draw();
        }
    });
    observer.observe(heroSection);
}
