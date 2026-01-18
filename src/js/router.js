/**
 * Router Module
 * Handles client-side routing and page navigation
 */

class Router {
    constructor() {
        this.routes = new Map();
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
     * Navigate to a page
     * @param {string} name - Route name
     */
    async navigate(name) {
        const route = this.routes.get(name);
        if (!route) {
            console.error(`Route "${name}" not found`);
            return;
        }

        try {
            // Fetch the HTML content
            const response = await fetch(route.path);
            if (!response.ok) {
                throw new Error(`Failed to load page: ${response.statusText}`);
            }

            const html = await response.text();

            // Update the app container
            this.appContainer.innerHTML = html;

            // Update current page
            this.currentPage = name;

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
            <div class="error-page">
                <h1>Oeps!</h1>
                <p>${message}</p>
                <button class="btn-primary" onclick="location.reload()">Opnieuw laden</button>
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
        });

        // Add active class to current nav item
        const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }
}

// Create and export singleton instance
const router = new Router();
export default router;
