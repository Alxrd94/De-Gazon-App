/**
 * Fertilizer Planner Module
 * Smart scheduling with product dependencies
 */

class FertilizerPlanner {
    constructor() {
        this.selectedProducts = [];
        this.currentSchema = [];

        // Product rules and data
        this.productRules = {
            gazonkalk: {
                id: 'gazonkalk',
                naam: "Gazonkalk",
                beschrijving: "Optimale bodemstructuur",
                kleur: "#5BA4A4",
                maanden: [1, 2, 12],
                frequentie: 1,
                regel: "MIN_4_WEKEN_VOOR_MESTSTOF",
                emoji: "⚪"
            },
            magnesiumPlus: {
                id: 'magnesiumPlus',
                naam: "Magnesium+",
                beschrijving: "Intense groene kleur",
                kleur: "#F29F40",
                maanden: [2, 3, 4, 5, 6, 7, 8, 9, 10],
                frequentie: 1,
                regel: "2_WEKEN_VOOR_EERSTE_MESTSTOF_OF_TEGELIJK",
                emoji: "✨"
            },
            antiMos: {
                id: 'antiMos',
                naam: "Anti-Mos",
                beschrijving: "Mosbestrijding",
                kleur: "#5B7FC4",
                maanden: [2, 3, 4, 5, 6, 9, 10, 11],
                frequentie: 1,
                regel: "2_WEKEN_VOOR_GRASZAAD",
                emoji: "🧹"
            },
            graszaad: {
                id: 'graszaad',
                naam: "Graszaad",
                beschrijving: "Herstel kale plekken",
                kleur: "#9B59B6",
                maanden: [3, 4, 5, 6, 9, 10],
                frequentie: 1,
                regel: "2_WEKEN_NA_MOSBEHANDELING",
                emoji: "🌱"
            },
            gazonmest: {
                id: 'gazonmest',
                naam: "Gazonmest",
                beschrijving: "Sterke groei voorjaar/zomer (2x per jaar)",
                kleur: "#89b865",
                maanden: [3, 4, 5, 6, 7, 8],
                frequentie: 2,
                werkingsduur: 100,
                regel: "NA_KALK_EN_MAGNESIUM",
                emoji: "🌿"
            },
            najaarsmest: {
                id: 'najaarsmest',
                naam: "Najaarsmest",
                beschrijving: "Winterweerstand (1x per jaar)",
                kleur: "#89b865",
                maanden: [9, 10, 11, 12],
                frequentie: 1,
                werkingsduur: 100,
                emoji: "🍂"
            },
            bodemactivator: {
                id: 'bodemactivator',
                naam: "Bodemactivator",
                beschrijving: "Bodemverbetering (zandgrond)",
                kleur: "#C45B7F",
                maanden: [2, 3, 4, 5, 8, 9, 10, 11],
                frequentie: 1,
                regel: null,
                emoji: "🪱"
            },
            startmest: {
                id: 'startmest',
                naam: "Startmest",
                beschrijving: "Bij nieuw gazon",
                kleur: "#89b865",
                maanden: [3, 4, 5, 6, 7, 8, 9, 10, 11],
                frequentie: 1,
                emoji: "🌾"
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

        // Save button
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSchema());
        }
    }

    /**
     * Render product checkboxes
     */
    renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.innerHTML = '';

