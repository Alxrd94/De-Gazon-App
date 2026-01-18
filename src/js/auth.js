/**
 * Authentication Module
 * Handles user authentication (mock implementation for demo)
 */

import { Storage, STORAGE_KEYS } from './storage.js';
import { generateId } from './utils.js';

class Auth {
    constructor() {
        this.user = null;
        this.loadUser();
    }

    /**
     * Mock Google login
     * @returns {Promise<Object>} User object
     */
    async loginWithGoogle() {
        // Simulate API delay
        await this.delay(1000);

        // Create mock user
        const user = {
            id: generateId(),
            name: 'Demo Gebruiker',
            email: 'demo@gazonapp.nl',
            picture: './src/assets/icons/icon-192x192.png',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Save user data
        this.user = user;
        Storage.set(STORAGE_KEYS.USER_DATA, user);
        Storage.set(STORAGE_KEYS.AUTH_TOKEN, `mock_token_${user.id}`);

        return user;
    }

    /**
     * Logout user
     */
    logout() {
        this.user = null;
        Storage.remove(STORAGE_KEYS.USER_DATA);
        Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return this.user !== null && Storage.has(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Get current user
     * @returns {Object|null} User object or null
     */
    getUser() {
        return this.user;
    }

    /**
     * Load user from storage
     */
    loadUser() {
        const userData = Storage.get(STORAGE_KEYS.USER_DATA);
        const token = Storage.get(STORAGE_KEYS.AUTH_TOKEN);

        if (userData && token) {
            this.user = userData;
        }
    }

    /**
     * Initialize welcome bonus for new users
     */
    initializeWelcomeBonus() {
        const loyaltyPoints = Storage.get(STORAGE_KEYS.LOYALTY_POINTS);

        if (!loyaltyPoints) {
            // New user - give welcome bonus
            const initialPoints = {
                total: 25,
                history: [
                    {
                        id: generateId(),
                        type: 'welcome_bonus',
                        points: 25,
                        description: 'Welkomstbonus',
                        date: new Date().toISOString()
                    }
                ]
            };
            Storage.set(STORAGE_KEYS.LOYALTY_POINTS, initialPoints);
        }
    }

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create and export singleton instance
const auth = new Auth();
export default auth;
