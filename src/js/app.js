/**
 * Main Application Module
 * Initializes and coordinates all app functionality
 */

import router from './router.js';
import auth from './auth.js';
import photoAnalysis from './photoAnalysis.js';
import fertilizerPlanner from './fertilizerPlanner.js';
import loyaltyManager, { getTotalPoints } from './loyalty.js';
import challenge from './challenge.js';

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
        router.register('challenge', './src/pages/challenge.html', () => this.onChallengePage());
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

        // Apply theme
        this.checkAndApplyTheme();

        // Load and display user profile
        this.loadHomeProfile();

        // Update points display
        const totalPoints = getTotalPoints();
        const pointsElement = document.getElementById('total-points');
        if (pointsElement) {
            pointsElement.textContent = totalPoints;
        }

        // Update progress bar based on points
        this.updateProgressBar(totalPoints);

        // Setup badge modal
        this.setupBadgeModal();

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
     * Load user profile data for home page
     */
    loadHomeProfile() {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const name = profile.name || 'Jan de Tuinier';
        const city = profile.city || 'Amsterdam';
        const country = profile.country || 'Nederland';

        const nameEl = document.getElementById('home-user-name');
        const locationEl = document.getElementById('home-user-location');

        if (nameEl) nameEl.textContent = name;
        if (locationEl) locationEl.textContent = city + ', ' + country;
    }

    /**
     * Update progress bar based on points
     */
    updateProgressBar(points) {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar) return;

        // Calculate progress to next rank (0-100 = Starter, 100-250 = Groene Duim, etc.)
        let progress = 0;
        if (points < 100) {
            progress = (points / 100) * 100;
        } else {
            progress = 100;
        }

        progressBar.style.width = `${progress}%`;
    }

    /**
     * Setup badge modal interactions
     */
    setupBadgeModal() {
        const badgeData = {
            analyse: {
                title: 'Eerste Analyse',
                desc: 'Voltooi je eerste foto analyse van je gazon.',
                earned: true,
                icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#89b865" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>'
            },
            trouw: {
                title: 'Trouwe Gebruiker',
                desc: '7 dagen achter elkaar ingelogd in de app.',
                earned: true,
                icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="#89b865" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
            },
            kalender: {
                title: 'Planner Pro',
                desc: 'Exporteer je eerste bemestingsschema naar je kalender.',
                earned: false,
                icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
            },
            punten100: {
                title: 'Punten Verzamelaar',
                desc: 'Bereik 100 GazonPunten.',
                earned: false,
                icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
            },
            challenge: {
                title: 'Challenge Deelnemer',
                desc: 'Deel je gazon foto in de maandelijkse Challenge.',
                earned: false,
                icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>'
            }
        };

        const modal = document.getElementById('badge-modal');
        const modalIcon = document.getElementById('badge-modal-icon');
        const modalTitle = document.getElementById('badge-modal-title');
        const modalDesc = document.getElementById('badge-modal-desc');
        const modalClose = document.getElementById('badge-modal-close');

        if (!modal) return;

        // Badge button clicks
        document.querySelectorAll('.badge-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const badgeKey = btn.dataset.badge;
                const badge = badgeData[badgeKey];
                if (badge) {
                    modalIcon.innerHTML = badge.icon;
                    modalTitle.textContent = badge.title;
                    modalDesc.textContent = badge.earned ? badge.desc : `Nog niet verdiend - ${badge.desc}`;
                    modal.style.display = 'flex';
                }
            });
        });

        // Close modal
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Photo analysis page loaded callback
     */
    onPhotoAnalysisPage() {
        console.log('Photo analysis page loaded');
        this.checkAndApplyTheme();
        photoAnalysis.init();
    }

    /**
     * Fertilizer planner page loaded callback
     */
    onFertilizerPlannerPage() {
        console.log('Fertilizer planner page loaded');
        this.checkAndApplyTheme();
        fertilizerPlanner.init();
    }

    /**
     * Challenge page loaded callback
     */
    onChallengePage() {
        console.log('Challenge page loaded');
        this.checkAndApplyTheme();
        challenge.init();
    }

    /**
     * Loyalty page loaded callback
     */
    onLoyaltyPage() {
        console.log('Loyalty page loaded');
        this.checkAndApplyTheme();
        loyaltyManager.init();
    }

    /**
     * Settings page loaded callback
     */
    onSettingsPage() {
        console.log('Settings page loaded');

        // Apply theme (don't override toggle state on this page)
        const isDarkMode = localStorage.getItem('darkMode') !== 'false';
        this.applyLightMode(!isDarkMode);

        // Load saved data
        this.loadSettingsData();

        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.clear();
                router.navigate('login');
            });
        }

        // Setup dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            const isDarkMode = localStorage.getItem('darkMode') !== 'false';
            if (isDarkMode) {
                darkModeToggle.classList.add('active');
            } else {
                darkModeToggle.classList.remove('active');
                this.applyLightMode(true);
            }

            darkModeToggle.addEventListener('click', () => {
                darkModeToggle.classList.toggle('active');
                const isDark = darkModeToggle.classList.contains('active');
                localStorage.setItem('darkMode', isDark.toString());
                this.applyLightMode(!isDark);
                this.showSettingsToast(isDark ? 'Donkere modus aan' : 'Lichte modus aan');
            });
        }

        // Setup push notifications toggle with permission
        const pushToggle = document.getElementById('push-toggle');
        if (pushToggle) {
            const pushEnabled = localStorage.getItem('pushEnabled') === 'true';
            if (pushEnabled) {
                pushToggle.classList.add('active');
            }

            pushToggle.addEventListener('click', async () => {
                const isCurrentlyActive = pushToggle.classList.contains('active');

                if (!isCurrentlyActive) {
                    // Trying to enable notifications
                    if ('Notification' in window) {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                            pushToggle.classList.add('active');
                            localStorage.setItem('pushEnabled', 'true');
                            this.showSettingsToast('Notificaties ingeschakeld');
                        } else {
                            this.showSettingsToast('Notificaties geweigerd door browser');
                        }
                    } else {
                        this.showSettingsToast('Notificaties niet ondersteund');
                    }
                } else {
                    // Disabling notifications
                    pushToggle.classList.remove('active');
                    localStorage.setItem('pushEnabled', 'false');
                    this.showSettingsToast('Notificaties uitgeschakeld');
                }
            });
        }

        // Setup profile edit modal
        this.setupProfileModal();

        // Setup gazon edit modal
        this.setupGazonModal();
    }

    /**
     * Load saved settings data
     */
    loadSettingsData() {
        // Load profile data
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const name = profile.name || 'Jan de Tuinier';
        const email = profile.email || 'jan@voorbeeld.nl';
        const city = profile.city || 'Amsterdam';
        const country = profile.country || 'Nederland';

        document.getElementById('profile-name').textContent = name;
        document.getElementById('profile-email').textContent = email;
        document.getElementById('profile-location').textContent = city + ', ' + country;

        // Load profile photo or show initials
        const avatarEl = document.getElementById('profile-avatar');
        const savedPhoto = localStorage.getItem('profilePhoto');
        if (savedPhoto) {
            avatarEl.innerHTML = `<img src="${savedPhoto}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            avatarEl.textContent = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }

        // Load gazon data
        const gazon = JSON.parse(localStorage.getItem('gazonData') || '{}');
        document.getElementById('gazon-area').textContent = (gazon.area || 150) + ' m2';
        document.getElementById('gazon-type').textContent = gazon.type || 'Siergazon';
        document.getElementById('gazon-soil').textContent = gazon.soil || 'Aarde';

        // Setup profile photo upload
        this.setupProfilePhotoUpload();
    }

    /**
     * Setup profile photo upload functionality
     */
    setupProfilePhotoUpload() {
        const avatarContainer = document.getElementById('profile-avatar-container');
        const fileInput = document.getElementById('profile-photo-input');

        if (!avatarContainer || !fileInput) return;

        avatarContainer.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                this.showSettingsToast('Foto is te groot (max 2MB)');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                // Create image to resize
                const img = new Image();
                img.onload = () => {
                    // Resize to max 200x200
                    const canvas = document.createElement('canvas');
                    const size = 200;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');

                    // Calculate crop dimensions (center crop to square)
                    const minDim = Math.min(img.width, img.height);
                    const sx = (img.width - minDim) / 2;
                    const sy = (img.height - minDim) / 2;

                    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

                    // Convert to base64 with compression
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    localStorage.setItem('profilePhoto', base64);

                    // Update avatar display
                    const avatarEl = document.getElementById('profile-avatar');
                    avatarEl.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;

                    this.showSettingsToast('Profielfoto opgeslagen');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Setup profile edit modal
     */
    setupProfileModal() {
        const modal = document.getElementById('profile-modal');
        const editBtn = document.getElementById('edit-profile-btn');
        const cancelBtn = document.getElementById('cancel-profile');
        const saveBtn = document.getElementById('save-profile');

        if (!modal || !editBtn) return;

        editBtn.addEventListener('click', () => {
            // Pre-fill inputs with current values
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            document.getElementById('input-name').value = profile.name || 'Jan de Tuinier';
            document.getElementById('input-email').value = profile.email || 'jan@voorbeeld.nl';
            document.getElementById('input-city').value = profile.city || 'Amsterdam';
            document.getElementById('input-country').value = profile.country || 'Nederland';
            modal.classList.add('active');
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        saveBtn.addEventListener('click', () => {
            const name = document.getElementById('input-name').value;
            const email = document.getElementById('input-email').value;
            const city = document.getElementById('input-city').value;
            const country = document.getElementById('input-country').value;

            localStorage.setItem('userProfile', JSON.stringify({ name, email, city, country }));
            this.loadSettingsData();
            modal.classList.remove('active');
            this.showSettingsToast('Profiel opgeslagen');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    /**
     * Setup gazon edit modal
     */
    setupGazonModal() {
        const modal = document.getElementById('gazon-modal');
        const editBtn = document.getElementById('edit-gazon-btn');
        const cancelBtn = document.getElementById('cancel-gazon');
        const saveBtn = document.getElementById('save-gazon');

        if (!modal || !editBtn) return;

        editBtn.addEventListener('click', () => {
            // Pre-fill inputs with current values
            const gazon = JSON.parse(localStorage.getItem('gazonData') || '{}');
            document.getElementById('input-area').value = gazon.area || 150;
            document.getElementById('input-type').value = gazon.type || 'Siergazon';
            document.getElementById('input-soil').value = gazon.soil || 'Aarde';
            modal.classList.add('active');
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        saveBtn.addEventListener('click', () => {
            const area = document.getElementById('input-area').value;
            const type = document.getElementById('input-type').value;
            const soil = document.getElementById('input-soil').value;

            localStorage.setItem('gazonData', JSON.stringify({ area, type, soil }));
            this.loadSettingsData();
            modal.classList.remove('active');
            this.showSettingsToast('Gazon gegevens opgeslagen');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    /**
     * Show toast notification on settings page
     */
    showSettingsToast(message) {
        const toast = document.getElementById('settings-toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('active');
            setTimeout(() => toast.classList.remove('active'), 2500);
        }
    }

    /**
     * Apply or remove light mode styling
     */
    applyLightMode(isLight) {
        const styleId = 'light-mode-styles';
        let styleEl = document.getElementById(styleId);

        if (isLight) {
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = `
                body, .page {
                    background: #f8f9fa !important;
                }
                .page {
                    background: linear-gradient(180deg, #f8f9fa 0%, #eef2eb 100%) !important;
                }
                .page h1, .page h2, .page h3, .page p, .page span, .page label {
                    color: #2e463b !important;
                }
                .page header {
                    background: #d4e6c8 !important;
                    border-bottom-color: rgba(46,70,59,0.15) !important;
                }
                .page header h1, .page header p {
                    color: #2e463b !important;
                }
                .page section, .page .login-card {
                    background: #e8f5e0 !important;
                    border-color: rgba(46,70,59,0.15) !important;
                    box-shadow: 0 2px 8px rgba(46,70,59,0.1) !important;
                }
                .page .modal-overlay {
                    background: rgba(46,70,59,0.5) !important;
                }
                .page .modal-content {
                    background: #e8f5e0 !important;
                    border-color: rgba(46,70,59,0.2) !important;
                }
                .page .modal-content h3 {
                    color: #2e463b !important;
                }
                .page .modal-input, .page .modal-select {
                    background: #ffffff !important;
                    border-color: rgba(46,70,59,0.25) !important;
                    color: #2e463b !important;
                }
                .page .modal-label {
                    color: #3a5a47 !important;
                }
                .bottom-nav {
                    background: #d4e6c8 !important;
                    border-top-color: rgba(46,70,59,0.15) !important;
                }
                .bottom-nav .nav-item span {
                    color: #3a5a47 !important;
                }
                .bottom-nav .nav-item.active span {
                    color: #538731 !important;
                }
                .bottom-nav .nav-item svg {
                    stroke: #3a5a47 !important;
                }
                .bottom-nav .nav-item.active svg {
                    stroke: #538731 !important;
                }
                .page button:not(.login-btn):not(.nav-item):not(.badge-btn) {
                    background: #89b865 !important;
                    color: white !important;
                }
                .page .toggle-switch {
                    background: #b8d4a8 !important;
                }
                .page .toggle-switch.active {
                    background: #89b865 !important;
                }
                .page a {
                    color: #538731 !important;
                }
                .page .toast {
                    background: #538731 !important;
                }
            `;
            document.body.classList.add('light-mode');
        } else {
            if (styleEl) {
                styleEl.remove();
            }
            document.body.classList.remove('light-mode');
        }
    }

    /**
     * Check and apply theme mode on page load
     */
    checkAndApplyTheme() {
        const isDarkMode = localStorage.getItem('darkMode') !== 'false';
        this.applyLightMode(!isDarkMode);
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
