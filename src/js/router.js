/**
 * Router Module
 * Handles client-side routing and page navigation with caching
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.pageCache = new Map(); // Cache for loaded pages
        this.currentPage = null;
        this.appContainer = document.getElementById('app');
    }

    /**
     * Register a route
     * @param {string} name - Route name
     * @param {string} path - HTML file path
     * @param {Function} onLoad - Callback to execute when page loads
     */
    register(name, path, onLoad = null) {
        this.routes.set(name, { path, onLoad });
    }

    /**
     * Navigate to a page with caching
     * @param {string} name - Route name
     */
    async navigate(name) {
        const route = this.routes.get(name);
        if (!route) {
            console.error(`Route "${name}" not found`);
            return;
        }

        try {
            let html;

            // Check cache first
            if (this.pageCache.has(name)) {
                html = this.pageCache.get(name);
            } else {
                // Fetch page (with version for initial load)
                const response = await fetch(route.path + '?v=3');
                if (!response.ok) {
                    throw new Error(`Failed to load page: ${response.statusText}`);
                }
                html = await response.text();
                // Cache the page
                this.pageCache.set(name, html);
            }

            // Update the app container immediately
            this.appContainer.innerHTML = html;

            // Update current page
            this.currentPage = name;

            // Update calendar date in navigation
            this.updateCalendarDate();

            // Execute onLoad callback if provided
            if (route.onLoad && typeof route.onLoad === 'function') {
                route.onLoad();
            }

            // Scroll to top
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error navigating to page:', error);
            this.showError('Fout bij het laden van de pagina');
        }
    }

    /**
     * Update calendar date in navigation
     */
    updateCalendarDate() {
        const calendarDates = document.querySelectorAll('.calendar-date');
        const today = new Date().getDate();
        calendarDates.forEach(el => {
            el.textContent = today;
        });
    }

    /**
     * Clear page cache (useful for development or when content updates)
     */
    clearCache() {
        this.pageCache.clear();
    }

    /**
     * Get current page name
     * @returns {string} Current page name
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.appContainer.innerHTML = `
            <div class="error-page" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #2e463b; color: white; text-align: center; padding: 2rem;">
                <h1 style="font-size: 2rem; margin-bottom: 1rem;">Oeps!</h1>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">${message}</p>
                <button style="padding: 0.875rem 2rem; background: #89b865; border: none; border-radius: 0.75rem; color: white; font-weight: 600; cursor: pointer;" onclick="location.reload()">Opnieuw laden</button>
            </div>
        `;
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigation() {
        // Delegate click events for navigation
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const page = navItem.dataset.page;
                if (page) {
                    this.navigate(page);
                    this.updateActiveNav(page);
                }
            }

            // Handle feature cards
            const featureCard = e.target.closest('.feature-card');
            if (featureCard) {
                const cardId = featureCard.id;
                const pageMap = {
                    'photo-analysis-card': 'photo-analysis',
                    'fertilizer-planner-card': 'fertilizer-planner',
                    'loyalty-card': 'loyalty'
                };
                const page = pageMap[cardId];
                if (page) {
                    this.navigate(page);
                }
            }

            // Handle back buttons
            const backBtn = e.target.closest('.back-btn');
            if (backBtn) {
                this.navigate('home');
            }

            // Handle view points button
            const viewPointsBtn = e.target.closest('#view-points-btn');
            if (viewPointsBtn) {
                this.navigate('loyalty');
            }
        });
    }

    /**
     * Update active navigation item
     * @param {string} pageName - Page name to mark as active
     */
    updateActiveNav(pageName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            // Reset all icons and labels to inactive color
            const svg = item.querySelector('svg');
            const label = item.querySelector('span:last-child');
            if (svg) svg.setAttribute('stroke', 'rgba(255,255,255,0.6)');
            if (label) label.style.color = 'rgba(255,255,255,0.6)';
        });

        // Add active class and styling to current nav item
        const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
            const svg = activeNav.querySelector('svg');
            const label = activeNav.querySelector('span:last-child');
            if (svg) svg.setAttribute('stroke', '#f29f40');
            if (label) label.style.color = '#f29f40';
        }
    }
}

// Create and export singleton instance
const router = new Router();
export default router;
