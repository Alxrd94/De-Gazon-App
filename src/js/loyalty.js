/**
 * Loyalty Points Module
 * Handles GazonPunten loyalty system
 */

import { Storage, STORAGE_KEYS } from './storage.js';
import { generateId, formatDate, showToast } from './utils.js';

/**
 * Add points to user's account
 * @param {string} activityType - Type of activity
 * @param {number} points - Points to add
 * @param {string} description - Description of activity
 */
export function addPoints(activityType, points, description) {
    const loyaltyData = Storage.get(STORAGE_KEYS.LOYALTY_POINTS, {
        total: 0,
        history: []
    });

    // Add new activity
    const activity = {
        id: generateId(),
        type: activityType,
        points: points,
        description: description,
        date: new Date().toISOString()
    };

    loyaltyData.total += points;
    loyaltyData.history.unshift(activity);

    // Save to storage
    Storage.set(STORAGE_KEYS.LOYALTY_POINTS, loyaltyData);

    // Update UI if on loyalty page
    updatePointsDisplay();

    return loyaltyData.total;
}

/**
 * Redeem points for a reward
 * @param {string} rewardId - Reward ID
 * @param {number} pointsCost - Points required
 * @returns {boolean} True if successful
 */
export function redeemReward(rewardId, pointsCost) {
    const loyaltyData = Storage.get(STORAGE_KEYS.LOYALTY_POINTS, {
        total: 0,
        history: []
    });

    if (loyaltyData.total < pointsCost) {
        showToast('Niet genoeg punten', 'error');
        return false;
    }

    // Deduct points
    const activity = {
        id: generateId(),
        type: 'reward_redeemed',
        points: -pointsCost,
        description: `Beloning ingewisseld: ${rewardId}`,
        date: new Date().toISOString(),
        rewardId: rewardId
    };

    loyaltyData.total -= pointsCost;
    loyaltyData.history.unshift(activity);

    Storage.set(STORAGE_KEYS.LOYALTY_POINTS, loyaltyData);

    showToast('Beloning ingewisseld!', 'success');
    updatePointsDisplay();

    return true;
}

/**
 * Get total points
 * @returns {number} Total points
 */
export function getTotalPoints() {
    const loyaltyData = Storage.get(STORAGE_KEYS.LOYALTY_POINTS, { total: 0 });
    return loyaltyData.total;
}

/**
 * Get points history
 * @returns {Array} Points history
 */
export function getPointsHistory() {
    const loyaltyData = Storage.get(STORAGE_KEYS.LOYALTY_POINTS, { history: [] });
    return loyaltyData.history;
}

/**
 * Update points display in UI
 */
function updatePointsDisplay() {
    const totalPoints = getTotalPoints();

    // Update all points displays
    const pointsElements = document.querySelectorAll('.points-number');
    pointsElements.forEach(el => {
        el.textContent = totalPoints;
    });
}

class LoyaltyManager {
    constructor() {
        this.rewards = [
            { id: 'discount-5', name: '€5 Korting', points: 50, icon: '☕' },
            { id: 'free-analysis', name: 'Gratis Analyse', points: 100, icon: '🎁' },
            { id: 'free-fertilizer', name: 'Gratis Bemesting', points: 200, icon: '🌱' },
            { id: 'vip-service', name: 'VIP Service', points: 500, icon: '⭐' }
        ];
    }

    /**
     * Initialize loyalty page
     */
    init() {
        this.setupEventListeners();
        this.displayPoints();
        this.displayActivity();
        this.updateRewardButtons();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Reward buttons
        const rewardButtons = document.querySelectorAll('.btn-reward');
        rewardButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rewardId = e.target.dataset.reward;
                const rewardCard = e.target.closest('.reward-card');
                const pointsCost = parseInt(rewardCard.dataset.points);
                this.handleRewardRedeem(rewardId, pointsCost);
            });
        });

        // View points button (on home page)
        const viewPointsBtn = document.getElementById('view-points-btn');
        if (viewPointsBtn) {
            viewPointsBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'loyalty' } }));
            });
        }

        // Back button
        const backBtn = document.getElementById('back-to-home-loyalty');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'home' } }));
            });
        }
    }

    /**
     * Display current points
     */
    displayPoints() {
        const totalPoints = getTotalPoints();
        const pointsElement = document.getElementById('loyalty-points');
        if (pointsElement) {
            pointsElement.textContent = totalPoints;
        }

        // Also update home page display
        const homePointsElement = document.getElementById('total-points');
        if (homePointsElement) {
            homePointsElement.textContent = totalPoints;
        }
    }

    /**
     * Display activity history
     */
    displayActivity() {
        const history = getPointsHistory();
        const activityList = document.getElementById('activity-list');

        if (!activityList) return;

        if (history.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">ℹ️</div>
                    <div class="activity-details">
                        <p class="activity-title">Nog geen activiteit</p>
                        <p class="activity-date">Begin met het gebruiken van de app om punten te verdienen</p>
                    </div>
                </div>
            `;
            return;
        }

        activityList.innerHTML = history.slice(0, 10).map(activity => {
            const icon = this.getActivityIcon(activity.type);
            const date = this.formatActivityDate(new Date(activity.date));
            const pointsClass = activity.points > 0 ? 'activity-points' : 'activity-points-negative';

            return `
                <div class="activity-item">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-details">
                        <p class="activity-title">${activity.description}</p>
                        <p class="activity-date">${date}</p>
                    </div>
                    <div class="${pointsClass}">${activity.points > 0 ? '+' : ''}${activity.points}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get icon for activity type
     * @param {string} type - Activity type
     * @returns {string} Icon emoji
     */
    getActivityIcon(type) {
        const icons = {
            'photo_analysis': '📸',
            'schedule_created': '📅',
            'task_completed': '✅',
            'purchase': '🛒',
            'welcome_bonus': '🎉',
            'reward_redeemed': '🎁'
        };
        return icons[type] || '⭐';
    }

    /**
     * Format activity date
     * @param {Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatActivityDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Zojuist';
        if (diffMins < 60) return `${diffMins} minuten geleden`;
        if (diffHours < 24) return `${diffHours} uur geleden`;
        if (diffDays < 7) return `${diffDays} dagen geleden`;
        return formatDate(date);
    }

    /**
     * Handle reward redemption
     * @param {string} rewardId - Reward ID
     * @param {number} pointsCost - Points cost
     */
    handleRewardRedeem(rewardId, pointsCost) {
        const success = redeemReward(rewardId, pointsCost);
        if (success) {
            this.displayPoints();
            this.displayActivity();
            this.updateRewardButtons();
        }
    }

    /**
     * Update reward buttons enabled/disabled state
     */
    updateRewardButtons() {
        const totalPoints = getTotalPoints();
        const rewardButtons = document.querySelectorAll('.btn-reward');

        rewardButtons.forEach(btn => {
            const rewardCard = btn.closest('.reward-card');
            const pointsCost = parseInt(rewardCard.dataset.points);

            if (totalPoints < pointsCost) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });
    }
}

// Create and export singleton instance
const loyaltyManager = new LoyaltyManager();
export default loyaltyManager;
