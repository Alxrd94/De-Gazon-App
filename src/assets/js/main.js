/* ==========================================
   DE GAZON APP - MAIN JAVASCRIPT
   ========================================== */

(function() {
    'use strict';

    /* ------------------------------------------
       INITIALIZATION
    ------------------------------------------ */

    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initToast();
        loadUserData();
    });

    /* ------------------------------------------
       NAVIGATION
    ------------------------------------------ */

    function initNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'home.html';
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(function(item) {
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage.replace('.html', ''))) {
                item.classList.add('active');
            }
        });

        // Update calendar icon with current day
        updateCalendarDate();
    }

    function updateCalendarDate() {
        const calendarDays = document.querySelectorAll('.calendar-day');
        const today = new Date().getDate();
        calendarDays.forEach(function(el) {
            el.textContent = today;
        });
    }

    /* ------------------------------------------
       USER DATA & LOCALSTORAGE
    ------------------------------------------ */

    window.GazonApp = window.GazonApp || {};

    GazonApp.getUserData = function() {
        const data = localStorage.getItem('gazonAppUser');
        return data ? JSON.parse(data) : getDefaultUserData();
    };

    GazonApp.saveUserData = function(data) {
        localStorage.setItem('gazonAppUser', JSON.stringify(data));
    };

    function getDefaultUserData() {
        return {
            profile: {
                name: 'Gazon Gebruiker',
                email: '',
                city: '',
                country: 'Nederland'
            },
            garden: {
                size: 100,
                grassType: 'Speelgazon',
                soilType: 'Aarde'
            },
            points: {
                total: 0
            },
            settings: {
                pushNotifications: false
            },
            memberSince: new Date().toISOString()
        };
    }

    function loadUserData() {
        const data = GazonApp.getUserData();

        // Update name where needed
        const nameElements = document.querySelectorAll('[data-user-name]');
        nameElements.forEach(function(el) {
            el.textContent = data.profile.name;
        });

        // Update points where needed
        const pointsElements = document.querySelectorAll('[data-user-points]');
        pointsElements.forEach(function(el) {
            el.textContent = data.points.total;
        });
    }

    /* ------------------------------------------
       POINTS SYSTEM (SIMPLE)
    ------------------------------------------ */

    GazonApp.addPoints = function(amount, reason) {
        const data = GazonApp.getUserData();
        data.points.total += amount;
        GazonApp.saveUserData(data);

        // Update UI
        const pointsElements = document.querySelectorAll('[data-user-points]');
        pointsElements.forEach(function(el) {
            el.textContent = data.points.total;
        });

        // Show toast
        if (reason) {
            GazonApp.showToast('+' + amount + ' punten: ' + reason, 'success');
        }

        return data.points.total;
    };

    GazonApp.getPoints = function() {
        return GazonApp.getUserData().points.total;
    };

    GazonApp.getRank = function() {
        const points = GazonApp.getPoints();

        if (points >= 1000) return { name: 'Gazon Legende', icon: '👑', next: null, needed: 0 };
        if (points >= 500) return { name: 'Gazon Meester', icon: '🏆', next: 'Gazon Legende', needed: 1000 - points };
        if (points >= 250) return { name: 'Gazon Kenner', icon: '🌳', next: 'Gazon Meester', needed: 500 - points };
        if (points >= 100) return { name: 'Groene Duim', icon: '🌿', next: 'Gazon Kenner', needed: 250 - points };
        return { name: 'Gazon Starter', icon: '🌱', next: 'Groene Duim', needed: 100 - points };
    };

    GazonApp.getProgressPercent = function() {
        const points = GazonApp.getPoints();
        let progressPercent = 0;

        if (points < 100) {
            progressPercent = (points / 100) * 100;
        } else if (points < 250) {
            progressPercent = ((points - 100) / 150) * 100;
        } else if (points < 500) {
            progressPercent = ((points - 250) / 250) * 100;
        } else if (points < 1000) {
            progressPercent = ((points - 500) / 500) * 100;
        } else {
            progressPercent = 100;
        }

        return Math.min(100, Math.max(0, progressPercent));
    };

    /* ------------------------------------------
       TOAST NOTIFICATIONS
    ------------------------------------------ */

    let toastElement = null;
    let toastTimeout = null;

    function initToast() {
        // Create toast element if not exists
        if (!document.getElementById('app-toast')) {
            const toast = document.createElement('div');
            toast.id = 'app-toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toastElement = document.getElementById('app-toast');
    }

    GazonApp.showToast = function(message, type) {
        if (!toastElement) initToast();

        // Clear previous timeout
        if (toastTimeout) clearTimeout(toastTimeout);

        // Set content and type
        toastElement.textContent = message;
        toastElement.className = 'toast ' + (type || '');

        // Show
        setTimeout(function() {
            toastElement.classList.add('show');
        }, 10);

        // Hide after 3 seconds
        toastTimeout = setTimeout(function() {
            toastElement.classList.remove('show');
        }, 3000);
    };

    /* ------------------------------------------
       UTILITIES
    ------------------------------------------ */

    GazonApp.formatDate = function(date) {
        const d = new Date(date);
        return d.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    GazonApp.formatDateShort = function(date) {
        const d = new Date(date);
        return d.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short'
        });
    };

    GazonApp.addDays = function(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

})();
