/**
 * De Gazon App - Loyalty Gamification System
 * Handles missions, badges, rewards, and points tracking
 */

class LoyaltyGamification {
    constructor() {
        this.currentPoints = 77; // Will be loaded from localStorage
        this.init();
    }

    init() {
        this.loadUserData();
        this.initializeModals();
        this.initializeBadgeClickHandlers();
        this.initializeRewardClaimHandlers();
        this.updateUI();
    }

    /**
     * Load user data from localStorage
     */
    loadUserData() {
        // Initialize default data structure if not exists
        const defaultData = {
            gazonPunten: {
                total: 77,
                totalEarned: 127,
                totalSpent: 50,
                history: [
                    { date: "2025-01-19T10:30:00Z", action: "check-in", description: "Wekelijkse check-in", points: 5, type: "earned" },
                    { date: "2025-01-19T09:15:00Z", action: "rating", description: "Beoordeling gegeven", points: 2, type: "earned" },
                    { date: "2025-01-18T14:00:00Z", action: "photo-share", description: "Foto gedeeld", points: 25, type: "earned" },
                    { date: "2025-01-18T12:00:00Z", action: "export-schedule", description: "Schema geëxporteerd", points: 50, type: "earned" },
                    { date: "2025-01-17T08:00:00Z", action: "streak-milestone", description: "Streak milestone (4 wkn)", points: 25, type: "earned" },
                    { date: "2025-01-17T08:05:00Z", action: "badge-unlock", description: "Badge unlocked: Trouwe Tuinier", points: 0, type: "milestone" },
                    { date: "2025-01-15T14:00:00Z", action: "reward-claim", description: "Beloning: Profielbadge", points: -50, type: "spent" }
                ]
            },
            weeklyMissions: {
                weekNumber: 4,
                year: 2025,
                missions: {
                    ratings: { current: 2, target: 3, completed: false },
                    checkIn: { current: 1, target: 1, completed: true },
                    sharePhoto: { current: 0, target: 1, completed: false },
                    photoAnalysis: { current: 0, target: 1, completed: false }
                },
                allCompletedBonus: false
            },
            rewards: {
                claimed: [
                    { id: "profile-badge", claimedAt: "2025-01-15T14:00:00Z", code: null }
                ]
            },
            badges: {
                unlocked: {
                    "first-analysis": { unlockedAt: "2025-01-10T10:00:00Z" },
                    "loyal-tuinier": { unlockedAt: "2025-01-17T08:00:00Z" },
                    "schema-master": { unlockedAt: "2025-01-18T12:00:00Z" },
                    "first-review": { unlockedAt: "2025-01-12T16:00:00Z" },
                    "winter-warrior": { unlockedAt: "2025-01-05T09:00:00Z" }
                }
            },
            stats: {
                photosShared: 3,
                ratingsGiven: 12,
                analysesCompleted: 2,
                longestStreak: 4
            }
        };

        // Load or initialize
        if (!localStorage.getItem('gazon-gamification')) {
            localStorage.setItem('gazon-gamification', JSON.stringify(defaultData));
        }

        this.userData = JSON.parse(localStorage.getItem('gazon-gamification') || JSON.stringify(defaultData));
        this.currentPoints = this.userData.gazonPunten.total;
    }

    /**
     * Save user data to localStorage
     */
    saveUserData() {
        localStorage.setItem('gazon-gamification', JSON.stringify(this.userData));
    }

