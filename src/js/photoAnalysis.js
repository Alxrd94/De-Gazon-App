/**
 * Photo Analysis Module
 * Handles lawn photo analysis and recommendations
 */

import { Storage, STORAGE_KEYS } from './storage.js';
import { generateId, compressImage, showToast, calculatePoints } from './utils.js';
import { addPoints } from './loyalty.js';

class PhotoAnalysis {
    constructor() {
        this.currentPhoto = null;
        this.currentAnalysis = null;
    }

    /**
     * Initialize photo analysis page
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const selectPhotoBtn = document.getElementById('select-photo-btn');
        const photoInput = document.getElementById('photo-input');
        const uploadArea = document.getElementById('upload-area');
        const removePhotoBtn = document.getElementById('remove-photo-btn');
        const analyzeBtn = document.getElementById('analyze-btn');
        const newAnalysisBtn = document.getElementById('new-analysis-btn');
        const saveAnalysisBtn = document.getElementById('save-analysis-btn');

        if (selectPhotoBtn) {
            selectPhotoBtn.addEventListener('click', () => photoInput.click());
        }

        if (photoInput) {
            photoInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
        }

        if (uploadArea) {
            // Drag and drop support
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.processPhoto(file);
                }
            });
        }

        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', () => this.removePhoto());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzePhoto());
        }

        if (newAnalysisBtn) {
            newAnalysisBtn.addEventListener('click', () => this.reset());
        }

        if (saveAnalysisBtn) {
            saveAnalysisBtn.addEventListener('click', () => this.saveAnalysis());
        }
    }

    /**
     * Handle photo selection from input
     * @param {Event} e - Change event
     */
    async handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (file) {
            await this.processPhoto(file);
        }
    }

    /**
     * Process and display photo
     * @param {File} file - Image file
     */
    async processPhoto(file) {
        try {
            // Compress image
            const compressed = await compressImage(file);
            const url = URL.createObjectURL(compressed);

            this.currentPhoto = {
                file: compressed,
                url: url,
                name: file.name,
                uploadedAt: new Date().toISOString()
            };

            // Display preview
            const previewImage = document.getElementById('preview-image');
            if (previewImage) {
                previewImage.src = url;
            }

            // Show/hide sections
            const uploadSection = document.getElementById('upload-section');
            const previewSection = document.getElementById('preview-section');
            if (uploadSection) uploadSection.style.display = 'none';
            if (previewSection) previewSection.style.display = 'block';
        } catch (error) {
            console.error('Error processing photo:', error);
            showToast('Fout bij het verwerken van de foto', 'error');
        }
    }

    /**
     * Remove current photo
     */
    removePhoto() {
        if (this.currentPhoto?.url) {
            URL.revokeObjectURL(this.currentPhoto.url);
        }
        this.currentPhoto = null;

        // Show/hide sections
        const uploadSection = document.getElementById('upload-section');
        const previewSection = document.getElementById('preview-section');
        const analysisSection = document.getElementById('analysis-section');
        if (uploadSection) uploadSection.style.display = 'block';
        if (previewSection) previewSection.style.display = 'none';
        if (analysisSection) analysisSection.style.display = 'none';

        // Reset input
        const photoInput = document.getElementById('photo-input');
        if (photoInput) {
            photoInput.value = '';
        }
    }

    /**
     * Analyze the photo (mock implementation)
     */
    async analyzePhoto() {
        if (!this.currentPhoto) return;

        // Show analysis section and loader
        const analysisSection = document.getElementById('analysis-section');
        const analysisLoader = document.getElementById('analysis-loader');
        const analysisResults = document.getElementById('analysis-results');
        const previewSection = document.getElementById('preview-section');

        if (previewSection) previewSection.style.display = 'none';
        if (analysisSection) analysisSection.style.display = 'block';
        if (analysisLoader) analysisLoader.style.display = 'block';
        if (analysisResults) analysisResults.style.display = 'none';

        // Simulate analysis delay
        await this.delay(2500);

        // Generate mock analysis results
        const analysis = this.generateMockAnalysis();
        this.currentAnalysis = analysis;

        // Display results
        this.displayResults(analysis);

        // Hide loader, show results
        if (analysisLoader) analysisLoader.style.display = 'none';
        if (analysisResults) analysisResults.style.display = 'flex';

        // Award points
        const points = calculatePoints('photo_analysis');
        addPoints('photo_analysis', points, 'Foto analyse voltooid');
    }

    /**
     * Generate mock analysis results
     * @returns {Object} Analysis results
     */
    generateMockAnalysis() {
        const conditions = ['uitstekend', 'goed', 'matig', 'slecht'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

        const problems = [
            'Lichte mosgroei zichtbaar in schaduwrijke gebieden',
            'Enkele kale plekken door droogte',
            'Onregelmatige kleur, mogelijk stikstoftekort',
            'Onkruid aanwezig (brandnetel, paardenbloem)'
        ];

        const recommendations = [
            'Verticuteer het gazon om mos en vilt te verwijderen',
            'Breng bemesting aan met hoge stikstof (NPK 15-5-8)',
            'Zaai kale plekken bij met passend graszaad',
            'Verbeter de drainage in natte gebieden',
            'Verhoog de maaifrequentie naar 1x per week'
        ];

        const products = [
            { name: 'Voorjaarsbemesting NPK 15-5-8', price: 24.95 },
            { name: 'Mosbestrijder met ijzersulfaat', price: 19.95 },
            { name: 'Herstelgazon graszaad mix', price: 34.95 }
        ];

        return {
            id: generateId(),
            photoUrl: this.currentPhoto.url,
            analyzedAt: new Date().toISOString(),
            condition: randomCondition,
            rating: randomCondition === 'uitstekend' ? 5 : randomCondition === 'goed' ? 4 : randomCondition === 'matig' ? 3 : 2,
            problems: problems.slice(0, Math.floor(Math.random() * 3) + 1),
            recommendations: recommendations.slice(0, Math.floor(Math.random() * 3) + 2),
            products: products
        };
    }

    /**
     * Display analysis results
     * @param {Object} analysis - Analysis data
     */
    displayResults(analysis) {
        // Update condition rating
        const conditionRating = document.getElementById('condition-rating');
        if (conditionRating) {
            const stars = '⭐'.repeat(analysis.rating);
            conditionRating.querySelector('.rating-stars').textContent = stars;
            conditionRating.querySelector('.rating-text').textContent = analysis.condition.charAt(0).toUpperCase() + analysis.condition.slice(1);
        }

        // Update problems list
        const problemsList = document.getElementById('problems-list');
        if (problemsList) {
            problemsList.innerHTML = analysis.problems.map(problem =>
                `<li>${problem}</li>`
            ).join('');
        }

        // Update recommendations list
        const recommendationsList = document.getElementById('recommendations-list');
        if (recommendationsList) {
            recommendationsList.innerHTML = analysis.recommendations.map(rec =>
                `<li>${rec}</li>`
            ).join('');
        }

        // Update products grid
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = analysis.products.map(product => `
                <div class="product-card">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p class="product-price">€${product.price.toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    /**
     * Save analysis to storage
     */
    saveAnalysis() {
        if (!this.currentAnalysis) return;

        const analyses = Storage.get(STORAGE_KEYS.PHOTO_ANALYSES, []);
        analyses.unshift(this.currentAnalysis);

        // Keep only last 10 analyses
        if (analyses.length > 10) {
            analyses.pop();
        }

        Storage.set(STORAGE_KEYS.PHOTO_ANALYSES, analyses);
        showToast('Analyse opgeslagen', 'success');
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.removePhoto();
        const analysisSection = document.getElementById('analysis-section');
        if (analysisSection) analysisSection.style.display = 'none';
        this.currentAnalysis = null;
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
const photoAnalysis = new PhotoAnalysis();
export default photoAnalysis;
