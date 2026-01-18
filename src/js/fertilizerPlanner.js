/**
 * Fertilizer Planner Module
 * Handles fertilization schedule planning and calendar export
 */

import { Storage, STORAGE_KEYS } from './storage.js';
import { generateId, downloadCalendar, formatDateShort, showToast, calculatePoints } from './utils.js';
import { addPoints } from './loyalty.js';

class FertilizerPlanner {
    constructor() {
        this.config = {
            lawnSize: 100,
            grassType: 'utility',
            soilType: 'loam'
        };
        this.selectedProducts = new Set(['spring-fertilizer', 'summer-fertilizer', 'autumn-fertilizer']);
        this.schedule = null;
    }

    /**
     * Initialize fertilizer planner page
     */
    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.updateSelectedProducts();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Configuration inputs
        const lawnSize = document.getElementById('lawn-size');
        const grassType = document.getElementById('grass-type');
        const soilType = document.getElementById('soil-type');

        if (lawnSize) {
            lawnSize.addEventListener('change', (e) => {
                this.config.lawnSize = parseInt(e.target.value) || 100;
                this.saveConfig();
            });
        }

        if (grassType) {
            grassType.addEventListener('change', (e) => {
                this.config.grassType = e.target.value;
                this.saveConfig();
            });
        }

        if (soilType) {
            soilType.addEventListener('change', (e) => {
                this.config.soilType = e.target.value;
                this.saveConfig();
            });
        }

