// ============================================
// MOBILE MENU TOGGLE
// ============================================
// ============================================
// PAGE LOADER
// ============================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => {
                loader.remove();
            }, 600);
        }
    }, 1500); // Shows loader for at least 1.5 seconds
});
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
const revealElements = document.querySelectorAll(
    '.section-header, .about-content, .services-grid, .experience-grid, .education-grid, .skills-content, .projects-grid, .contact-content, .stat-card, .service-card, .experience-card, .education-card, .project-card, .contact-card'
);

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// STAGGER CHILDREN ON SCROLL
// ============================================
const staggerContainers = document.querySelectorAll('.projects-grid, .services-grid, .experience-grid, .education-grid, .about-stats-grid');

staggerContainers.forEach(container => {
    const children = container.children;
    Array.from(children).forEach((child, index) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
        child.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    });

    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                Array.from(children).forEach(child => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    staggerObserver.observe(container);
});

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});
// ============================================
// COUNTER ANIMATION
// ============================================
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const numbers = entry.target.querySelectorAll('.stat-number');
            numbers.forEach(num => {
                const target = parseInt(num.textContent);
                if (isNaN(target)) return;
                let count = 0;
                const duration = 1500;
                const increment = target / (duration / 16);
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        num.textContent = target + '+';
                        clearInterval(timer);
                    } else {
                        num.textContent = Math.floor(count) + '+';
                    }
                }, 16);
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);
// ============================================
// 3D TILT ON PROJECT IMAGES
// ============================================
document.querySelectorAll('.project-image').forEach(image => {
    image.addEventListener('mousemove', (e) => {
        const rect = image.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        image.querySelector('img').style.transform = `scale(1.05) perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });
    
    image.addEventListener('mouseleave', () => {
        image.querySelector('img').style.transform = '';
    });
});
// ============================================
// TYPEWRITER EFFECT
// ============================================
const roles = ['FRONTEND ENGINEER', 'UI DEVELOPER', 'MOTION DESIGNER', 'CREATIVE DEVELOPER'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const roleElement = document.getElementById('heroRole');

if (roleElement) {
    function typeWriter() {
        const currentRole = roles[roleIndex];
        if (isDeleting) {
            roleElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            roleElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentRole.length) {
            setTimeout(() => { isDeleting = true; }, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
        
        setTimeout(typeWriter, isDeleting ? 50 : 100);
    }
    typeWriter();
}
// ============================================
// CUSTOM CURSOR
// ============================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dot follows instantly
        cursorDot.style.left = mouseX - 3 + 'px';
        cursorDot.style.top = mouseY - 3 + 'px';
    });

    // Ring follows with delay (smooth)
    function animateRing() {
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        cursorRing.style.left = ringX - 16 + 'px';
        cursorRing.style.top = ringY - 16 + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .project-card, .service-card, .experience-card, .education-card, .stat-card, .contact-card, input, textarea, .tech-tag');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorRing.classList.add('hover');
            cursorDot.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursorRing.classList.remove('hover');
            cursorDot.classList.remove('hover');
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
    });
}
// ============================================
// DARK/LIGHT MODE TOGGLE
// ============================================
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

// Check saved preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});
// ============================================
// SUBTLE HOVER SOUND
// ============================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playHoverSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.08);
}

// Attach to interactive elements
document.querySelectorAll('a, button, .btn, .project-card, .service-card, .experience-card, .education-card, .stat-card, .contact-card, .tech-tag').forEach(el => {
    el.addEventListener('mouseenter', () => {
        playHoverSound();
    });
});
// ============================================
// LIVE TIME
// ============================================
function updateTime() {
    const timeEl = document.getElementById('footerTime');
    if (!timeEl) return;
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Lagos'
    });
    
    timeEl.textContent = `Lagos, Nigeria • ${time} WAT`;
}
updateTime();
setInterval(updateTime, 1000);
// ============================================
// 3D BUILD-IN ON SCROLL
// ============================================
const buildSections = document.querySelectorAll('.build-in');

const buildObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            buildObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

buildSections.forEach(section => buildObserver.observe(section));
// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        formStatus.textContent = 'Sending...';
        formStatus.style.color = 'var(--text-muted)';
        
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
            formStatus.style.color = '#10b981';
            contactForm.reset();
        } else {
            formStatus.textContent = 'Something went wrong. Please try again.';
            formStatus.style.color = '#ef4444';
        }
    });
}