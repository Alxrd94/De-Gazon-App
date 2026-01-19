/**
 * Fertilizer Planner Module
 * Smart scheduling with product dependencies
 */

class FertilizerPlanner {
    constructor() {
        this.selectedProducts = [];
        this.currentSchema = [];
        this.currentSeason = null;

        // Product rules and data (no emojis)
        this.productRules = {
            gazonkalk: {
                id: 'gazonkalk',
                naam: "Gazonkalk",
                beschrijving: "Optimale bodemstructuur",
                kleur: "#5BA4A4"
            },
            magnesiumPlus: {
                id: 'magnesiumPlus',
                naam: "Magnesium+",
                beschrijving: "Intense groene kleur",
                kleur: "#F29F40",
                maanden: [2, 3, 4, 5, 6, 7, 8, 9, 10]
            },
            antiMos: {
                id: 'antiMos',
                naam: "Anti-Mos",
                beschrijving: "Mosbestrijding",
                kleur: "#5B7FC4",
                maanden: [2, 3, 4, 5, 6, 9, 10, 11]
            },
            graszaad: {
                id: 'graszaad',
                naam: "Graszaad",
                beschrijving: "Herstel kale plekken",
                kleur: "#9B59B6",
                maanden: [3, 4, 5, 6, 9, 10]
            },
            gazonmest: {
                id: 'gazonmest',
                naam: "Gazonmest",
                beschrijving: "Sterke groei voorjaar/zomer (2x per jaar)",
                kleur: "#89b865",
                maanden: [3, 4, 5, 6, 7, 8],
                frequentie: 2,
                werkingsduur: 100,
                minDatum: { maand: 3, dag: 15 } // Not before March 15
            },
            najaarsmest: {
                id: 'najaarsmest',
                naam: "Najaarsmest",
                beschrijving: "Winterweerstand (1x per jaar)",
                kleur: "#89b865",
                maanden: [9, 10, 11, 12]
            },
            bodemactivator: {
                id: 'bodemactivator',
                naam: "Bodemactivator",
                beschrijving: "Bodemverbetering (zandgrond)",
                kleur: "#C45B7F",
                maanden: [2, 3, 4, 5, 8, 9, 10, 11]
            },
            startmest: {
                id: 'startmest',
                naam: "Startmest",
                beschrijving: "Bij nieuw gazon",
                kleur: "#89b865",
                maanden: [3, 4, 5, 6, 7, 8, 9, 10, 11],
                minDatum: { maand: 3, dag: 15 } // Not before March 15
            }
        };
    }

