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
    
    // Immediately enable scrolling on body
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    
    // Hide loading screen immediately
    loadingScreen.style.opacity = '0';
    loadingScreen.style.visibility = 'hidden';
    
    // Remove from DOM quickly
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        console.log('✅ Loading screen removed');
        
        // Enable body scrolling
        document.body.style.overflow = 'visible';
        document.documentElement.style.overflow = 'visible';
        
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
    if (!contactForm) {
        console.log('⚠️ No contact form found');
        return;
    }
    
    console.log('📝 Initializing contact form');
    
    // Create message container if it doesn't exist
    let formMessage = document.getElementById('formMessage');
    if (!formMessage) {
        formMessage = document.createElement('div');
        formMessage.id = 'formMessage';
        formMessage.style.cssText = 'display: none; margin-bottom: 1rem; padding: 1rem; border-radius: 8px;';
        contactForm.prepend(formMessage);
    }
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset message
        formMessage.style.display = 'none';
        formMessage.textContent = '';
        formMessage.className = '';
        
        // Get form values
        const formData = {
            name: contactForm.querySelector('[name="name"]')?.value.trim() || '',
            email: contactForm.querySelector('[name="email"]')?.value.trim() || '',
            company: contactForm.querySelector('[name="company"]')?.value.trim() || '',
            service: contactForm.querySelector('[name="service"]')?.value || '',
            message: contactForm.querySelector('[name="message"]')?.value.trim() || '',
            subject: 'New Contact Form Submission - MechNerve'
        };
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.service || !formData.message) {
            showFormMessage('Please fill in all required fields (*)', 'error');
            return;
        }
        
        if (!validateEmail(formData.email)) {
            showFormMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send to Flask backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showFormMessage(data.message, 'success');
                contactForm.reset();
            } else {
                showFormMessage(data.message || 'Failed to send message. Please try again.', 'error');
            }
            
        } catch (error) {
    console.error('Form submission error:', error);
    showFormMessage(
        '❌ Server error. Please try again after some time.',
        'error'
    );
} finally {

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.style.display = 'block';
        
        if (type === 'success') {
            formMessage.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            formMessage.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            formMessage.style.color = '#10b981';
        } else if (type === 'error') {
            formMessage.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            formMessage.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            formMessage.style.color = '#ef4444';
        } else {
            formMessage.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
            formMessage.style.border = '1px solid rgba(56, 189, 248, 0.3)';
            formMessage.style.color = '#38bdf8';
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            formMessage.style.opacity = '0';
            formMessage.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                formMessage.style.display = 'none';
                formMessage.style.opacity = '1';
            }, 500);
        }, 5000);
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Add loading spinner CSS
    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(spinnerStyle);
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

// ========== CAREER FORM FUNCTIONS ==========
// These functions should be in your about.html file
function openCareerForm() {
    const modal = document.getElementById('careerModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeCareerForm() {
    const modal = document.getElementById('careerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ========== ERROR HANDLING ==========
// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.message);
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});
// ================= CAREER FORM SUBMISSION =================
const careerForm = document.getElementById("careerForm");

if (careerForm) {
    careerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Inputs
        const name = document.getElementById("careerName");
        const email = document.getElementById("careerEmail");
        const phone = document.getElementById("careerPhone");
        const role = document.getElementById("careerRole");
        const message = document.getElementById("careerMessage");
        const resume = document.getElementById("careerResume");
        const consent = document.getElementById("careerConsent");

        // Submit button
        const submitBtn = careerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        // 1️⃣ Basic validation
        if (!consent.checked) {
            alert("Please accept the consent to proceed.");
            return;
        }

        if (!resume.files.length) {
            alert("Please upload your resume.");
            return;
        }

        // 5MB limit
        if (resume.files[0].size > 5 * 1024 * 1024) {
            alert("Resume must be less than 5MB.");
            return;
        }

        // 2️⃣ Disable button (UX)
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        // 3️⃣ Prepare form data
        const formData = new FormData();
        formData.append("name", name.value.trim());
        formData.append("email", email.value.trim());
        formData.append("phone", phone.value.trim());
        formData.append("role", role.value);
        formData.append("message", message.value.trim());
        formData.append("resume", resume.files[0]);

        try {
            // 4️⃣ Send request
            const response = await fetch("/api/career", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            alert(data.message);

            if (data.success) {
                careerForm.reset();
                closeCareerForm();
            }

        } catch (error) {
            alert("❌ Network error. Please try again.");
        }

        // 6️⃣ Restore button
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    });
}
// ================= COLLABORATION FORM SUBMISSION =================
const collabForm = document.getElementById("collabForm");

if (collabForm) {
    collabForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("collabName");
        const email = document.getElementById("collabEmail");
        const phone = document.getElementById("collabPhone");

        const submitBtn = collabForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        const formData = new FormData();
        formData.append("name", name.value.trim());
        formData.append("email", email.value.trim());
        formData.append("phone", phone.value.trim());
        formData.append("message", "Collaboration Request");

        try {
            const response = await fetch("/api/collaboration", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            alert(data.message);

            if (data.success) {
                collabForm.reset();
                closeCollaborationForm();
            }

        } catch (error) {
            alert("❌ Network error. Please try again.");
        }

        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    });
}
