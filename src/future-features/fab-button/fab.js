(function() {
    'use strict';

    // Wacht tot DOM geladen is
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFab);
    } else {
        initFab();
    }

    function initFab() {
        // Check of FAB elementen bestaan
        const fabButton = document.getElementById('fab-button');
        const fabMenu = document.getElementById('fab-menu');
        const fabOverlay = document.getElementById('fab-overlay');

        if (!fabButton || !fabMenu || !fabOverlay) {
            console.log('FAB elementen niet gevonden op deze pagina');
            return;
        }

        // Toggle FAB menu
        fabButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleFab();
        });

        // Sluit bij klik op overlay
        fabOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            closeFab();
        });

        // Menu item clicks
        const menuItems = document.querySelectorAll('.fab-menu-item');
        menuItems.forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.getAttribute('data-action');
                handleFabAction(action);
            });
        });
    }

    function toggleFab() {
        const fabButton = document.getElementById('fab-button');
        const fabMenu = document.getElementById('fab-menu');
        const fabOverlay = document.getElementById('fab-overlay');

        const isOpen = fabButton.classList.contains('open');

        if (isOpen) {
            closeFab();
        } else {
            fabButton.classList.add('open');
            fabMenu.classList.add('open');
            fabOverlay.classList.add('open');
        }
    }

    function closeFab() {
        const fabButton = document.getElementById('fab-button');
        const fabMenu = document.getElementById('fab-menu');
        const fabOverlay = document.getElementById('fab-overlay');

        if (fabButton) fabButton.classList.remove('open');
        if (fabMenu) fabMenu.classList.remove('open');
        if (fabOverlay) fabOverlay.classList.remove('open');
    }

    function handleFabAction(action) {
        closeFab();

        // Navigate via router (click nav buttons) - SPA architecture
        switch(action) {
            case 'gazon-ai':
                const photoNavBtn = document.querySelector('[data-page="photo-analysis"]');
                if (photoNavBtn) photoNavBtn.click();
                break;
            case 'challenge':
                const challengeNavBtn = document.querySelector('[data-page="challenge"]');
                if (challengeNavBtn) challengeNavBtn.click();
                break;
            case 'scanner':
                alert('Barcode Scanner komt binnenkort!');
                break;
        }
    }
})();