    /**
     * Badge definitions
     */
    getBadgeDefinitions() {
        return {
            'first-analysis': {
                icon: '🔍',
                name: 'Eerste Analyse',
                description: 'Je hebt je eerste gazon foto laten analyseren!',
                requirement: 'Voltooi eerste foto analyse'
            },
            'loyal-tuinier': {
                icon: '💚',
                name: 'Trouwe Tuinier',
                description: 'Je hebt 4 weken achter elkaar ingecheckt!',
                requirement: 'Check 4 weken achter elkaar in'
            },
            'schema-master': {
                icon: '📅',
                name: 'Schema Meester',
                description: 'Je hebt je bemestingsschema geëxporteerd!',
                requirement: 'Exporteer bemestingsschema'
            },
            'first-review': {
                icon: '⭐',
                name: 'Eerste Review',
                description: 'Je hebt je eerste beoordeling gegeven!',
                requirement: 'Geef eerste beoordeling'
            },
            'photographer': {
                icon: '📸',
                name: 'Fotograaf',
                description: 'Deel 5 foto\'s van je gazon',
                requirement: 'Deel 5 foto\'s',
                progress: () => Math.min(this.userData.stats.photosShared, 5),
                target: 5
            },
            'streak-master': {
                icon: '🔥',
                name: 'Streak Master',
                description: 'Check 8 weken achter elkaar in',
                requirement: 'Check 8 weken achter elkaar in',
                progress: () => Math.min(this.userData.stats.longestStreak, 8),
                target: 8
            },
            'challenge-winner': {
                icon: '🏆',
                name: 'Challenge Winnaar',
                description: 'Win een wekelijkse challenge',
                requirement: 'Win een wekelijkse challenge'
            },
            'popular': {
                icon: '🌟',
                name: 'Populair',
                description: 'Krijg 10 beoordelingen op één foto',
                requirement: 'Krijg 10 beoordelingen op één foto'
            },
            'perfectionist': {
                icon: '💯',
                name: 'Perfectionist',
                description: 'Krijg een 5-sterren beoordeling',
                requirement: 'Krijg een 5-sterren beoordeling'
            },
            'spring-starter': {
                icon: '🌱',
                name: 'Lente Starter',
                description: 'Deel een foto in maart of april',
                requirement: 'Seizoensbadge'
            },
            'summer-star': {
                icon: '☀️',
                name: 'Zomer Ster',
                description: 'Krijg 5 sterren in de zomer (juni-aug)',
                requirement: 'Seizoensbadge'
            },
            'autumn-hero': {
                icon: '🍂',
                name: 'Herfst Held',
                description: 'Exporteer je schema in september of oktober',
                requirement: 'Seizoensbadge'
            },
            'winter-warrior': {
                icon: '❄️',
                name: 'Winter Warrior',
                description: 'Blijf actief in de wintermaanden!',
                requirement: 'Seizoensbadge'
            },
            'mission-master': {
                icon: '🎯',
                name: 'Missie Meester',
                description: 'Voltooi alle wekelijkse missies',
                requirement: 'Voltooi alle wekelijkse missies'
            },
            'legend': {
                icon: '👑',
                name: 'Gazon Legende',
                description: 'Bereik 1000 punten totaal verdiend!',
                requirement: 'Bereik 1000 punten',
                progress: () => Math.min(this.userData.gazonPunten.totalEarned, 1000),
                target: 1000
            }
        };
    }