        // Product checkboxes
        const productCheckboxes = document.querySelectorAll('.product-item input[type="checkbox"]');
        productCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedProducts.add(e.target.value);
                } else {
                    this.selectedProducts.delete(e.target.value);
                }
            });
        });

        // Generate schedule button
        const generateBtn = document.getElementById('generate-schedule-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateSchedule());
        }

        // Export calendar button
        const exportBtn = document.getElementById('export-calendar-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCalendar());
        }

        // Back button
        const backBtn = document.getElementById('back-to-home-planner');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'home' } }));
            });
        }
    }

    /**
     * Load configuration from storage
     */
    loadConfig() {
        const saved = Storage.get('fertilizer_config');
        if (saved) {
            this.config = { ...this.config, ...saved };

            // Update form values
            const lawnSize = document.getElementById('lawn-size');
            const grassType = document.getElementById('grass-type');
            const soilType = document.getElementById('soil-type');

            if (lawnSize) lawnSize.value = this.config.lawnSize;
            if (grassType) grassType.value = this.config.grassType;
            if (soilType) soilType.value = this.config.soilType;
        }
    }

    /**
     * Save configuration to storage
     */
    saveConfig() {
        Storage.set('fertilizer_config', this.config);
    }

    /**
     * Update selected products based on checkboxes
     */
    updateSelectedProducts() {
        const checkboxes = document.querySelectorAll('.product-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                this.selectedProducts.add(checkbox.value);
            }
        });
    }

    /**
     * Generate fertilization schedule
     */
    generateSchedule() {
        const timeline = document.getElementById('schedule-timeline');
        const exportBtn = document.getElementById('export-calendar-btn');
        const scheduleDetails = document.getElementById('schedule-details');

        if (!timeline) return;

        // Generate schedule based on selected products
        const events = this.createScheduleEvents();
        this.schedule = events;

        // Calculate costs
        const totalCost = this.calculateCosts(events);

        // Display timeline
        timeline.innerHTML = events.map(event => `
            <div class="timeline-item">
                <div class="timeline-date">
                    <div>${event.date.getDate()}</div>
                    <div style="font-size: 0.75rem;">${formatDateShort(event.date).split(' ')[1]}</div>
                </div>
                <div class="timeline-content">
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                </div>
            </div>
        `).join('');

        // Show export button and details
        if (exportBtn) exportBtn.classList.remove('hidden');
        if (scheduleDetails) {
            scheduleDetails.classList.remove('hidden');
            document.getElementById('calc-size').textContent = this.config.lawnSize;
            document.getElementById('calc-treatments').textContent = events.length;
            document.getElementById('calc-cost').textContent = totalCost.toFixed(2);
        }

        showToast('Schema gegenereerd', 'success');

        // Save schedule
        this.saveSchedule(events);

        // Award points
        const points = calculatePoints('schedule_created');
        addPoints('schedule_created', points, 'Bemestingsschema gemaakt');
    }

    /**
     * Create schedule events based on selected products
     * @returns {Array} Schedule events
     */
    createScheduleEvents() {
        const events = [];
        const currentYear = new Date().getFullYear();

        const productSchedules = {
            'spring-fertilizer': {
                title: 'Voorjaarsbemesting',
                description: 'NPK 15-5-8 toepassen voor sterke groei',
                month: 3, // April
                day: 1
            },
            'summer-fertilizer': {
                title: 'Zomerbemesting',
                description: 'NPK 10-5-15 met langzame afgifte',
                month: 5, // June
                day: 15
            },
            'autumn-fertilizer': {
                title: 'Herfstbemesting',
                description: 'NPK 5-5-20 voor winterhardheid',
                month: 9, // October
                day: 1
            },
            'moss-control': {
                title: 'Mosbestrijding',
                description: 'IJzersulfaat toepassen',
                month: 2, // March
                day: 15
            },
            'scarification': {
                title: 'Verticuteren',
                description: 'Vilt en mos verwijderen',
                month: 3, // April
                day: 15
            }
        };

        this.selectedProducts.forEach(product => {
            const schedule = productSchedules[product];
            if (schedule) {
                const date = new Date(currentYear, schedule.month, schedule.day);
                // If date has passed, schedule for next year
                if (date < new Date()) {
                    date.setFullYear(currentYear + 1);
                }
                events.push({
                    id: generateId(),
                    productId: product,
                    title: schedule.title,
                    description: schedule.description,
                    date: date
                });
            }
        });

        // Sort by date
        events.sort((a, b) => a.date - b.date);

        return events;
    }

    /**
     * Calculate total costs
     * @param {Array} events - Schedule events
     * @returns {number} Total cost
     */
    calculateCosts(events) {
        const productPrices = {
            'spring-fertilizer': 0.20, // per m²
            'summer-fertilizer': 0.18,
            'autumn-fertilizer': 0.22,
            'moss-control': 0.15,
            'scarification': 0.50
        };

        let total = 0;
        events.forEach(event => {
            const pricePerM2 = productPrices[event.productId] || 0;
            total += pricePerM2 * this.config.lawnSize;
        });

        return total;
    }

    /**
     * Export schedule to calendar
     */
    exportToCalendar() {
        if (!this.schedule || this.schedule.length === 0) {
            showToast('Genereer eerst een schema', 'error');
            return;
        }

        try {
            downloadCalendar(this.schedule);
            showToast('Schema geëxporteerd naar kalender', 'success');
        } catch (error) {
            console.error('Error exporting calendar:', error);
            showToast('Fout bij exporteren', 'error');
        }
    }

    /**
     * Save schedule to storage
     * @param {Array} events - Schedule events
     */
    saveSchedule(events) {
        const schedules = Storage.get(STORAGE_KEYS.FERTILIZER_SCHEDULES, []);

        const newSchedule = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            config: this.config,
            events: events.map(e => ({
                ...e,
                date: e.date.toISOString()
            }))
        };

        schedules.unshift(newSchedule);

        // Keep only last 5 schedules
        if (schedules.length > 5) {
            schedules.pop();
        }

        Storage.set(STORAGE_KEYS.FERTILIZER_SCHEDULES, schedules);
    }
}

// Create and export singleton instance
const fertilizerPlanner = new FertilizerPlanner();
export default fertilizerPlanner;