        Object.values(this.productRules).forEach(product => {
            const isChecked = this.selectedProducts.includes(product.id);
            const productDiv = document.createElement('div');
            productDiv.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: rgba(255,255,255,0.05); border-radius: 0.75rem; cursor: pointer; border: 1px solid transparent; transition: all 0.2s;';
            productDiv.addEventListener('click', () => this.toggleProduct(product.id));

            productDiv.innerHTML = `
                <div id="check-${product.id}" style="width: 24px; height: 24px; border-radius: 6px; border: 2px solid ${isChecked ? product.kleur : 'rgba(255,255,255,0.3)'}; background: ${isChecked ? product.kleur : 'transparent'}; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    ${isChecked ? '<span style="color: white; font-size: 14px;">✓</span>' : ''}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1rem;">${product.emoji}</span>
                        <span style="font-weight: 600; color: white;">${product.naam}</span>
                    </div>
                    <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 0.25rem 0 0;">${product.beschrijving}</p>
                </div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${product.kleur};"></div>
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

        // Hide schema if products changed
        const schemaSection = document.getElementById('schema-section');
        const exportButtons = document.getElementById('export-buttons');
        if (schemaSection) schemaSection.style.display = 'none';
        if (exportButtons) exportButtons.style.display = 'none';
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

        this.currentSchema = this.calculateSchema(this.selectedProducts, startDate);
        this.renderSchema();

        const schemaSection = document.getElementById('schema-section');
        const exportButtons = document.getElementById('export-buttons');
        if (schemaSection) schemaSection.style.display = 'block';
        if (exportButtons) exportButtons.style.display = 'flex';

        // Scroll to schema
        schemaSection?.scrollIntoView({ behavior: 'smooth' });
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
                if (product.maanden.includes(month)) {
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

        // 1. Gazonkalk first (4 weeks before fertilizer)
        if (products.includes('gazonkalk')) {
            const product = this.productRules.gazonkalk;
            const validDate = findNextValidMonth(product, currentDate);
            if (validDate) {
                schema.push({
                    datum: validDate,
                    product: product,
                    actie: 'Gazonkalk strooien',
                    instructie: 'Strooi de gazonkalk gelijkmatig over je gazon. Wacht minimaal 4 weken voor je gaat bemesten.'
                });
                mestDatum = addDays(validDate, 28);
            }
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
                    product: { ...product, naam: 'Verticuteren', emoji: '🪥' },
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

        // 6. Startmest (for new lawns)
        if (products.includes('startmest')) {
            const product = this.productRules.startmest;
            const validDate = findNextValidMonth(product, currentDate);
            if (validDate) {
                schema.push({
                    datum: validDate,
                    product: product,
                    actie: 'Startmest strooien',
                    instructie: 'Strooi startmest bij nieuw aangelegde gazons voor snelle ontwikkeling.'
                });
            }
        }

        // 7. Gazonmest (after kalk and magnesium, 2x per year)
        if (products.includes('gazonmest')) {
            const product = this.productRules.gazonmest;
            let firstMestDate = mestDatum || findNextValidMonth(product, currentDate);

            if (firstMestDate) {
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
            let najaarsDate = new Date(startYear, 8, 15);
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
     * Render schema timeline
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
            itemDiv.style.cssText = 'display: flex; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.75rem; border-left: 4px solid ' + item.product.kleur + ';';

            itemDiv.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; min-width: 50px;">
                    <span style="font-size: 1.5rem;">${item.product.emoji}</span>
                    <span style="font-size: 0.625rem; color: rgba(255,255,255,0.5); margin-top: 0.25rem;">${dateStr}</span>
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

        let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//De Gazon App//Bemestingskalender//NL
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Gazon Bemestingsschema
`;

        this.currentSchema.forEach((item, index) => {
            const date = item.datum;
            const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
            const uid = `gazon-${Date.now()}-${index}@degazonapp`;

            const summary = item.actie.replace(/,/g, '\\,');
            const description = item.instructie.replace(/,/g, '\\,').replace(/\n/g, '\\n');

            icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;VALUE=DATE:${dateStr}
SUMMARY:${item.product.emoji} ${summary}
DESCRIPTION:${description}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Morgen: ${summary}
END:VALARM
END:VEVENT
`;
        });

        icsContent += 'END:VCALENDAR';

        // Download file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'gazon-bemestingsschema.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Save schema to localStorage
     */
    saveSchema() {
        const dateInput = document.getElementById('start-date');
        const startDate = dateInput?.value;
        if (!startDate) return;

        const startDateObj = new Date(startDate);
        const expireDate = new Date(startDateObj);
        expireDate.setMonth(expireDate.getMonth() + 11);

        const pakket = {
            producten: this.selectedProducts,
            startDatum: startDate,
            verlooptOp: expireDate.toISOString().split('T')[0],
            aangemaaktOp: new Date().toISOString().split('T')[0],
            schema: this.currentSchema.map(item => ({
                datum: item.datum.toISOString().split('T')[0],
                product: item.product.id,
                actie: item.actie
            }))
        };

        // Check if updating or creating new
        const existing = localStorage.getItem('gazonPakket');
        const isUpdate = existing !== null;

        localStorage.setItem('gazonPakket', JSON.stringify(pakket));

        // Award points
        const pointsToAdd = isUpdate ? 25 : 50;
        let currentPoints = parseInt(localStorage.getItem('gazonPunten') || '0');
        currentPoints += pointsToAdd;
        localStorage.setItem('gazonPunten', currentPoints.toString());

        // Show points animation
        this.showPointsToast(pointsToAdd);
    }

    /**
     * Show points toast animation
     */
    showPointsToast(points) {
        const toast = document.getElementById('points-toast');
        const text = document.getElementById('points-text');
        if (toast && text) {
            text.textContent = `+${points} GazonPunten!`;
            toast.style.display = 'block';

            setTimeout(() => {
                toast.style.display = 'none';
            }, 2500);
        }
    }
}

// Create and export singleton instance
const fertilizerPlanner = new FertilizerPlanner();
export default fertilizerPlanner;