    /**
     * Initialize the planner page
     */
    init() {
        console.log('Initializing Bemestingskalender...');
        this.renderProducts();
        this.setDefaultDate();
        this.loadSavedSchema();
        this.setupEventListeners();
        this.updateCalendarIcon();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Generate button
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateSchema());
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCalendar());
        }

        // Edit schema link
        const editLink = document.getElementById('edit-schema-link');
        if (editLink) {
            editLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetToEditMode();
            });
        }

        // "Ik heb al producten" option - scroll to product selection
        const haveProductsOption = document.getElementById('option-have-products');
        if (haveProductsOption) {
            haveProductsOption.addEventListener('click', () => {
                const productSection = document.getElementById('product-selection-section');
                if (productSection) {
                    productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }

    /**
     * Update calendar icon with current date
     */
    updateCalendarIcon() {
        const calendarIcon = document.getElementById('calendar-date');
        if (calendarIcon) {
            calendarIcon.textContent = new Date().getDate();
        }
    }

    /**
     * Render product checkboxes with prominent colors
     */
    renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.innerHTML = '';

        Object.values(this.productRules).forEach(product => {
            const isChecked = this.selectedProducts.includes(product.id);
            const productDiv = document.createElement('div');
            productDiv.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.875rem;
                padding-left: 0;
                background: rgba(255,255,255,0.05);
                border-radius: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
                overflow: hidden;
            `;
            productDiv.addEventListener('click', () => this.toggleProduct(product.id));

            productDiv.innerHTML = `
                <div style="width: 6px; height: 100%; min-height: 50px; background: ${product.kleur}; border-radius: 0 4px 4px 0;"></div>
                <div id="check-${product.id}" style="width: 24px; height: 24px; border-radius: 6px; border: 2px solid ${isChecked ? product.kleur : 'rgba(255,255,255,0.3)'}; background: ${isChecked ? product.kleur : 'transparent'}; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;">
                    ${isChecked ? '<span style="color: white; font-size: 14px;">✓</span>' : ''}
                </div>
                <div style="flex: 1;">
                    <span style="font-weight: 600; color: white;">${product.naam}</span>
                    <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 0.25rem 0 0;">${product.beschrijving}</p>
                </div>
                <div style="width: 20px; height: 20px; border-radius: 50%; background: ${product.kleur}; flex-shrink: 0; margin-right: 0.5rem;"></div>
            `;

            container.appendChild(productDiv);
        });
    }

    /**
     * Toggle product selection
     */
    toggleProduct(productId) {
        const index = this.selectedProducts.indexOf(productId);
        if (index > -1) {
            this.selectedProducts.splice(index, 1);
        } else {
            this.selectedProducts.push(productId);
        }
        this.renderProducts();

        // Reset to edit mode
        this.resetToEditMode();
    }

    /**
     * Reset UI to edit mode (show generate button, hide export)
     */
    resetToEditMode() {
        const schemaSection = document.getElementById('schema-section');
        const generateBtn = document.getElementById('generate-btn');
        const exportSection = document.getElementById('export-section');

        if (schemaSection) schemaSection.style.display = 'none';
        if (generateBtn) generateBtn.style.display = 'flex';
        if (exportSection) exportSection.style.display = 'none';
    }

    /**
     * Set default date to today
     */
    setDefaultDate() {
        const dateInput = document.getElementById('start-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    /**
     * Load saved schema from localStorage
     */
    loadSavedSchema() {
        const saved = localStorage.getItem('gazonPakket');
        if (saved) {
            try {
                const pakket = JSON.parse(saved);
                this.selectedProducts = pakket.producten || [];
                const dateInput = document.getElementById('start-date');
                if (pakket.startDatum && dateInput) {
                    dateInput.value = pakket.startDatum;
                }
                this.renderProducts();
            } catch (e) {
                console.error('Error loading saved schema:', e);
            }
        }
    }

    /**
     * Calculate season string from start date
     */
    calculateSeason(startDate) {
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;

        // Season always spans two years
        // Jan-Jul start: current year to next year
        // Aug-Dec start: current year to next year
        return `${year}-${year + 1}`;
    }

    /**
     * Generate schedule based on selected products
     */
    generateSchema() {
        if (this.selectedProducts.length === 0) {
            alert('Selecteer minimaal één product');
            return;
        }

        const dateInput = document.getElementById('start-date');
        const startDate = new Date(dateInput?.value);
        if (isNaN(startDate.getTime())) {
            alert('Selecteer een geldige startdatum');
            return;
        }

        this.currentSeason = this.calculateSeason(startDate);
        this.currentSchema = this.calculateSchema(this.selectedProducts, startDate);
        this.renderSchema();

        // Show schema, hide generate button, show export section
        const schemaSection = document.getElementById('schema-section');
        const generateBtn = document.getElementById('generate-btn');
        const exportSection = document.getElementById('export-section');

        if (schemaSection) schemaSection.style.display = 'block';
        if (generateBtn) generateBtn.style.display = 'none';
        if (exportSection) exportSection.style.display = 'flex';

        // Save schema to localStorage
        this.saveSchemaToStorage();

        // Scroll to schema
        schemaSection?.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Enforce minimum date for fertilizer products (March 15)
     */
    enforceMinDate(date, product) {
        if (product.minDatum) {
            const minDate = new Date(date.getFullYear(), product.minDatum.maand - 1, product.minDatum.dag);
            if (date < minDate) {
                return minDate;
            }
        }
        return date;
    }

    /**
     * Calculate schema based on product dependencies
     */
    calculateSchema(products, startDate) {
        const schema = [];
        const startYear = startDate.getFullYear();

        // Helper to find next valid month for a product
        const findNextValidMonth = (product, afterDate) => {
            let checkDate = new Date(afterDate);
            for (let i = 0; i < 12; i++) {
                const month = checkDate.getMonth() + 1;
                if (product.maanden && product.maanden.includes(month)) {
                    return new Date(checkDate);
                }
                checkDate.setMonth(checkDate.getMonth() + 1);
            }
            return null;
        };

        // Helper to add days to date
        const addDays = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        let currentDate = new Date(startDate);
        let mestDatum = null;
        let mosbehandelingDatum = null;

        // 1. Gazonkalk first (4 weeks before fertilizer) - winter months only
        if (products.includes('gazonkalk')) {
            const product = this.productRules.gazonkalk;
            // Gazonkalk in winter months (Dec, Jan, Feb)
            let kalkDate = new Date(currentDate);
            const kalkMaanden = [1, 2, 12];
            for (let i = 0; i < 12; i++) {
                const month = kalkDate.getMonth() + 1;
                if (kalkMaanden.includes(month)) {
                    break;
                }
                kalkDate.setMonth(kalkDate.getMonth() + 1);
            }

            schema.push({
                datum: kalkDate,
                product: product,
                actie: 'Gazonkalk strooien',
                instructie: 'Strooi de gazonkalk gelijkmatig over je gazon. Wacht minimaal 4 weken voor je gaat bemesten.'
            });
            mestDatum = addDays(kalkDate, 28);
        }

        // 2. Magnesium+ (2 weeks before first fertilizer or together)
        if (products.includes('magnesiumPlus')) {
            const product = this.productRules.magnesiumPlus;
            let magDate;
            if (mestDatum) {
                magDate = addDays(mestDatum, -14);
            } else {
                magDate = findNextValidMonth(product, currentDate);
            }
            if (magDate && magDate >= currentDate) {
                schema.push({
                    datum: magDate,
                    product: product,
                    actie: 'Magnesium+ strooien',
                    instructie: 'Strooi Magnesium+ voor een intense groene kleur. Kan ook samen met meststof worden toegepast.'
                });
            }
        }

        // 3. Anti-Mos
        if (products.includes('antiMos')) {
            const product = this.productRules.antiMos;
            let mosDate = findNextValidMonth(product, currentDate);
            if (mosDate) {
                schema.push({
                    datum: mosDate,
                    product: product,
                    actie: 'Anti-Mos behandeling',
                    instructie: 'Behandel mosplekken met Anti-Mos. Verticuteer na 2 weken voor beste resultaat.'
                });
                mosbehandelingDatum = mosDate;

                // Add verticuteren reminder
                schema.push({
                    datum: addDays(mosDate, 14),
                    product: { ...product, naam: 'Verticuteren' },
                    actie: 'Verticuteren na mosbehandeling',
                    instructie: 'Verticuteer het gazon om dode mos te verwijderen. Ideaal moment voor doorzaaien.'
                });
            }
        }

        // 4. Graszaad (2 weeks after moss treatment if both selected)
        if (products.includes('graszaad')) {
            const product = this.productRules.graszaad;
            let zaadDate;
            if (mosbehandelingDatum) {
                zaadDate = addDays(mosbehandelingDatum, 14);
            } else {
                zaadDate = findNextValidMonth(product, currentDate);
            }
            if (zaadDate) {
                schema.push({
                    datum: zaadDate,
                    product: product,
                    actie: 'Graszaad zaaien',
                    instructie: 'Zaai graszaad op kale plekken. Houd de grond vochtig tot kieming (ca. 10-14 dagen).'
                });
            }
        }

        // 5. Bodemactivator (flexible, no dependencies)
        if (products.includes('bodemactivator')) {
            const product = this.productRules.bodemactivator;
            const validDate = findNextValidMonth(product, currentDate);
            if (validDate) {
                schema.push({
                    datum: validDate,
                    product: product,
                    actie: 'Bodemactivator strooien',
                    instructie: 'Strooi bodemactivator voor betere bodemstructuur. Vooral effectief op zandgrond.'
                });
            }
        }

        // 6. Startmest (for new lawns) - not before March 15
        if (products.includes('startmest')) {
            const product = this.productRules.startmest;
            let validDate = findNextValidMonth(product, currentDate);
            if (validDate) {
                validDate = this.enforceMinDate(validDate, product);
                schema.push({
                    datum: validDate,
                    product: product,
                    actie: 'Startmest strooien',
                    instructie: 'Strooi startmest bij nieuw aangelegde gazons voor snelle ontwikkeling.'
                });
            }
        }

        // 7. Gazonmest (after kalk and magnesium, 2x per year) - not before March 15
        if (products.includes('gazonmest')) {
            const product = this.productRules.gazonmest;
            let firstMestDate = mestDatum || findNextValidMonth(product, currentDate);

            if (firstMestDate) {
                // Enforce minimum date of March 15
                firstMestDate = this.enforceMinDate(firstMestDate, product);

                schema.push({
                    datum: firstMestDate,
                    product: product,
                    actie: 'Gazonmest - 1e bemesting',
                    instructie: 'Eerste bemesting van het seizoen. Strooi gelijkmatig over het gazon.'
                });

                const secondMestDate = addDays(firstMestDate, 100);
                if (product.maanden.includes(secondMestDate.getMonth() + 1)) {
                    schema.push({
                        datum: secondMestDate,
                        product: product,
                        actie: 'Gazonmest - 2e bemesting',
                        instructie: 'Tweede bemesting van het seizoen voor aanhoudende groei.'
                    });
                }
            }
        }

        // 8. Najaarsmest
        if (products.includes('najaarsmest')) {
            const product = this.productRules.najaarsmest;
            let najaarsDate = new Date(startYear, 8, 15); // September 15
            if (najaarsDate < currentDate) {
                najaarsDate = new Date(startYear + 1, 8, 15);
            }

            schema.push({
                datum: najaarsDate,
                product: product,
                actie: 'Najaarsmest strooien',
                instructie: 'Strooi najaarsmest voor winterhardheid en een sterke start in het voorjaar.'
            });
        }

        // Sort by date
        schema.sort((a, b) => a.datum - b.datum);

        return schema;
    }

    /**
     * Render schema timeline with prominent product colors
     */
    renderSchema() {
        const container = document.getElementById('schema-timeline');
        if (!container) return;

        container.innerHTML = '';

        if (this.currentSchema.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">Geen schema gegenereerd</p>';
            return;
        }

        const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

        this.currentSchema.forEach((item) => {
            const date = item.datum;
            const dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = `
                display: flex;
                gap: 1rem;
                padding: 1rem;
                padding-left: 0;
                background: rgba(255,255,255,0.05);
                border-radius: 0.75rem;
                overflow: hidden;
            `;

            itemDiv.innerHTML = `
                <div style="width: 6px; background: ${item.product.kleur}; border-radius: 0 4px 4px 0; flex-shrink: 0;"></div>
                <div style="display: flex; flex-direction: column; min-width: 70px;">
                    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${dateStr}</span>
                    <div style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: ${item.product.kleur}; border-radius: 4px; font-size: 0.625rem; color: white; font-weight: 600; text-align: center;">
                        ${item.product.naam}
                    </div>
                </div>
                <div style="flex: 1;">
                    <p style="font-weight: 600; color: white; margin: 0 0 0.25rem;">${item.actie}</p>
                    <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 0;">${item.instructie}</p>
                </div>
            `;

            container.appendChild(itemDiv);
        });
    }

    /**
     * Export to calendar (ICS format)
     */
    exportToCalendar() {
        if (this.currentSchema.length === 0) {
            alert('Genereer eerst een schema');
            return;
        }

        // Set flag for pending points check
        localStorage.setItem('gazonExportPending', 'true');
        localStorage.setItem('gazonExportSeason', this.currentSeason);

        let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//De Gazon App//Bemestingskalender//NL
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Gazon Bemestingsschema ${this.currentSeason}
`;

        this.currentSchema.forEach((item, index) => {
            const date = item.datum;
            const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
            const uid = `gazon-${Date.now()}-${index}@degazonapp`;

            const summary = item.actie.replace(/,/g, '\\,');
            const description = item.instructie.replace(/,/g, '\\,').replace(/\n/g, '\\n');

            // Reminder at 10:00 on the day itself
            icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;VALUE=DATE:${dateStr}
SUMMARY:${summary}
DESCRIPTION:${description}
BEGIN:VALARM
TRIGGER;VALUE=DATE-TIME:${dateStr}T100000
ACTION:DISPLAY
DESCRIPTION:Vandaag: ${summary}
END:VALARM
END:VEVENT
`;
        });

        icsContent += 'END:VCALENDAR';

        // Download file with season in filename
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `gazon-bemestingsschema-${this.currentSeason}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Save schema to localStorage (without points)
     */
    saveSchemaToStorage() {
        const dateInput = document.getElementById('start-date');
        const startDate = dateInput?.value;
        if (!startDate) return;

        const startDateObj = new Date(startDate);
        const expireDate = new Date(startDateObj);
        expireDate.setMonth(expireDate.getMonth() + 11);

        const pakket = {
            producten: this.selectedProducts,
            startDatum: startDate,
            seizoen: this.currentSeason,
            verlooptOp: expireDate.toISOString().split('T')[0],
            aangemaaktOp: new Date().toISOString().split('T')[0],
            schema: this.currentSchema.map(item => ({
                datum: item.datum.toISOString().split('T')[0],
                product: item.product.id,
                actie: item.actie
            }))
        };

        localStorage.setItem('gazonPakket', JSON.stringify(pakket));
    }

    /**
     * Check if points should be awarded after returning from export
     */
    checkPendingPointsAward() {
        const exportPending = localStorage.getItem('gazonExportPending');
        const exportSeason = localStorage.getItem('gazonExportSeason');

        if (exportPending === 'true' && exportSeason) {
            // Clear the pending flag
            localStorage.removeItem('gazonExportPending');

            // Check if this season already received points
            const puntenData = JSON.parse(localStorage.getItem('gazonPuntenToekenningen') || '{}');

            if (puntenData[exportSeason]?.toegekend) {
                // Already received points for this season
                this.showAlreadyReceivedMessage();
            } else {
                // Award points for this season
                this.awardSeasonPoints(exportSeason);
            }
        }
    }

    /**
     * Award points for a season (one-time)
     */
    awardSeasonPoints(season) {
        const pointsToAdd = 50;

        // Update total points
        let currentPoints = parseInt(localStorage.getItem('gazonPunten') || '0');
        currentPoints += pointsToAdd;
        localStorage.setItem('gazonPunten', currentPoints.toString());

        // Mark season as awarded
        const puntenData = JSON.parse(localStorage.getItem('gazonPuntenToekenningen') || '{}');
        puntenData[season] = {
            toegekend: true,
            datum: new Date().toISOString().split('T')[0],
            punten: pointsToAdd
        };
        localStorage.setItem('gazonPuntenToekenningen', JSON.stringify(puntenData));

        // Show celebration animation
        this.showPointsCelebration(pointsToAdd);
    }

    /**
     * Show points celebration overlay
     */
    showPointsCelebration(points) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'points-celebration';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-out;
        `;

        overlay.innerHTML = `
            <div style="text-align: center; animation: scaleIn 0.5s ease-out;">
                <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounce 0.6s ease-out;">
                    +${points}
                </div>
                <div style="font-size: 1.5rem; font-weight: 700; color: #89b865; margin-bottom: 0.5rem;">
                    GazonPunten verdiend!
                </div>
                <div style="font-size: 0.875rem; color: rgba(255,255,255,0.7);">
                    Je schema is geexporteerd naar je kalender
                </div>
                <div style="margin-top: 2rem; width: 100px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: #89b865; animation: shrink 3s linear forwards;"></div>
                </div>
            </div>
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                @keyframes shrink { from { width: 100%; } to { width: 0%; } }
            </style>
        `;

        overlay.addEventListener('click', () => overlay.remove());

        document.body.appendChild(overlay);

        // Auto-close after 3 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => overlay.remove(), 300);
            }
        }, 3000);
    }

    /**
     * Show message that points were already received
     */
    showAlreadyReceivedMessage() {
        const toast = document.getElementById('points-toast');
        const text = document.getElementById('points-text');
        if (toast && text) {
            text.innerHTML = 'Je hebt dit seizoen al<br>punten ontvangen';
            toast.style.display = 'block';
            toast.style.background = 'rgba(91,127,196,0.95)';

            setTimeout(() => {
                toast.style.display = 'none';
                toast.style.background = 'rgba(137,184,101,0.95)';
            }, 2500);
        }
    }
}

// Create and export singleton instance
const fertilizerPlanner = new FertilizerPlanner();
export default fertilizerPlanner;
