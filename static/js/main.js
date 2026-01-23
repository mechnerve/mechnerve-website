// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations and functionality
    initLoadingScreen();
    initScrollAnimations();
    initMobileMenu();
    initContactForm();
    initFadeInAnimations();
    initScrollProgress();
});

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (!loadingScreen) return;
    
    // Hide loading screen after page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
            
            // Start animations after loading
            setTimeout(() => {
                document.querySelectorAll('.fade-in').forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, index * 100);
                });
            }, 300);
        }, 800);
    });
}

// Scroll Animations
function initScrollAnimations() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        // Header scroll effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Parallax effect for hero background
        const heroBg = document.querySelector('.hero-bg-logo');
        if (heroBg) {
            const scrolledY = window.scrollY;
            heroBg.style.transform = `translate(-50%, calc(-50% + ${scrolledY * 0.05}px)) rotate(${scrolledY * 0.1}deg)`;
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (!mobileMenuBtn || !nav) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        mobileMenuBtn.setAttribute('aria-expanded', nav.classList.contains('active'));
    });
    
    // Close menu on link click
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

// Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call (replace with actual fetch to your Flask endpoint)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            showNotification('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
            contactForm.reset();
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Failed to send message. Please email us directly at mechnervesolutions@gmail.com', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Fade-in Animations
function initFadeInAnimations() {
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
        rootMargin: '0px 0px -100px 0px'
    });
    
    fadeElements.forEach(el => observer.observe(el));
}

// Scroll Progress Bar
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Notification System
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Hover effects enhancement
document.querySelectorAll('.hover-lift').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-5px)';
        element.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = '';
    });
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
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

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: #10b981;
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        font-weight: 500;
    }
    
    .notification.error {
        background: #ef4444;
    }
    
    @media (max-width: 768px) {
        .notification {
            left: 20px;
            right: 20px;
            max-width: none;
        }
    }
`;
document.head.appendChild(notificationStyles);
// Team member hover effects enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Team member cards animation
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', () => {
            const image = member.querySelector('.member-image img');
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        });
        
        member.addEventListener('mouseleave', () => {
            const image = member.querySelector('.member-image img');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
    });
    
    // Animate team stats on scroll
    const statNumbers = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const finalValue = element.textContent;
                const duration = 2000; // 2 seconds
                const steps = 60;
                const increment = parseInt(finalValue) / steps;
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= parseInt(finalValue)) {
                        element.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(current) + '+';
                    }
                }, duration / steps);
                
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
});
