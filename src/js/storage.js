/**
 * Local Storage Helper Module
 * Provides methods for storing and retrieving data from localStorage
 */

const STORAGE_KEYS = {
    USER_DATA: 'gazon_user_data',
    LOYALTY_POINTS: 'gazon_loyalty_points',
    PHOTO_ANALYSES: 'gazon_photo_analyses',
    FERTILIZER_SCHEDULES: 'gazon_fertilizer_schedules',
    ACTIVITY_HISTORY: 'gazon_activity_history',
    AUTH_TOKEN: 'gazon_auth_token'
};

class Storage {
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     */
    static set(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Retrieve data from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Retrieved data or default value
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    /**
     * Clear all app data from localStorage
     */
    static clear() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Check if a key exists in localStorage
     * @param {string} key - Storage key
     * @returns {boolean}
     */
    static has(key) {
        return localStorage.getItem(key) !== null;
    }
}

export { Storage, STORAGE_KEYS };
