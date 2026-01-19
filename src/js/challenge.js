/**
 * Challenge Module
 * Handles the social community features, challenges, streaks, and leaderboards
 */

import { Storage, STORAGE_KEYS } from './storage.js';
import { generateId, compressImage, showToast } from './utils.js';
import { addPoints } from './loyalty.js';

// Weekly challenge themes that rotate each week
const weeklyThemes = [
    { theme: "Laat je gazon zien na het maaien!", icon: "✂️" },
    { theme: "Je mooiste hoekje van de tuin", icon: "🌸" },
    { theme: "Voor en na: het verschil!", icon: "📸" },
    { theme: "Ochtenddauw op je gazon", icon: "💧" },
    { theme: "Strakke randen!", icon: "📐" },
    { theme: "Je gazon vanuit vogelperspectief", icon: "🦅" },
    { theme: "Gazon in het zonlicht", icon: "☀️" },
    { theme: "Je trots: de hele tuin!", icon: "🏡" }
];

// Seasonal badges configuration
const seasonalBadges = {
    winterWarrior: {
        name: "Winter Warrior",
        icon: "❄️",
        description: "Log in tijdens december of januari",
        months: [12, 1],
        requirement: "login"
    },
    lenteStarter: {
        name: "Lente Starter",
        icon: "🌱",
        description: "Deel je eerste foto in maart of april",
        months: [3, 4],
        requirement: "sharePhoto"
    },
    zomerSter: {
        name: "Zomer Ster",
        icon: "☀️",
        description: "Krijg een 5-sterren beoordeling in juni/juli/augustus",
        months: [6, 7, 8],
        requirement: "get5Stars"
    },
    herfstHeld: {
        name: "Herfst Held",
        icon: "🍂",
        description: "Exporteer een bemestingsschema in september/oktober",
        months: [9, 10],
        requirement: "exportSchema"
    }
};

// Streak milestones
const streakMilestones = [
    { weeks: 4, points: 25, badge: "Trouwe Tuinier" },
    { weeks: 8, points: 50, badge: "Streak Master" },
    { weeks: 12, points: 75, badge: "Gazon Fanaat" },
    { weeks: 26, points: 150, badge: "Half Jaar Held" },
    { weeks: 52, points: 500, badge: "Jaar Kampioen" }
];

// Community milestones
const communityMilestones = [
    { target: 100, points: 10 },
    { target: 500, points: 15 },
    { target: 1000, points: 25 },
    { target: 2500, points: 50 },
    { target: 5000, points: 100 }
];

// Mock posts data
const mockPosts = [
    {
        id: "post_001",
        userId: "user_001",
        userName: "Pieter K.",
        userCity: "Amsterdam",
        userCountry: "Nederland",
        userAvatar: null,
        photo: null,
        photoColor: "#4a7856",
        products: ["gazonmest", "graszaad"],
        mowFrequency: "2x per week",
        verticulated: true,
        gardenSize: 180,
        ratings: [5, 5, 4, 5, 5, 4, 5, 5, 5, 4],
        averageRating: 4.7,
        postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        weeklyChallenge: true,
        challengeWeek: getWeekNumber(new Date())
    },
    {
        id: "post_002",
        userId: "user_002",
        userName: "Maria S.",
        userCity: "Rotterdam",
        userCountry: "Nederland",
        userAvatar: null,
        photo: null,
        photoColor: "#5a8a62",
        products: ["gazonmest", "najaarsmest", "gazonkalk"],
        mowFrequency: "1x per week",
        verticulated: true,
        gardenSize: 120,
        ratings: [5, 4, 5, 5, 4, 5, 4, 5],
        averageRating: 4.6,
        postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        weeklyChallenge: true,
        challengeWeek: getWeekNumber(new Date())
    },
    {
        id: "post_003",
        userId: "user_003",
        userName: "Johan B.",
        userCity: "Utrecht",
        userCountry: "Nederland",
        userAvatar: null,
        photo: null,
        photoColor: "#3d6b47",
        products: ["gazonmest", "magnesium"],
        mowFrequency: "2x per week",
        verticulated: false,
        gardenSize: 200,
        ratings: [4, 5, 4, 4, 5, 4, 5],
        averageRating: 4.4,
        postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        weeklyChallenge: false,
        challengeWeek: null
    },
    {
        id: "post_004",
        userId: "user_004",
        userName: "Emma D.",
        userCity: "Brussel",
        userCountry: "België",
        userAvatar: null,
        photo: null,
        photoColor: "#4d7a55",
        products: ["gazonmest", "antimos", "bodemactivator"],
        mowFrequency: "1x per week",
        verticulated: true,
        gardenSize: 90,
        ratings: [5, 5, 5, 4, 5, 5],
        averageRating: 4.8,
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        weeklyChallenge: true,
        challengeWeek: getWeekNumber(new Date())
    },
    {
        id: "post_005",
        userId: "user_005",
        userName: "Ramon B.",
        userCity: "De Rijp",
        userCountry: "Nederland",
        userAvatar: null,
        photo: null,
        photoColor: "#527a5c",
        products: ["gazonmest", "najaarsmest"],
        mowFrequency: "2x per week",
        verticulated: true,
        gardenSize: 150,
        ratings: [4, 4, 5, 4, 4],
        averageRating: 4.2,
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        weeklyChallenge: false,
        challengeWeek: null
    },
    {
        id: "post_006",
        userId: "user_006",
        userName: "Lisa V.",
        userCity: "Antwerpen",
        userCountry: "België",
        userAvatar: null,
        photo: null,
        photoColor: "#608a68",
        products: ["gazonmest", "graszaad", "gazonkalk"],
        mowFrequency: "1x per 2 weken",
        verticulated: false,
        gardenSize: 75,
        ratings: [3, 4, 4, 3, 4, 4],
        averageRating: 3.7,
        postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        weeklyChallenge: false,
        challengeWeek: null
    },
    {
        id: "post_007",
        userId: "user_007",
        userName: "Thomas M.",
        userCity: "Den Haag",
        userCountry: "Nederland",
        userAvatar: null,
        photo: null,
        photoColor: "#4a7050",
        products: ["gazonmest"],
        mowFrequency: "1x per week",
        verticulated: true,
        gardenSize: 110,
        ratings: [5, 4, 5, 5, 4, 5, 5],
        averageRating: 4.7,
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        weeklyChallenge: true,
        challengeWeek: getWeekNumber(new Date()) - 1
    },
    {
        id: "post_008",
        userId: "user_008",
        userName: "Sophie L.",
        userCity: "Gent",
        userCountry: "België",
        userAvatar: null,
        photo: null,
        photoColor: "#5d8560",
        products: ["gazonmest", "najaarsmest", "magnesium"],
        mowFrequency: "2x per week",
        verticulated: true,
        gardenSize: 140,
        ratings: [5, 5, 5, 5, 4],
        averageRating: 4.8,
        postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        weeklyChallenge: false,
        challengeWeek: null
    }
];

