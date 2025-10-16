// Main application
class SafetyEquipmentApp {
    constructor() {
        this.init();
    }

    init() {
        this.themeManager = new ThemeManager();
        this.navigation = new Navigation();
        this.scrollManager = new ScrollManager();
        this.animations = new Animations();
        this.servicesTabs = new ServicesTabs();
        
        // Связываем themeManager со scrollManager
        this.scrollManager.themeManager = this.themeManager;
        
        // Mark body as loaded for CSS transitions
        window.addEventListener('load', () => {
            document.body.classList.add('is-loaded');
            console.log('Safety Equipment Site initialized');
        });
    }
}

// Navigation component
class Navigation {
    constructor() {
        this.menuToggler = document.getElementById('navbar-toggler');
        this.navbarMenu = document.getElementById('navbar-menu');
        this.navbarLinks = document.querySelectorAll('.navbar__link');
        this.header = document.querySelector('.header');
        
        this.init();
    }

    init() {
        this.addEventListeners();
    }

    addEventListeners() {
        // Mobile menu toggle
        if (this.menuToggler) {
            this.menuToggler.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Navigation links
        this.navbarLinks.forEach(link => {
            if (link.getAttribute('data-section') === 'home') {
                link.addEventListener('click', (e) => this.handleHomeClick(e));
            } else {
                link.addEventListener('click', (e) => this.handleLinkClick(e));
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });

        // Close menu when clicking on menu items (for mobile)
        this.navbarMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('navbar__link')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.navbarMenu.classList.toggle('active');
        this.menuToggler.classList.toggle('active');
        
        if (this.navbarMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMenu() {
        this.navbarMenu.classList.remove('active');
        this.menuToggler.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleHomeClick(e) {
        e.preventDefault();
        
        if (window.location.hash === '' || window.location.hash === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            window.location.href = window.location.origin + window.location.pathname;
        }
        
        this.closeMenu();
    }

    handleLinkClick(e) {
        const link = e.target;
        
        // Update active link
        this.navbarLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
        
        this.closeMenu();
    }

    handleOutsideClick(e) {
        if (this.navbarMenu && this.menuToggler && 
            !this.navbarMenu.contains(e.target) && 
            !this.menuToggler.contains(e.target) && 
            this.navbarMenu.classList.contains('active')) {
            this.closeMenu();
        }
    }
}

// Scroll management
class ScrollManager {
    constructor() {
        this.header = document.querySelector('.header');
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('.navbar__link[href^="#"]');
        this.themeManager = null; // Будет установлено позже
        
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.addSmoothScroll();
        this.handleScroll(); // Initial call
    }

    handleScroll() {
        // Header scroll effect
        if (this.header) {
            const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (window.scrollY > 100) {
                if (isDarkTheme) {
                    this.header.style.background = 'rgba(26, 26, 26, 0.98)';
                    this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
                } else {
                    this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                    this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                }
            } else {
                if (isDarkTheme) {
                    this.header.style.background = 'rgba(26, 26, 26, 0.95)';
                    this.header.style.boxShadow = 'none';
                } else {
                    this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                    this.header.style.boxShadow = 'none';
                }
            }
        }

        // Section active state
        this.updateActiveSection();
    }

    updateActiveSection() {
        let current = '';
        const scrollPos = window.scrollY + 100;
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    addSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.offsetTop - 80;
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                        
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }
}

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeToggle = document.getElementById('theme-toggle');
        this.header = document.querySelector('.header');
        
        this.init();
    }

    init() {
        // Get saved theme or default to light
        const savedTheme = localStorage.getItem('theme-preference') || 'light';
        this.applyTheme(savedTheme);
        
        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTheme();
            });
        }
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => this.handleSystemThemeChange(e));
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.updateHeaderStyles(); // Обновляем стили хедера сразу
        
        localStorage.setItem('theme-preference', theme);
    }

    updateHeaderStyles() {
        if (this.header) {
            const isScrolled = window.scrollY > 100;
            
            if (this.currentTheme === 'dark') {
                if (isScrolled) {
                    this.header.style.background = 'rgba(26, 26, 26, 0.98)';
                    this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
                } else {
                    this.header.style.background = 'rgba(26, 26, 26, 0.95)';
                    this.header.style.boxShadow = 'none';
                }
                this.header.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
            } else {
                if (isScrolled) {
                    this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                    this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                    this.header.style.boxShadow = 'none';
                }
                this.header.style.borderBottomColor = 'rgba(0, 0, 0, 0.1)';
            }
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    handleSystemThemeChange(e) {
        // Only apply system theme if user hasn't made a choice
        if (!localStorage.getItem('theme-preference')) {
            this.applyTheme(e.matches ? 'dark' : 'light');
        }
    }
}

// Services Tabs Component
class ServicesTabs {
    constructor() {
        this.tabs = document.querySelectorAll('.services-tab');
        this.panes = document.querySelectorAll('.services-tab-pane');
        
        this.init();
    }
    
    init() {
        this.addEventListeners();
    }
    
    addEventListeners() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab);
            });
        });
    }
    
    switchTab(activeTab) {
        // Remove active class from all tabs and panes
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.panes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked tab
        activeTab.classList.add('active');
        
        // Show corresponding pane
        const tabId = activeTab.getAttribute('data-tab');
        const activePane = document.getElementById(tabId);
        if (activePane) {
            activePane.classList.add('active');
        }
        
        // Smooth scroll to services section if on mobile
        if (window.innerWidth < 768) {
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
                const offsetTop = servicesSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    }
}

// Animations
class Animations {
    constructor() {
        this.init();
    }

    init() {
        this.observeElements();
    }

    observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe service cards
        document.querySelectorAll('.service-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
        
        // Observe contact items
        document.querySelectorAll('.contact-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
        
        // Observe service items
        document.querySelectorAll('.service-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
    }
}

// Initialize the application
new SafetyEquipmentApp();