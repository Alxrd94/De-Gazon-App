/**
 * Main Application Module
 * Initializes and coordinates all app functionality
 */

import router from './router.js';
import auth from './auth.js';
import photoAnalysis from './photoAnalysis.js';
import fertilizerPlanner from './fertilizerPlanner.js';
import loyaltyManager, { getTotalPoints } from './loyalty.js';

class App {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        console.log('Initializing de Gazon App...');

        // Register service worker
        this.registerServiceWorker();

        // Setup router
        this.setupRouter();

        // Check authentication
        await this.checkAuth();

        // Setup global event listeners
        this.setupGlobalListeners();

        this.initialized = true;
    }

    /**
     * Setup router with all routes
     */
    setupRouter() {
        // Register routes
        router.register('login', './src/pages/login.html', () => this.onLoginPage());
        router.register('home', './src/pages/home.html', () => this.onHomePage());
        router.register('photo-analysis', './src/pages/photo-analysis.html', () => this.onPhotoAnalysisPage());
        router.register('fertilizer-planner', './src/pages/fertilizer-planner.html', () => this.onFertilizerPlannerPage());
        router.register('loyalty', './src/pages/loyalty.html', () => this.onLoyaltyPage());

        // Setup navigation
        router.setupNavigation();
    }

    /**
     * Check authentication and navigate to appropriate page
     */
    async checkAuth() {
        if (auth.isAuthenticated()) {
            // User is logged in, go to home
            await router.navigate('home');
        } else {
            // User is not logged in, go to login
            await router.navigate('login');
        }
    }

    /**
     * Login page loaded callback
     */
    onLoginPage() {
        console.log('Login page loaded');

        const loginBtn = document.getElementById('google-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', async () => {
                try {
                    await auth.loginWithGoogle();
                    auth.initializeWelcomeBonus();
                    await router.navigate('home');
                } catch (error) {
                    console.error('Login error:', error);
                }
            });
        }
    }

    /**
     * Home page loaded callback
     */
    onHomePage() {
        console.log('Home page loaded');

        // Update user info
        const user = auth.getUser();
        if (user) {
            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = user.name || 'Gebruiker';
            }
        }

        // Update points display
        const totalPoints = getTotalPoints();
        const pointsElement = document.getElementById('total-points');
        if (pointsElement) {
            pointsElement.textContent = totalPoints;
        }

        // Setup logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                auth.logout();
                router.navigate('login');
            });
        }

        // Setup feature card navigation
        const photoCard = document.getElementById('photo-analysis-card');
        const plannerCard = document.getElementById('fertilizer-planner-card');
        const pointsBtn = document.getElementById('view-points-btn');

        if (photoCard) {
            photoCard.addEventListener('click', () => router.navigate('photo-analysis'));
        }

        if (plannerCard) {
            plannerCard.addEventListener('click', () => router.navigate('fertilizer-planner'));
        }

        if (pointsBtn) {
            pointsBtn.addEventListener('click', () => router.navigate('loyalty'));
        }
    }

    /**
     * Photo analysis page loaded callback
     */
    onPhotoAnalysisPage() {
        console.log('Photo analysis page loaded');
        photoAnalysis.init();
    }

    /**
     * Fertilizer planner page loaded callback
     */
    onFertilizerPlannerPage() {
        console.log('Fertilizer planner page loaded');
        fertilizerPlanner.init();
    }

    /**
     * Loyalty page loaded callback
     */
    onLoyaltyPage() {
        console.log('Loyalty page loaded');
        loyaltyManager.init();
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Handle custom navigation events
        window.addEventListener('navigate', (e) => {
            if (e.detail && e.detail.page) {
                router.navigate(e.detail.page);
            }
        });

        // Handle online/offline events
        window.addEventListener('online', () => {
            console.log('App is online');
            this.showConnectionStatus('Online', 'success');
        });

        window.addEventListener('offline', () => {
            console.log('App is offline');
            this.showConnectionStatus('Offline - Sommige functies zijn beperkt', 'warning');
        });

        // Handle app installation
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('App can be installed');
        });

        // Handle visibility change (for PWA lifecycle)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('App became visible');
            }
        });
    }

    /**
     * Register service worker for PWA functionality
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    console.log('Service Worker update found');
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Show connection status toast
     * @param {string} message - Status message
     * @param {string} type - Status type
     */
    showConnectionStatus(message, type) {
        const toast = document.createElement('div');
        toast.className = `connection-toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: calc(var(--spacing-md) + var(--safe-area-inset-top));
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'var(--color-success)' : 'var(--color-warning)'};
            color: white;
            padding: var(--spacing-sm) var(--spacing-lg);
            border-radius: var(--radius-lg);
            font-size: var(--font-size-sm);
            z-index: var(--z-index-tooltip);
            animation: slideDown 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Create app instance and initialize when DOM is ready
const app = new App();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for debugging
window.GazonApp = app;