// Leaderboard mock data
const leaderboardData = {
    nl: [
        { rank: 1, name: "Pieter K.", city: "Amsterdam", score: 4.9 },
        { rank: 2, name: "Maria S.", city: "Rotterdam", score: 4.8 },
        { rank: 3, name: "Johan B.", city: "Utrecht", score: 4.7 },
        { rank: 4, name: "Thomas M.", city: "Den Haag", score: 4.6 },
        { rank: 5, name: "Ramon B.", city: "De Rijp", score: 4.5 }
    ],
    be: [
        { rank: 1, name: "Sophie L.", city: "Gent", score: 4.8 },
        { rank: 2, name: "Emma D.", city: "Brussel", score: 4.7 },
        { rank: 3, name: "Lisa V.", city: "Antwerpen", score: 4.5 }
    ],
    all: [
        { rank: 1, name: "Pieter K.", city: "Amsterdam", score: 4.9 },
        { rank: 2, name: "Sophie L.", city: "Gent", score: 4.8 },
        { rank: 3, name: "Maria S.", city: "Rotterdam", score: 4.8 },
        { rank: 4, name: "Emma D.", city: "Brussel", score: 4.7 },
        { rank: 5, name: "Johan B.", city: "Utrecht", score: 4.7 }
    ]
};

/**
 * Get ISO week number
 */
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get days until end of week (Sunday 23:59)
 */
function getDaysUntilWeekEnd() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    return daysUntilSunday;
}

/**
 * Get week string for storage key
 */
