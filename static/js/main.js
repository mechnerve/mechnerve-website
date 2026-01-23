// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations
    initAnimations();
    initCustomCursor();
    initScrollAnimations();
    initParticles();
    initContactForm();
    initMobileMenu();
});

// Loading Screen
window.addEventListener('load', function() {
    setTimeout(() => {
        document.querySelector('.loading-screen').style.opacity = '0';
        document.querySelector('.loading-screen').style.visibility = 'hidden';
    }, 1000);
});

// Custom Cursor
function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        
        cursorOutline.animate({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`
        }, { duration: 300, fill: 'forwards' });
    });
    
    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .service-card, .contact-method');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.style.width = '16px';
            cursorDot.style.height = '16px';
            cursorOutline.style.width = '60px';
            cursorOutline.style.height = '60px';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorDot.style.width = '8px';
            cursorDot.style.height = '8px';
            cursorOutline.style.width = '40px';
            cursorOutline.style.height = '40px';
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    // Scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    // Header scroll effect
    const header = document.querySelector('header');
    
    // Intersection Observer for fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in, .service-card, .about-text, .about-visual, .contact-info, .contact-form');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    fadeElements.forEach(el => observer.observe(el));
    
    // Update progress bar and header on scroll
    window.addEventListener('scroll', () => {
        // Progress bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
        
        // Header scroll effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Parallax effect
        const scrolledY = window.scrollY;
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.style.transform = `translate(-50%, calc(-50% + ${scrolledY * 0.1}px))`;
        }
    });
}

// Particle Background
function initParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        // Random color
        const colors = ['#38bdf8', '#f472b6', '#10b981'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.opacity = Math.random() * 0.1 + 0.05;
        
        particlesContainer.appendChild(particle);
    }
}

// Contact Form
function initContactForm() {
    const contactForm = document.querySelector('.contact-form form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call (replace with actual fetch)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
            
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Notification System
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuBtn || !navLinks) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        mobileMenuBtn.innerHTML = navLinks.style.display === 'flex' ? '✕' : '☰';
    });
    
    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.style.display = 'none';
            mobileMenuBtn.innerHTML = '☰';
        });
    });
    
    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.style.display = '';
            mobileMenuBtn.innerHTML = '☰';
        } else {
            navLinks.style.display = 'none';
        }
    });
}

// Initialize all animations
function initAnimations() {
    // Add floating animation to elements
    document.querySelectorAll('.floating-element').forEach((el, index) => {
        el.style.animationDelay = `${index * 2}s`;
    });
    
    // Add hover effects to service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-20px) scale(1.02)';
            card.style.boxShadow = '0 30px 60px rgba(0,0,0,0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
        });
    });
    
    // Typewriter effect for hero title (optional)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && !heroTitle.dataset.animated) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.dataset.animated = 'true';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        // Start typing after 1 second
        setTimeout(typeWriter, 1000);
    }
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes particleFloat {
        to {
            transform: translateY(-100vh) rotate(360deg);
        }
    }
    
    .mobile-nav {
        display: none;
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        background: rgba(2, 6, 23, 0.98);
        backdrop-filter: blur(20px);
        padding: 2rem;
        z-index: 999;
    }
    
    @media (max-width: 768px) {
        .mobile-nav {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .mobile-nav.active {
            display: flex;
        }
    }
`;
document.head.appendChild(notificationStyles);
