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

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const formMessage = document.createElement('div');
    formMessage.id = 'formMessage';
    formMessage.style.display = 'none';
    formMessage.style.marginBottom = '1rem';
    formMessage.style.padding = '1rem';
    formMessage.style.borderRadius = '8px';
    contactForm.appendChild(formMessage);
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset previous messages
        formMessage.style.display = 'none';
        formMessage.textContent = '';
        
        // Get form data
        const formData = {
            name: document.getElementById('name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            subject: document.getElementById('subject')?.value.trim() || '',
            service: document.getElementById('service')?.value || '',
            message: document.getElementById('message')?.value.trim() || ''
        };
        
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success message
                showFormMessage(data.message,'Message sent successfully! We\'ll get back to you within 24 hours.',  'success');
                
                // Reset form if email was sent
                if (data.email_sent) {
                    setTimeout(() => {
                        contactForm.reset();
                    }, 1000);
                }
                
                // Optional: Send to analytics
                console.log('Form submitted successfully:', formData);
                
            } else {
                // Show error message
                showFormMessage(data.message,'Failed to send message. Please email us directly at mechnervesolutions@gmail.com', 'error');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showFormMessage('Network error. Please email us directly at mechnervesolutions@gmail.com', 'error');
        } finally {
            // Reset button state
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
        } else {
            formMessage.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            formMessage.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            formMessage.style.color = '#ef4444';
        }
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide success messages after 10 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessage.style.opacity = '0';
                formMessage.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    formMessage.style.display = 'none';
                    formMessage.style.opacity = '1';
                }, 500);
            }, 10000);
        }
    }
    
    // Add input validation feedback
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = 'rgba(56, 189, 248, 0.3)';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary)';
            this.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.1)';
        });
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
<script>
// Career Form Functions
function openCareerForm() {
    document.getElementById('careerModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeCareerForm() {
    document.getElementById('careerModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    document.getElementById('careerForm').reset();
    hideSuccessMessage();
}

// Close modal when clicking outside
document.getElementById('careerModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCareerForm();
    }
});

// Form submission handler
document.getElementById('careerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('careerName').value;
    const email = document.getElementById('careerEmail').value;
    const phone = document.getElementById('careerPhone').value;
    const role = document.getElementById('careerRole').value;
    const message = document.getElementById('careerMessage').value;
    
    // Get file info
    const resumeInput = document.getElementById('careerResume');
    const resumeFile = resumeInput.files[0];
    const fileName = resumeFile ? resumeFile.name : 'No file selected';
    
    // Create email content
    const subject = `Career Application: ${name} for ${role}`;
    let body = `NEW CAREER APPLICATION\n\n`;
    body += `Applicant: ${name}\n`;
    body += `Email: ${email}\n`;
    body += `Phone: ${phone}\n`;
    body += `Position: ${role}\n\n`;
    body += `Cover Letter:\n${message}\n\n`;
    body += `Resume: ${fileName}\n`;
    body += `Submitted: ${new Date().toLocaleString()}`;
    
    // Create mailto link
    const mailtoLink = `mailto:mechnervesolutions@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Show file attachment reminder
    if (resumeFile) {
        alert(`Please note:\n\n1. An email draft will open in your email client\n2. Please MANUALLY attach your resume file: "${fileName}"\n3. Review the email and click "Send"`);
    } else {
        alert('Important: Please attach your resume file in the email draft before sending.');
    }
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    showSuccessMessage();
    
    // Close form after delay
    setTimeout(() => {
        closeCareerForm();
    }, 4000);
});

// Success message
function showSuccessMessage() {
    const form = document.getElementById('careerForm');
    form.style.display = 'none';
    
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `
        <div style="text-align: center; padding: 3rem 2rem;">
            <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; border: 2px solid var(--accent);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="color: var(--accent);">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            <h3 style="color: var(--accent); margin-bottom: 1rem;">Application Submitted!</h3>
            <p style="color: var(--text-gray); margin-bottom: 1.5rem;">
                Your application has been prepared. Please check your email client to send.
            </p>
            <p style="color: var(--text-gray); font-size: 0.9rem;">
                Returning to form in 3 seconds...
            </p>
        </div>
    `;
    
    document.querySelector('.career-modal-body').appendChild(successDiv);
}

function hideSuccessMessage() {
    const form = document.getElementById('careerForm');
    form.style.display = 'block';
    
    const successDiv = document.querySelector('.career-modal-body > div:last-child');
    if (successDiv && !successDiv.classList.contains('career-form')) {
        successDiv.remove();
    }
}

// File upload styling
document.getElementById('careerResume').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const uploadDiv = this.parentElement;
    const textDiv = uploadDiv.querySelector('.career-file-text');
    
    if (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (file.size > maxSize) {
            alert('File size exceeds 5MB limit. Please choose a smaller file.');
            this.value = '';
            textDiv.textContent = 'Upload your Resume/CV';
            return;
        }
        
        // Update text to show filename
        textDiv.innerHTML = `<strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        uploadDiv.style.borderColor = 'var(--accent)';
        uploadDiv.style.background = 'rgba(16, 185, 129, 0.05)';
    }
});

// Press ESC to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('careerModal').style.display === 'flex') {
        closeCareerForm();
    }
});
</script>