function getWeekKey(date = new Date()) {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Check if user has checked in this week
 */
function hasCheckedInThisWeek(streakData) {
    if (!streakData?.lastCheckIn) return false;
    const lastCheckIn = new Date(streakData.lastCheckIn);
    const currentWeekKey = getWeekKey();
    const lastCheckInWeekKey = getWeekKey(lastCheckIn);
    return currentWeekKey === lastCheckInWeekKey;
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min geleden`;
    if (diffHours < 24) return `${diffHours} uur geleden`;
    if (diffDays === 1) return 'gisteren';
    return `${diffDays} dagen geleden`;
}

class Challenge {
    constructor() {
        this.currentTab = 'nieuwste';
        this.selectedRating = 0;
        this.ratingPostId = null;
        this.uploadedPhoto = null;
    }

    /**
     * Initialize the challenge page
     */
    init() {
        this.initializeData();
        this.setupEventListeners();
        this.updateWeeklyChallenge();
        this.updateStreak();
        this.updateCommunityMilestone();
        this.updateSeasonalBadges();
        this.renderFeed();
        this.renderLeaderboard();
        this.checkSeasonalBadgeEligibility();
    }

    /**
     * Initialize default data if not exists
     */
    initializeData() {
        // Initialize challenge posts
        if (!Storage.get('challengePosts')) {
            Storage.set('challengePosts', mockPosts);
        }

        // Initialize user ratings
        if (!Storage.get('userRatings')) {
            Storage.set('userRatings', {});
        }

        // Initialize streak data
        if (!Storage.get('streak')) {
            Storage.set('streak', {
                currentStreak: 0,
                longestStreak: 0,
                lastCheckIn: null,
                checkInHistory: [],
                milestonesClaimed: []
            });
        }

        // Initialize seasonal badges
        const year = new Date().getFullYear();
        const seasonalBadgesData = Storage.get('seasonalBadges') || {};
        if (!seasonalBadgesData[year]) {
            seasonalBadgesData[year] = {
                winterWarrior: false,
                lenteStarter: false,
                zomerSter: false,
                herfstHeld: false
            };
            Storage.set('seasonalBadges', seasonalBadgesData);
        }

        // Initialize community stats
        if (!Storage.get('communityStats')) {
            Storage.set('communityStats', {
                totalPhotosShared: 847,
                currentMilestone: 1000,
                lastMilestoneClaimed: 500
            });
        }

        // Initialize challenge winners
        if (!Storage.get('challengeWinners')) {
            const lastWeekKey = getWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            Storage.set('challengeWinners', {
                [lastWeekKey]: { userId: "user_001", userName: "Pieter K.", city: "Amsterdam", score: 4.9 }
            });
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.feed-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Join challenge button
        const joinChallengeBtn = document.getElementById('join-challenge-btn');
        if (joinChallengeBtn) {
            joinChallengeBtn.addEventListener('click', () => this.openUploadModal(true));
        }

        // Check-in button
        const checkinBtn = document.getElementById('checkin-btn');
        if (checkinBtn) {
            checkinBtn.addEventListener('click', () => this.handleCheckIn());
        }

        // FAB upload button
        const fabUpload = document.getElementById('fab-upload');
        if (fabUpload) {
            fabUpload.addEventListener('click', () => this.openUploadModal(false));
        }

        // Upload modal controls
        const closeUploadModal = document.getElementById('close-upload-modal');
        const cancelUploadBtn = document.getElementById('cancel-upload-btn');
        const submitPostBtn = document.getElementById('submit-post-btn');
        const modalUploadArea = document.getElementById('modal-upload-area');
        const modalPhotoInput = document.getElementById('modal-photo-input');

        if (closeUploadModal) closeUploadModal.addEventListener('click', () => this.closeUploadModal());
        if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', () => this.closeUploadModal());
        if (submitPostBtn) submitPostBtn.addEventListener('click', () => this.submitPost());
        if (modalUploadArea) modalUploadArea.addEventListener('click', () => modalPhotoInput?.click());
        if (modalPhotoInput) modalPhotoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Rating modal controls
        const cancelRatingBtn = document.getElementById('cancel-rating-btn');
        const submitRatingBtn = document.getElementById('submit-rating-btn');

        if (cancelRatingBtn) cancelRatingBtn.addEventListener('click', () => this.closeRatingModal());
        if (submitRatingBtn) submitRatingBtn.addEventListener('click', () => this.submitRating());

        // Star rating buttons
        document.querySelectorAll('.star-btn').forEach(star => {
            star.addEventListener('click', (e) => this.selectRating(parseInt(e.target.dataset.rating)));
            star.addEventListener('mouseenter', (e) => this.hoverRating(parseInt(e.target.dataset.rating)));
            star.addEventListener('mouseleave', () => this.hoverRating(this.selectedRating));
        });

        // Leaderboard filter
        const leaderboardFilter = document.getElementById('leaderboard-filter');
        if (leaderboardFilter) {
            leaderboardFilter.addEventListener('change', (e) => this.renderLeaderboard(e.target.value));
        }

        // Close modals on backdrop click
        const uploadModal = document.getElementById('upload-modal');
        const ratingModal = document.getElementById('rating-modal');

        if (uploadModal) {
            uploadModal.addEventListener('click', (e) => {
                if (e.target === uploadModal) this.closeUploadModal();
            });
        }

        if (ratingModal) {
            ratingModal.addEventListener('click', (e) => {
                if (e.target === ratingModal) this.closeRatingModal();
            });
        }
    }

    /**
     * Update the weekly challenge display
     */
    updateWeeklyChallenge() {
        const weekNumber = getWeekNumber(new Date());
        const currentTheme = weeklyThemes[weekNumber % weeklyThemes.length];

        // Update theme display
        const themeEl = document.getElementById('challenge-theme');
        const iconEl = document.getElementById('challenge-icon');
        const modalThemeEl = document.getElementById('modal-challenge-theme');

        if (themeEl) themeEl.textContent = `"${currentTheme.theme}"`;
        if (iconEl) iconEl.textContent = currentTheme.icon;
        if (modalThemeEl) modalThemeEl.textContent = `"${currentTheme.theme}"`;

        // Update timer
        const daysLeft = getDaysUntilWeekEnd();
        const timerEl = document.getElementById('challenge-timer');
        if (timerEl) {
            timerEl.textContent = daysLeft === 0 ? 'Laatste dag!' : `Nog ${daysLeft} dagen`;
        }

        // Update participants count
        const posts = Storage.get('challengePosts') || [];
        const currentWeek = getWeekNumber(new Date());
        const participants = posts.filter(p => p.weeklyChallenge && p.challengeWeek === currentWeek).length;
        const participantsEl = document.getElementById('challenge-participants');
        if (participantsEl) {
            participantsEl.textContent = `${participants} deelnemers`;
        }

        // Show previous winner
        const winners = Storage.get('challengeWinners') || {};
        const lastWeekKey = getWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const lastWinner = winners[lastWeekKey];

        const winnerSection = document.getElementById('previous-winner');
        if (winnerSection && lastWinner) {
            winnerSection.style.display = 'block';
            document.getElementById('winner-name').textContent = lastWinner.userName;
            document.getElementById('winner-city').textContent = lastWinner.city;
            document.getElementById('winner-score').textContent = lastWinner.score.toFixed(1);
        }
    }

    /**
     * Update streak display
     */
    updateStreak() {
        const streakData = Storage.get('streak') || { currentStreak: 0 };
        const currentStreak = streakData.currentStreak || 0;

        // Update flames
        const flamesEl = document.getElementById('streak-flames');
        if (flamesEl) {
            const flames = '🔥'.repeat(Math.min(currentStreak, 10));
            flamesEl.textContent = flames || '💤';
        }

        // Update count
        const countEl = document.getElementById('streak-count');
        if (countEl) countEl.textContent = currentStreak;

        // Find next milestone
        const nextMilestone = streakMilestones.find(m => m.weeks > currentStreak) || streakMilestones[streakMilestones.length - 1];
        const prevMilestone = [...streakMilestones].reverse().find(m => m.weeks <= currentStreak);
        const prevWeeks = prevMilestone?.weeks || 0;

        // Update milestone display
        const nextWeeksEl = document.getElementById('next-milestone-weeks');
        const nextPointsEl = document.getElementById('next-milestone-points');
        if (nextWeeksEl) nextWeeksEl.textContent = nextMilestone.weeks;
        if (nextPointsEl) nextPointsEl.textContent = nextMilestone.points;

        // Update progress bar
        const progress = ((currentStreak - prevWeeks) / (nextMilestone.weeks - prevWeeks)) * 100;
        const progressBar = document.getElementById('streak-progress-bar');
        const progressText = document.getElementById('streak-progress-text');
        if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
        if (progressText) progressText.textContent = `${currentStreak}/${nextMilestone.weeks}`;

        // Update check-in button
        const checkinBtn = document.getElementById('checkin-btn');
        if (checkinBtn) {
            if (hasCheckedInThisWeek(streakData)) {
                checkinBtn.innerHTML = '<span>✓</span> Ingecheckt!';
                checkinBtn.style.background = 'rgba(137,184,101,0.3)';
                checkinBtn.style.cursor = 'default';
            } else {
                checkinBtn.innerHTML = '<span>✓</span> CHECK IN DEZE WEEK';
                checkinBtn.style.background = 'linear-gradient(135deg, #89b865, #538731)';
                checkinBtn.style.cursor = 'pointer';
            }
        }
    }

    /**
     * Handle weekly check-in
     */
    handleCheckIn() {
        const streakData = Storage.get('streak') || {
            currentStreak: 0,
            longestStreak: 0,
            lastCheckIn: null,
            checkInHistory: [],
            milestonesClaimed: []
        };

        if (hasCheckedInThisWeek(streakData)) {
            showToast('Je hebt deze week al ingecheckt!', 'info');
            return;
        }

        // Check if streak should continue or reset
        const now = new Date();
        let newStreak = 1;

        if (streakData.lastCheckIn) {
            const lastCheckIn = new Date(streakData.lastCheckIn);
            const daysSinceLastCheckIn = Math.floor((now - lastCheckIn) / (1000 * 60 * 60 * 24));

            // If checked in within the last 14 days (allowing for missed week), continue streak
            if (daysSinceLastCheckIn <= 14) {
                newStreak = streakData.currentStreak + 1;
            }
        }

        // Update streak data
        streakData.currentStreak = newStreak;
        streakData.longestStreak = Math.max(streakData.longestStreak, newStreak);
        streakData.lastCheckIn = now.toISOString();
        streakData.checkInHistory.push(now.toISOString());

        Storage.set('streak', streakData);

        // Award check-in points
        addPoints('challenge_checkin', 5, 'Wekelijkse check-in');

        // Check for milestone achievements
        const milestone = streakMilestones.find(m =>
            m.weeks === newStreak && !streakData.milestonesClaimed.includes(m.weeks)
        );

        if (milestone) {
            streakData.milestonesClaimed.push(milestone.weeks);
            Storage.set('streak', streakData);
            addPoints('streak_milestone', milestone.points, `Streak milestone: ${milestone.badge}`);
            showToast(`${milestone.badge} badge behaald! +${milestone.points} punten`, 'success');
        }

        // Show animation
        this.showConfetti();
        this.showPointsAnimation(5);

        // Update display
        this.updateStreak();
    }

    /**
     * Update community milestone display
     */
    updateCommunityMilestone() {
        const stats = Storage.get('communityStats') || { totalPhotosShared: 847 };
        const posts = Storage.get('challengePosts') || [];
        stats.totalPhotosShared = Math.max(stats.totalPhotosShared, posts.length);

        // Find current milestone target
        const nextMilestone = communityMilestones.find(m => m.target > stats.totalPhotosShared) || communityMilestones[communityMilestones.length - 1];

        // Update display
        const currentEl = document.getElementById('community-current');
        const targetEl = document.getElementById('community-target');
        const goalEl = document.getElementById('community-goal');
        const progressBar = document.getElementById('community-progress-bar');

        if (currentEl) currentEl.textContent = stats.totalPhotosShared;
        if (targetEl) targetEl.textContent = nextMilestone.target;
        if (goalEl) goalEl.textContent = nextMilestone.target.toLocaleString('nl-NL');
        if (progressBar) {
            const progress = (stats.totalPhotosShared / nextMilestone.target) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }

        // User contribution
        const userPosts = posts.filter(p => p.userId === 'current_user').length;
        const contributionEl = document.getElementById('user-contribution');
        if (contributionEl) contributionEl.textContent = userPosts || 3;
    }

    /**
     * Update seasonal badges display
     */
    updateSeasonalBadges() {
        const year = new Date().getFullYear();
        const badges = Storage.get('seasonalBadges')?.[year] || {};
        const month = new Date().getMonth() + 1;

        // Update each badge
        Object.entries(seasonalBadges).forEach(([key, config]) => {
            const badgeId = `badge-${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/, '')}`.replace('warrior', 'winter').replace('starter', 'lente').replace('ster', 'zomer').replace('held', 'herfst');

            // Simplified badge IDs
            let elementId;
            if (key === 'winterWarrior') elementId = 'badge-winter';
            else if (key === 'lenteStarter') elementId = 'badge-lente';
            else if (key === 'zomerSter') elementId = 'badge-zomer';
            else if (key === 'herfstHeld') elementId = 'badge-herfst';

            const badgeEl = document.getElementById(elementId);
            if (badgeEl) {
                if (badges[key]) {
                    badgeEl.style.opacity = '1';
                    badgeEl.style.background = 'rgba(137,184,101,0.15)';
                    badgeEl.style.borderColor = 'rgba(137,184,101,0.3)';
                    badgeEl.querySelector('p:last-child').textContent = '✓ Verdiend!';
                    badgeEl.querySelector('p:last-child').style.color = '#89b865';
                }
            }
        });

        // Update FOMO timer
        this.updateSeasonalTimer();
    }

    /**
     * Update seasonal badge timer
     */
    updateSeasonalTimer() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const badges = Storage.get('seasonalBadges')?.[year] || {};

        let nextBadge = null;
        let daysLeft = 0;

        // Find next earnable badge
        if (!badges.lenteStarter && (month <= 4 || month >= 12)) {
            // Can still earn Lente Starter (ends April 30)
            nextBadge = 'Lente Starter';
            const endDate = new Date(year, 3, 30); // April 30
            if (month >= 12) endDate.setFullYear(year + 1);
            daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        } else if (!badges.zomerSter && month <= 8) {
            nextBadge = 'Zomer Ster';
            const endDate = new Date(year, 7, 31); // August 31
            daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        } else if (!badges.herfstHeld && month <= 10) {
            nextBadge = 'Herfst Held';
            const endDate = new Date(year, 9, 31); // October 31
            daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        } else if (!badges.winterWarrior) {
            nextBadge = 'Winter Warrior';
            const endDate = new Date(year + (month <= 1 ? 0 : 1), 0, 31); // January 31
            daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        }

        const timerEl = document.getElementById('seasonal-timer');
        const daysLeftEl = document.getElementById('seasonal-days-left');
        if (timerEl && nextBadge) {
            timerEl.style.display = 'block';
            timerEl.querySelector('span:last-child').innerHTML = `"${nextBadge}" nog <span id="seasonal-days-left">${daysLeft}</span> dagen!`;

            // Change color if less than 7 days
            if (daysLeft < 7) {
                timerEl.style.background = 'rgba(220, 53, 69, 0.15)';
                timerEl.style.borderColor = 'rgba(220, 53, 69, 0.3)';
                timerEl.querySelector('p').style.color = '#dc3545';
            }
        } else if (timerEl) {
            timerEl.style.display = 'none';
        }
    }

    /**
     * Check and award seasonal badge eligibility
     */
    checkSeasonalBadgeEligibility() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const badges = Storage.get('seasonalBadges') || {};

        if (!badges[year]) {
            badges[year] = {
                winterWarrior: false,
                lenteStarter: false,
                zomerSter: false,
                herfstHeld: false
            };
        }

        // Check Winter Warrior (login in Dec/Jan)
        if ((month === 12 || month === 1) && !badges[year].winterWarrior) {
            badges[year].winterWarrior = true;
            Storage.set('seasonalBadges', badges);
            addPoints('seasonal_badge', 30, 'Winter Warrior badge verdiend');
            showToast('Winter Warrior badge behaald! +30 punten', 'success');
            this.updateSeasonalBadges();
        }
    }

    /**
     * Switch feed tab
     */
    switchTab(tab) {
        this.currentTab = tab;

        // Update tab styles
        document.querySelectorAll('.feed-tab').forEach(t => {
            if (t.dataset.tab === tab) {
                t.classList.add('active');
                t.style.color = 'white';
                t.style.fontWeight = '600';
                t.style.borderBottomColor = '#f29f40';
            } else {
                t.classList.remove('active');
                t.style.color = 'rgba(255,255,255,0.6)';
                t.style.fontWeight = '500';
                t.style.borderBottomColor = 'transparent';
            }
        });

        this.renderFeed();
    }

    /**
     * Render the feed with posts
     */
    renderFeed() {
        const container = document.getElementById('feed-container');
        if (!container) return;

        let posts = Storage.get('challengePosts') || [];
        const userProfile = Storage.get(STORAGE_KEYS.USER_PROFILE) || {};
        const userCountry = userProfile.country || 'Nederland';

        // Filter and sort based on current tab
        switch (this.currentTab) {
            case 'nieuwste':
                posts = [...posts].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
                break;
            case 'populair':
                posts = [...posts].sort((a, b) => b.averageRating - a.averageRating);
                break;
            case 'regio':
                posts = posts.filter(p => p.userCountry === userCountry)
                    .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
                break;
        }

        const userRatings = Storage.get('userRatings') || {};
        const currentWeek = getWeekNumber(new Date());

        container.innerHTML = posts.map(post => this.renderPost(post, userRatings, currentWeek)).join('');

        // Add rating button listeners
        container.querySelectorAll('.rate-btn').forEach(btn => {
            btn.addEventListener('click', () => this.openRatingModal(btn.dataset.postId));
        });
    }

    /**
     * Render a single post
     */
    renderPost(post, userRatings, currentWeek) {
        const isChallenge = post.weeklyChallenge && post.challengeWeek === currentWeek;
        const hasRated = userRatings[post.id] !== undefined;
        const products = post.products.map(p => this.formatProductName(p)).join(', ');

        return `
            <div class="feed-post" style="background: rgba(255,255,255,0.08); backdrop-filter: blur(12px); border-radius: 1.25rem; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <!-- Post Header -->
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #89b865, #538731); display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; color: white;">
                        ${post.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style="flex: 1;">
                        <p style="font-size: 0.875rem; font-weight: 600; color: white; margin: 0;">${post.userName}</p>
                        <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 0.125rem 0 0; display: flex; align-items: center; gap: 0.375rem;">
                            <span>📍 ${post.userCity}, ${post.userCountry === 'Nederland' ? 'NL' : post.userCountry === 'België' ? 'BE' : post.userCountry}</span>
                            <span style="opacity: 0.5;">•</span>
                            <span>🕐 ${formatRelativeTime(post.postedAt)}</span>
                        </p>
                        ${isChallenge ? `<p style="font-size: 0.7rem; color: #f29f40; margin: 0.25rem 0 0; display: flex; align-items: center; gap: 0.25rem;"><span>🏆</span> Challenge deelnemer</p>` : ''}
                    </div>
                </div>

                <!-- Photo -->
                <div style="width: 100%; height: 200px; background: ${post.photoColor || '#4a7856'}; ${post.photo ? `background-image: url('${post.photo}'); background-size: cover; background-position: center;` : ''} display: flex; align-items: center; justify-content: center;">
                    ${!post.photo ? `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5z"></path><path d="M21 15l-5-5L5 21"></path><circle cx="8.5" cy="8.5" r="2.5"></circle></svg>` : ''}
                </div>

                <!-- Rating Display -->
                <div style="padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: #f29f40; font-size: 1rem;">${'★'.repeat(Math.round(post.averageRating))}${'☆'.repeat(5 - Math.round(post.averageRating))}</span>
                    <span style="font-size: 0.875rem; font-weight: 600; color: white;">${post.averageRating.toFixed(1)}</span>
                    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">(${post.ratings.length} beoordelingen)</span>
                </div>

                <!-- Details -->
                <div style="padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.375rem; border-top: 1px solid rgba(255,255,255,0.05);">
                    ${products ? `<p style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin: 0; display: flex; align-items: center; gap: 0.375rem;"><span>🏷️</span> Gebruikt: ${products}</p>` : ''}
                    <p style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin: 0; display: flex; align-items: center; gap: 0.375rem;"><span>✂️</span> Maait: ${post.mowFrequency}</p>
                    <p style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin: 0; display: flex; align-items: center; gap: 0.375rem;"><span>📏</span> Oppervlakte: ${post.gardenSize} m²</p>
                </div>

                <!-- Actions -->
                <div style="padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05);">
                    <button class="rate-btn" data-post-id="${post.id}" style="padding: 0.5rem 1rem; background: ${hasRated ? 'rgba(242,159,64,0.15)' : 'rgba(255,255,255,0.1)'}; border: 1px solid ${hasRated ? 'rgba(242,159,64,0.3)' : 'rgba(255,255,255,0.2)'}; border-radius: 0.5rem; color: ${hasRated ? '#f29f40' : 'white'}; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.375rem;">
                        <span>⭐</span> ${hasRated ? `Jouw score: ${userRatings[post.id]}` : 'Beoordeel'}
                    </button>
                    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 0.25rem;">
                        <span>💬</span> ${Math.floor(Math.random() * 5) + 1}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Format product name for display
     */
    formatProductName(product) {
        const names = {
            gazonmest: 'Gazonmest',
            najaarsmest: 'Najaarsmest',
            gazonkalk: 'Gazonkalk',
            graszaad: 'Graszaad',
            magnesium: 'Magnesium+',
            antimos: 'Anti-Mos',
            bodemactivator: 'Bodemactivator'
        };
        return names[product] || product;
    }

    /**
     * Render leaderboard
     */
    renderLeaderboard(filter = 'nl') {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        const data = leaderboardData[filter] || leaderboardData.all;
        const medals = ['🥇', '🥈', '🥉'];

        container.innerHTML = data.map((entry, index) => `
            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; ${index < 3 ? 'background: rgba(242,159,64,0.08);' : 'background: rgba(255,255,255,0.03);'} border-radius: 0.5rem;">
                <span style="font-size: ${index < 3 ? '1.25rem' : '0.875rem'}; width: 28px; text-align: center; ${index >= 3 ? 'color: rgba(255,255,255,0.5);' : ''}">${index < 3 ? medals[index] : `${entry.rank}.`}</span>
                <span style="font-size: 0.875rem; color: white; flex: 1;">${entry.name} - ${entry.city}</span>
                <span style="font-size: 0.875rem; color: #f29f40; font-weight: 600;">${entry.score.toFixed(1)} ⭐</span>
            </div>
        `).join('');
    }

    /**
     * Open upload modal
     */
    openUploadModal(forChallenge = false) {
        const modal = document.getElementById('upload-modal');
        const challengeCheckbox = document.getElementById('join-weekly-challenge');

        if (modal) {
            modal.style.display = 'flex';
            if (challengeCheckbox) challengeCheckbox.checked = forChallenge;
        }

        // Reset form
        this.uploadedPhoto = null;
        const previewImg = document.getElementById('modal-preview-image');
        const placeholder = document.getElementById('modal-upload-placeholder');
        if (previewImg) previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
    }

    /**
     * Close upload modal
     */
    closeUploadModal() {
        const modal = document.getElementById('upload-modal');
        if (modal) modal.style.display = 'none';
        this.uploadedPhoto = null;
    }

    /**
     * Handle photo upload
     */
    async handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file);
            const reader = new FileReader();

            reader.onload = (event) => {
                this.uploadedPhoto = event.target.result;

                const previewImg = document.getElementById('modal-preview-image');
                const placeholder = document.getElementById('modal-upload-placeholder');

                if (previewImg) {
                    previewImg.src = this.uploadedPhoto;
                    previewImg.style.display = 'block';
                }
                if (placeholder) placeholder.style.display = 'none';
            };

            reader.readAsDataURL(compressed);
        } catch (error) {
            console.error('Error uploading photo:', error);
            showToast('Fout bij uploaden foto', 'error');
        }
    }

    /**
     * Submit a new post
     */
    submitPost() {
        // Get form values
        const isChallenge = document.getElementById('join-weekly-challenge')?.checked;
        const mowFrequency = document.getElementById('mow-frequency')?.value;
        const gardenSize = document.getElementById('garden-size')?.value;
        const verticulated = document.querySelector('input[name="verticulated"]:checked')?.value === 'yes';

        // Get selected products
        const products = [];
        document.querySelectorAll('input[name="product"]:checked').forEach(cb => {
            products.push(cb.value);
        });

        // Validation
        if (!this.uploadedPhoto) {
            showToast('Upload eerst een foto', 'error');
            return;
        }

        // Get user profile
        const userProfile = Storage.get(STORAGE_KEYS.USER_PROFILE) || {};

        // Create post
        const post = {
            id: generateId(),
            userId: 'current_user',
            userName: userProfile.name || 'Jij',
            userCity: userProfile.city || 'Onbekend',
            userCountry: userProfile.country || 'Nederland',
            userAvatar: null,
            photo: this.uploadedPhoto,
            photoColor: '#4a7856',
            products: products,
            mowFrequency: mowFrequency || '1x per week',
            verticulated: verticulated,
            gardenSize: parseInt(gardenSize) || 100,
            ratings: [],
            averageRating: 0,
            postedAt: new Date().toISOString(),
            weeklyChallenge: isChallenge,
            challengeWeek: isChallenge ? getWeekNumber(new Date()) : null
        };

        // Save post
        const posts = Storage.get('challengePosts') || [];
        posts.unshift(post);
        Storage.set('challengePosts', posts);

        // Update community stats
        const stats = Storage.get('communityStats') || { totalPhotosShared: 847 };
        stats.totalPhotosShared++;
        Storage.set('communityStats', stats);

        // Award points
        const basePoints = 25;
        const bonusPoints = isChallenge ? 10 : 0;
        const totalPoints = basePoints + bonusPoints;

        addPoints('share_photo', totalPoints, isChallenge ? 'Foto gedeeld + Challenge deelname' : 'Foto gedeeld');

        // Check for Lente Starter badge
        const month = new Date().getMonth() + 1;
        if (month === 3 || month === 4) {
            const year = new Date().getFullYear();
            const badges = Storage.get('seasonalBadges') || {};
            if (!badges[year]?.lenteStarter) {
                if (!badges[year]) badges[year] = {};
                badges[year].lenteStarter = true;
                Storage.set('seasonalBadges', badges);
                addPoints('seasonal_badge', 30, 'Lente Starter badge verdiend');
                showToast('Lente Starter badge behaald! +30 punten', 'success');
            }
        }

        // Close modal and show animation
        this.closeUploadModal();
        this.showConfetti();
        this.showPointsAnimation(totalPoints);

        // Refresh displays
        this.renderFeed();
        this.updateWeeklyChallenge();
        this.updateCommunityMilestone();
        this.updateSeasonalBadges();

        showToast('Je gazon is gedeeld!', 'success');
    }

    /**
     * Open rating modal
     */
    openRatingModal(postId) {
        const userRatings = Storage.get('userRatings') || {};
        if (userRatings[postId]) {
            showToast('Je hebt deze post al beoordeeld', 'info');
            return;
        }

        this.ratingPostId = postId;
        this.selectedRating = 0;
        this.updateRatingStars(0);

        const modal = document.getElementById('rating-modal');
        const submitBtn = document.getElementById('submit-rating-btn');

        if (modal) modal.style.display = 'flex';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
    }

    /**
     * Close rating modal
     */
    closeRatingModal() {
        const modal = document.getElementById('rating-modal');
        if (modal) modal.style.display = 'none';
        this.ratingPostId = null;
        this.selectedRating = 0;
    }

    /**
     * Select a rating
     */
    selectRating(rating) {
        this.selectedRating = rating;
        this.updateRatingStars(rating);

        const submitBtn = document.getElementById('submit-rating-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }

    /**
     * Hover rating preview
     */
    hoverRating(rating) {
        this.updateRatingStars(rating);
    }

    /**
     * Update rating stars display
     */
    updateRatingStars(rating) {
        document.querySelectorAll('.star-btn').forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#f29f40';
                star.style.transform = 'scale(1.1)';
            } else {
                star.style.color = 'rgba(255,255,255,0.3)';
                star.style.transform = 'scale(1)';
            }
        });
    }

    /**
     * Submit rating
     */
    submitRating() {
        if (!this.ratingPostId || !this.selectedRating) return;

        // Save user rating
        const userRatings = Storage.get('userRatings') || {};
        userRatings[this.ratingPostId] = this.selectedRating;
        Storage.set('userRatings', userRatings);

        // Update post
        const posts = Storage.get('challengePosts') || [];
        const post = posts.find(p => p.id === this.ratingPostId);
        if (post) {
            post.ratings.push(this.selectedRating);
            post.averageRating = post.ratings.reduce((a, b) => a + b, 0) / post.ratings.length;
            Storage.set('challengePosts', posts);

            // Check if post owner should get Zomer Ster badge
            if (this.selectedRating === 5) {
                const month = new Date().getMonth() + 1;
                if (month >= 6 && month <= 8) {
                    // In real app, this would notify the post owner
                }
            }
        }

        // Award points for rating
        addPoints('rate_post', 2, 'Gazon beoordeeld');

        // Close modal and refresh
        this.closeRatingModal();
        this.showPointsAnimation(2);
        this.renderFeed();

        showToast('Beoordeling opgeslagen! +2 punten', 'success');
    }

    /**
     * Show confetti animation
     */
    showConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;

        const colors = ['#89b865', '#f29f40', '#538731', '#e08830', '#ffffff'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
            `;
            container.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }

        // Add confetti animation if not exists
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confetti-fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Show points animation
     */
    showPointsAnimation(points) {
        const overlay = document.getElementById('points-animation');
        const amountEl = document.getElementById('points-amount');

        if (overlay && amountEl) {
            amountEl.textContent = `+${points}`;
            overlay.style.display = 'flex';

            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1500);
        }
    }
}

// Create and export singleton instance
const challenge = new Challenge();
export default challenge;