    /**
     * Initialize badge click handlers
     */
    initializeBadgeClickHandlers() {
        const badgeButtons = document.querySelectorAll('.badge-item');
        badgeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const badgeId = button.getAttribute('data-badge-id');
                const isUnlocked = button.getAttribute('data-unlocked') === 'true';
                this.showBadgeModal(badgeId, isUnlocked);
            });
        });
    }

    /**
     * Show badge detail modal
     */
    showBadgeModal(badgeId, isUnlocked) {
        const modal = document.getElementById('badge-modal');
        const definitions = this.getBadgeDefinitions();
        const badge = definitions[badgeId];

        if (!badge) return;

        // Set icon
        document.getElementById('badge-modal-icon').textContent = isUnlocked ? badge.icon : '🔒';

        // Set title
        document.getElementById('badge-modal-title').textContent = isUnlocked ? badge.name : badge.name;

        // Set description
        document.getElementById('badge-modal-desc').textContent = isUnlocked
            ? badge.description
            : `"${badge.requirement}"`;

        // Set date or progress
        const progressDiv = document.getElementById('badge-modal-progress');
        const dateP = document.getElementById('badge-modal-date');

        if (isUnlocked) {
            progressDiv.style.display = 'none';
            const unlockedData = this.userData.badges.unlocked[badgeId];
            if (unlockedData) {
                const date = new Date(unlockedData.unlockedAt);
                dateP.textContent = `Verdiend op: ${date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
            }
        } else {
            // Show progress if available
            if (badge.progress && badge.target) {
                progressDiv.style.display = 'block';
                const progress = badge.progress();
                const percentage = (progress / badge.target) * 100;
                document.getElementById('badge-progress-text').textContent = `${progress}/${badge.target}`;
                document.getElementById('badge-progress-bar').style.width = `${percentage}%`;
            } else {
                progressDiv.style.display = 'none';
            }
            dateP.textContent = '';
        }

        // Show modal
        modal.style.display = 'flex';
    }

    /**
     * Initialize modal close handlers
     */
    initializeModals() {
        // Badge modal close
        const badgeModalClose = document.getElementById('badge-modal-close');
        const badgeModal = document.getElementById('badge-modal');

        badgeModalClose?.addEventListener('click', () => {
            badgeModal.style.display = 'none';
        });

        badgeModal?.addEventListener('click', (e) => {
            if (e.target === badgeModal) {
                badgeModal.style.display = 'none';
            }
        });

        // Reward modal close
        const rewardModalClose = document.getElementById('reward-modal-close');
        const rewardModal = document.getElementById('reward-modal');

        rewardModalClose?.addEventListener('click', () => {
            rewardModal.style.display = 'none';
        });

        rewardModal?.addEventListener('click', (e) => {
            if (e.target === rewardModal) {
                rewardModal.style.display = 'none';
            }
        });
    }

    /**
     * Initialize reward claim handlers
     */
    initializeRewardClaimHandlers() {
        const claimButtons = document.querySelectorAll('.claim-reward-btn');
        claimButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const rewardItem = button.closest('.reward-item');
                const rewardId = rewardItem.getAttribute('data-reward-id');
                const cost = parseInt(rewardItem.getAttribute('data-cost'));

                this.claimReward(rewardId, cost);
            });
        });
    }

    /**
     * Claim a reward
     */
    claimReward(rewardId, cost) {
        // Check if already claimed
        const alreadyClaimed = this.userData.rewards.claimed.find(r => r.id === rewardId);
        if (alreadyClaimed) {
            alert('Je hebt deze beloning al geclaimd!');
            return;
        }

        // Check if enough points
        if (this.userData.gazonPunten.total < cost) {
            alert(`Niet genoeg punten! Je hebt nog ${cost - this.userData.gazonPunten.total} punten nodig.`);
            return;
        }

        // Deduct points
        this.userData.gazonPunten.total -= cost;
        this.userData.gazonPunten.totalSpent += cost;

        // Generate discount code if applicable
        let code = null;
        if (rewardId.includes('discount')) {
            code = this.generateDiscountCode();
        }

        // Add to claimed rewards
        this.userData.rewards.claimed.push({
            id: rewardId,
            claimedAt: new Date().toISOString(),
            code: code
        });

        // Add to history
        this.userData.gazonPunten.history.unshift({
            date: new Date().toISOString(),
            action: 'reward-claim',
            description: `Beloning: ${this.getRewardName(rewardId)}`,
            points: -cost,
            type: 'spent'
        });

        // Save data
        this.saveUserData();
        this.currentPoints = this.userData.gazonPunten.total;

        // Update UI
        this.updateUI();

        // Show reward modal
        this.showRewardModal(rewardId, code);
    }

    /**
     * Generate a discount code
     */
    generateDiscountCode() {
        const prefix = 'GAZON';
        const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}${suffix}`;
    }

    /**
     * Get reward name by ID
     */
    getRewardName(rewardId) {
        const names = {
            'profile-badge': 'Exclusieve Profielbadge',
            'discount-5': '5% Kortingscode',
            'free-shipping': 'Gratis Verzending',
            'voucher-5': '€5 Waardebon',
            'fertilizer-package': 'Gratis Gazonmest Pakket'
        };
        return names[rewardId] || 'Onbekende beloning';
    }

    /**
     * Show reward claim modal
     */
    showRewardModal(rewardId, code) {
        const modal = document.getElementById('reward-modal');
        const descP = document.getElementById('reward-modal-desc');
        const codeContainer = document.getElementById('reward-code-container');
        const codeP = document.getElementById('reward-code');

        descP.textContent = `Je hebt "${this.getRewardName(rewardId)}" geclaimd!`;

        if (code) {
            codeContainer.style.display = 'block';
            codeP.textContent = code;
        } else {
            codeContainer.style.display = 'none';
        }

        modal.style.display = 'flex';

        // Add celebration animation
        this.showCelebration();
    }

    /**
     * Show celebration animation (confetti-like effect)
     */
    showCelebration() {
        // Simple visual feedback - could be enhanced with confetti library
        console.log('🎉 Celebration! Reward claimed!');
        // TODO: Add confetti animation
    }

    /**
     * Check mission progress
     */
    checkMissionProgress(action, data = {}) {
        const missions = this.userData.weeklyMissions.missions;

        switch(action) {
            case 'rating':
                if (!missions.ratings.completed && missions.ratings.current < missions.ratings.target) {
                    missions.ratings.current++;
                    if (missions.ratings.current >= missions.ratings.target) {
                        missions.ratings.completed = true;
                        this.addPoints(10, 'Missie voltooid: Beoordelingen');
                    }
                }
                break;

            case 'check-in':
                if (!missions.checkIn.completed) {
                    missions.checkIn.current = 1;
                    missions.checkIn.completed = true;
                    this.addPoints(5, 'Wekelijkse check-in');
                }
                break;

            case 'share-photo':
                if (!missions.sharePhoto.completed) {
                    missions.sharePhoto.current = 1;
                    missions.sharePhoto.completed = true;
                    this.addPoints(25, 'Foto gedeeld');
                }
                break;

            case 'photo-analysis':
                if (!missions.photoAnalysis.completed) {
                    missions.photoAnalysis.current = 1;
                    missions.photoAnalysis.completed = true;
                    this.addPoints(10, 'Foto analyse voltooid');
                }
                break;
        }

        // Check if all missions completed
        const allCompleted = Object.values(missions).every(m => m.completed);
        if (allCompleted && !this.userData.weeklyMissions.allCompletedBonus) {
            this.userData.weeklyMissions.allCompletedBonus = true;
            this.addPoints(20, 'Alle wekelijkse missies voltooid!');
            this.showCelebration();
        }

        this.saveUserData();
        this.updateUI();
    }

    /**
     * Add points to user account
     */
    addPoints(points, description) {
        this.userData.gazonPunten.total += points;
        this.userData.gazonPunten.totalEarned += points;

        this.userData.gazonPunten.history.unshift({
            date: new Date().toISOString(),
            action: 'points-earned',
            description: description,
            points: points,
            type: 'earned'
        });

        this.currentPoints = this.userData.gazonPunten.total;
        this.saveUserData();
    }

    /**
     * Check and unlock badges
     */
    checkBadgeUnlock(action, data = {}) {
        const badges = this.userData.badges.unlocked;

        switch(action) {
            case 'first-analysis':
                if (!badges['first-analysis']) {
                    this.unlockBadge('first-analysis');
                }
                break;

            case 'streak-update':
                if (data.streak >= 4 && !badges['loyal-tuinier']) {
                    this.unlockBadge('loyal-tuinier');
                }
                if (data.streak >= 8 && !badges['streak-master']) {
                    this.unlockBadge('streak-master');
                }
                break;

            case 'export-schedule':
                if (!badges['schema-master']) {
                    this.unlockBadge('schema-master');
                }
                break;

            case 'first-rating':
                if (!badges['first-review']) {
                    this.unlockBadge('first-review');
                }
                break;

            case 'all-missions-complete':
                if (!badges['mission-master']) {
                    this.unlockBadge('mission-master');
                }
                break;
        }
    }

    /**
     * Unlock a badge
     */
    unlockBadge(badgeId) {
        this.userData.badges.unlocked[badgeId] = {
            unlockedAt: new Date().toISOString()
        };

        this.userData.gazonPunten.history.unshift({
            date: new Date().toISOString(),
            action: 'badge-unlock',
            description: `Badge unlocked: ${this.getBadgeDefinitions()[badgeId].name}`,
            points: 0,
            type: 'milestone'
        });

        this.saveUserData();
        this.updateUI();
        this.showBadgeUnlockAnimation(badgeId);
    }

    /**
     * Show badge unlock animation
     */
    showBadgeUnlockAnimation(badgeId) {
        const badge = this.getBadgeDefinitions()[badgeId];
        console.log(`🏅 Badge Unlocked: ${badge.name} ${badge.icon}`);
        // TODO: Add visual animation
        alert(`🏅 Badge Unlocked!\n\n${badge.name}\n${badge.description}`);
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        // Update points display
        const pointsEl = document.getElementById('loyalty-points');
        if (pointsEl) {
            pointsEl.textContent = this.userData.gazonPunten.total;
        }

        // Update reward buttons
        this.updateRewardButtons();
    }

    /**
     * Update reward claim buttons based on current points
     */
    updateRewardButtons() {
        const rewardItems = document.querySelectorAll('.reward-item');
        rewardItems.forEach(item => {
            const rewardId = item.getAttribute('data-reward-id');
            const cost = parseInt(item.getAttribute('data-cost'));
            const button = item.querySelector('button, span:last-child');

            // Check if already claimed
            const alreadyClaimed = this.userData.rewards.claimed.find(r => r.id === rewardId);

            if (alreadyClaimed) {
                item.style.opacity = '0.5';
                button.textContent = 'GECLAIMD';
                button.style.background = 'rgba(255,255,255,0.1)';
                button.style.cursor = 'not-allowed';
                button.disabled = true;
            } else if (this.userData.gazonPunten.total >= cost) {
                item.style.opacity = '1';
                // Already has CLAIM button from HTML
            } else {
                item.style.opacity = '0.7';
                // Already has "NOG X PUNTEN" from HTML
            }
        });
    }
}

// Initialize function that can be called anytime
function initLoyaltyGamification() {
    // Check if we're on the loyalty page
    if (document.getElementById('loyalty-page')) {
        if (!window.loyaltyGame) {
            window.loyaltyGame = new LoyaltyGamification();
            console.log('✅ Loyalty Gamification System Initialized');
        } else {
            // Already initialized, just update UI
            window.loyaltyGame.updateUI();
            console.log('✅ Loyalty Gamification System Updated');
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoyaltyGamification);
} else {
    // DOM already loaded (dynamic script loading)
    initLoyaltyGamification();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoyaltyGamification;
}
