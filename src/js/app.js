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
        router.register('splash', './src/pages/splash.html', () => this.onSplashPage());
        router.register('login', './src/pages/login.html', () => this.onLoginPage());
        router.register('home', './src/pages/home.html', () => this.onHomePage());
        router.register('photo-analysis', './src/pages/photo-analysis.html', () => this.onPhotoAnalysisPage());
        router.register('fertilizer-planner', './src/pages/fertilizer-planner.html', () => this.onFertilizerPlannerPage());
        router.register('loyalty', './src/pages/loyalty.html', () => this.onLoyaltyPage());
        router.register('settings', './src/pages/settings.html', () => this.onSettingsPage());

        // Setup navigation
        router.setupNavigation();

        // Preload all pages in background for instant navigation
        router.preloadAll();
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
     * Splash page loaded callback
     */
    onSplashPage() {
        console.log('Splash page loaded');
        // Auto-navigate to login after 2 seconds
        setTimeout(() => {
            router.navigate('login');
        }, 2000);
    }

    /**
     * Login page loaded callback
     */
    onLoginPage() {
        console.log('Login page loaded');

        // Handle all login buttons
        const loginButtons = document.querySelectorAll('.login-btn');
        loginButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const provider = button.dataset.provider;
                console.log(`Login with ${provider}`);

                try {
                    // All providers use the same mock login for now
                    await auth.loginWithGoogle();
                    auth.initializeWelcomeBonus();
                    await router.navigate('home');
                } catch (error) {
                    console.error('Login error:', error);
                }
            });
        });

        // Handle register link
        const registerLink = document.getElementById('register-link');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Register clicked - would navigate to registration');
                // For now, just login (mock)
                auth.loginWithGoogle().then(() => {
                    auth.initializeWelcomeBonus();
                    router.navigate('home');
                });
            });
        }
    }

    /**
     * Home page loaded callback
     */
    onHomePage() {
        console.log('Home page loaded');

        // Update points display
        const totalPoints = getTotalPoints();
        const pointsElement = document.getElementById('total-points');
        if (pointsElement) {
            pointsElement.textContent = totalPoints;
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
     * Settings page loaded callback
     */
    onSettingsPage() {
        console.log('Settings page loaded');

        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                auth.logout();
                router.navigate('login');
            });
        }
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

        // Handle visibility change (for PWA lifecycle and export points)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('App became visible');
                this.checkExportPoints();
            }
        });

        // Also check on page load
        this.checkExportPoints();
    }

    /**
     * Check and award points after calendar export
     */
    checkExportPoints() {
        const exportPending = localStorage.getItem('gazonExportPending');
        const exportSeason = localStorage.getItem('gazonExportSeason');

        if (exportPending === 'true' && exportSeason) {
            // Clear the pending flag immediately
            localStorage.removeItem('gazonExportPending');

            // Check if this season already received points
            const puntenData = JSON.parse(localStorage.getItem('gazonPuntenToekenningen') || '{}');

            if (puntenData[exportSeason]?.toegekend) {
                // Already received points for this season
                this.showAlreadyReceivedToast();
            } else {
                // Award points for this season
                this.awardSeasonPoints(exportSeason);
            }
        }
    }

    /**
     * Award points for a season (one-time)
     */
    awardSeasonPoints(season) {
        const pointsToAdd = 50;

        // Update total points
        let currentPoints = parseInt(localStorage.getItem('gazonPunten') || '0');
        currentPoints += pointsToAdd;
        localStorage.setItem('gazonPunten', currentPoints.toString());

        // Mark season as awarded
        const puntenData = JSON.parse(localStorage.getItem('gazonPuntenToekenningen') || '{}');
        puntenData[season] = {
            toegekend: true,
            datum: new Date().toISOString().split('T')[0],
            punten: pointsToAdd
        };
        localStorage.setItem('gazonPuntenToekenningen', JSON.stringify(puntenData));

        // Show celebration overlay
        this.showPointsCelebration(pointsToAdd);

        // Update points display if on home page
        this.updatePointsDisplay();
    }

    /**
     * Show points celebration overlay
     */
    showPointsCelebration(points) {
        const overlay = document.createElement('div');
        overlay.id = 'points-celebration';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 5rem; margin-bottom: 1rem; color: #89b865; animation: bounceIn 0.6s ease-out;">
                    +${points}
                </div>
                <div style="font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">
                    GazonPunten verdiend!
                </div>
                <div style="font-size: 1rem; color: rgba(255,255,255,0.7); margin-bottom: 2rem;">
                    Je schema is geexporteerd
                </div>
                <div style="width: 120px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden; margin: 0 auto;">
                    <div style="width: 100%; height: 100%; background: #89b865; animation: shrinkBar 3s linear forwards;"></div>
                </div>
            </div>
            <style>
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes shrinkBar { from { width: 100%; } to { width: 0%; } }
            </style>
        `;

        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);

        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 3000);
    }

    /**
     * Show toast for already received points
     */
    showAlreadyReceivedToast() {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(91,127,196,0.95);
            backdrop-filter: blur(10px);
            padding: 1.5rem 2rem;
            border-radius: 1rem;
            text-align: center;
            z-index: 2000;
            color: white;
            font-weight: 600;
        `;
        toast.textContent = 'Je hebt dit seizoen al punten ontvangen';

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    /**
     * Update points display on current page
     */
    updatePointsDisplay() {
        const points = parseInt(localStorage.getItem('gazonPunten') || '0');

        // Update home page points
        const homePoints = document.getElementById('total-points');
        if (homePoints) homePoints.textContent = points;

        // Update loyalty page points
        const loyaltyPoints = document.getElementById('loyalty-points');
        if (loyaltyPoints) loyaltyPoints.textContent = points;
    }

    /**
     * Register service worker for PWA functionality
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./service-worker.js');
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
