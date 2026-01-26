// Main JavaScript for MechNerve Solutions
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Loaded - Initializing...');
    
    // Initialize all functionality
    initLoadingScreen();
    initMobileMenu();
    initScrollAnimations();
    initFadeInAnimations();
    initScrollProgress();
    initContactForm();
    initSmoothScrolling();
    initHoverEffects();
    initCareerForm();
    initCollaborationForm();
});

// ========== LOADING SCREEN ==========
function initLoadingScreen() {
    console.log('🔄 Initializing loading screen...');
    const loadingScreen = document.querySelector('.loading-screen');
    
    if (!loadingScreen) {
        console.log('⚠️ No loading screen found');
        initFadeInAnimations();
        return;
    }
    
   
    // Hide loading screen immediately
    loadingScreen.style.opacity = '0';
    loadingScreen.style.visibility = 'hidden';
    
    // Remove from DOM quickly
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        console.log('✅ Loading screen removed');
        
      
        // Trigger fade-in animations
        triggerFadeInAnimations();
    }, 300);
    
    // Fallback: hide after 1 second max
    setTimeout(() => {
        if (loadingScreen.style.display !== 'none') {
            loadingScreen.style.display = 'none';
            document.body.style.overflow = 'visible';
        }
    }, 1000);
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (!mobileMenuBtn || !nav) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        const isActive = nav.classList.contains('active');
        this.innerHTML = isActive ? '✕' : '☰';
        this.setAttribute('aria-expanded', isActive);
    });
    
    // Close menu when clicking links
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            mobileMenuBtn.innerHTML = '☰';
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            mobileMenuBtn.innerHTML = '☰';
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    const header = document.querySelector('header');
    
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        // Header scroll effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ========== FADE-IN ANIMATIONS ==========
function initFadeInAnimations() {
    // Just initialize observer, animations will trigger after loading screen hides
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(el => observer.observe(el));
}

function triggerFadeInAnimations() {
    console.log('🎭 Triggering fade-in animations');
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 50); // Staggered animation
    });
}

// ========== SCROLL PROGRESS ==========
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ========== CONTACT FORM ==========
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    let formMessage = document.getElementById('formMessage');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    company: document.getElementById('company').value.trim(),
    service: document.getElementById('service').value,
    message: document.getElementById('message').value.trim(),
    subject: 'Contact Form'
};
        if (!data.name || !data.email || !data.service || !data.message) {
            showMessage('All required fields must be filled', 'error');
            return;
        }

        const btn = contactForm.querySelector('button');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Sending...';

        try {
           const res = await fetch(window.location.origin + '/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
if (!res.ok) {
    throw new Error('Server error');
}
const result = await res.json();
showMessage(result.message, result.success ? 'success' : 'error');

            if (result.success) contactForm.reset();

        } catch {
            showMessage('Server error. Try again later.', 'error');
        }

        btn.disabled = false;
        btn.innerHTML = 'Send Message →';
    });

    function showMessage(msg, type) {
        formMessage.style.display = 'block';
        formMessage.textContent = msg;
        formMessage.style.color = type === 'success' ? '#10b981' : '#ef4444';
    }

    // ✅ spinner CSS injected once
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
            .loading-spinner {
                width:16px;height:16px;
                border:2px solid rgba(255,255,255,.3);
                border-top-color:#fff;
                border-radius:50%;
                animation:spin 1s linear infinite;
                display:inline-block;
                margin-right:8px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }
}
// ========== SMOOTH SCROLLING ==========
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========== HOVER EFFECTS ==========
function initHoverEffects() {
    document.querySelectorAll('.hover-lift').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

function initCollaborationForm() {
    const collabForm = document.getElementById('collabForm');
    if (!collabForm) return;

    collabForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fd = new FormData(collabForm);
        const btn = collabForm.querySelector('button[type="submit"]');
        const messageInput = collabForm.querySelector('[name="message"]');
if (!messageInput || !messageInput.value.trim()) {
    alert('Please enter a message');
    btn.disabled = false;
    btn.innerText = 'Submit';
    return;
}
        btn.disabled = true;
        btn.innerText = 'Submitting...';

        try {
            const res = await fetch(window.location.origin + '/api/collaboration', {
    method: 'POST',
    body: fd
});
            const data = await res.json();
            showToast(data.message, data.success ? 'success' : 'error');
            if (data.success) {
                collabForm.reset();
                closeCollaborationForm();
            }
        } catch {
            alert('Network error');
        }

        btn.disabled = false;
        btn.innerText = 'Submit';
    });
}

function initCareerForm() {
    const careerForm = document.getElementById('careerForm');
    if (!careerForm) return;

    careerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fd = new FormData(careerForm);
        const btn = careerForm.querySelector('button[type="submit"]');
        const originalText = btn.innerText;

        btn.disabled = true;
        btn.innerText = 'Submitting...';

        try {
            const res = await fetch('/api/career', {
                method: 'POST',
                body: fd
            });

            const data = await res.json();
           showToast(data.message, data.success ? 'success' : 'error');
            if (data.success) {
                careerForm.reset();
                closeCareerForm();
            }

        } catch (err) {
            alert('❌ Network error. Please try again.');
        }

        btn.disabled = false;
        btn.innerText = originalText;
    });
}

// ========== MODALS ==========
function openCareerForm() {
    document.getElementById('careerModal').style.display = 'flex';
    document.body.classList.add('modal-open');
}

function closeCareerForm() {
    document.getElementById('careerModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}
function openCollaborationForm() {
    document.getElementById('collaborationModal').style.display = 'flex';
    document.body.classList.add('modal-open');
}

function closeCollaborationForm() {
    document.getElementById('collaborationModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}
function showToast(message, type = 'success') {
    let toast = document.createElement('div');
    toast.textContent = message;

    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.padding = '14px 20px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#fff';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '9999';
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
