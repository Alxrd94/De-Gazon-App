/**
 * Photo Analysis Module - Gazon AI
 * Handles lawn photo analysis with chat interface and typewriter effect
 */

import { Storage, STORAGE_KEYS } from './storage.js';
import { generateId, compressImage, showToast } from './utils.js';
import { addPoints } from './loyalty.js';

class PhotoAnalysis {
    constructor() {
        this.currentPhoto = null;
        this.currentAnalysis = null;
        this.hasEarnedPointsToday = false;
    }

    /**
     * Initialize photo analysis page
     */
    init() {
        this.setupEventListeners();
        this.checkDailyPointsStatus();
    }

    /**
     * Check if user has already earned points today
     */
    checkDailyPointsStatus() {
        const lastEarned = Storage.get('lastAnalysisPointsDate', null);
        const today = new Date().toDateString();

        this.hasEarnedPointsToday = (lastEarned === today);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const selectPhotoBtn = document.getElementById('select-photo-btn');
        const uploadArea = document.getElementById('upload-area');
        const removePhotoBtn = document.getElementById('remove-photo-btn');
        const analyzeBtn = document.getElementById('analyze-btn');
        const newAnalysisBtn = document.getElementById('new-analysis-btn');
        const askQuestionBtn = document.getElementById('ask-question-btn');
        const followUpInput = document.getElementById('follow-up-input');

        // Photo selection - gebruik dynamische input voor betere mobiele compatibiliteit
        if (selectPhotoBtn) {
            selectPhotoBtn.addEventListener('click', () => this.openCamera());
        }

        if (uploadArea) {
            uploadArea.addEventListener('click', () => this.openCamera());

            // Drag and drop support
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#89b865';
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
                uploadArea.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.handlePhotoSelected(file);
                }
            });
        }

        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', () => this.removePhoto());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.startAnalysis());
        }

        if (newAnalysisBtn) {
            newAnalysisBtn.addEventListener('click', () => this.reset());
        }

        if (askQuestionBtn) {
            askQuestionBtn.addEventListener('click', () => this.handleFollowUpQuestion());
        }

        if (followUpInput) {
            followUpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleFollowUpQuestion();
                }
            });
        }

        // Example questions
        const exampleQuestions = document.querySelectorAll('.example-question');
        exampleQuestions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                followUpInput.value = question;
                this.handleFollowUpQuestion();
            });
        });
    }

    /**
     * Open camera/file picker with dynamic input element
     * This approach works better on mobile devices and prevents camera hang
     */
    openCamera() {
        console.log('Opening camera/file picker');

        // Create fresh input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Gebruik back camera op mobiel

        let handled = false;

        // Handler function
        const handleInputChange = (event) => {
            if (handled) return;
            handled = true;

            const file = event.target?.files?.[0];
            if (file) {
                console.log('File selected:', file.name, file.type);
                this.handlePhotoSelected(file);
            } else {
                console.log('No file selected');
            }

            // Clean up
            input.remove();
        };

        // Beide event handlers voor maximale compatibiliteit
        input.onchange = handleInputChange;
        input.addEventListener('change', handleInputChange);

        // Cancel handler
        input.addEventListener('cancel', () => {
            console.log('Camera/upload geannuleerd');
            input.remove();
        });

        // Trigger file picker/camera
        input.click();
    }

    /**
     * Handle photo selected from camera/file picker
     */
    handlePhotoSelected(file) {
        console.log('Processing photo:', file.name, file.type, file.size);

        // Valideer bestandstype
        if (!file.type.startsWith('image/')) {
            showToast('Selecteer een geldige afbeelding', 'error');
            console.error('Invalid file type:', file.type);
            return;
        }

        // Toon loading state
        this.showLoadingState();

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const imageData = e.target.result;
                console.log('Photo loaded, size:', imageData.length);

                this.currentPhoto = {
                    data: imageData,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadedAt: new Date().toISOString()
                };

                this.displayPhoto(imageData);
                this.hideLoadingState();

            } catch (error) {
                console.error('Error in reader.onload:', error);
                showToast('Fout bij het verwerken van de foto', 'error');
                this.hideLoadingState();
            }
        };

        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            showToast('Er ging iets mis bij het laden van de foto. Probeer opnieuw.', 'error');
            this.hideLoadingState();
        };

        // Start reading the file
        reader.readAsDataURL(file);
    }

    /**
     * Display photo in preview section
     */
    displayPhoto(imageData) {
        console.log('Displaying photo');

        // Display preview image
        const previewImage = document.getElementById('preview-image');
        if (previewImage) {
            previewImage.src = imageData;
            previewImage.onload = () => {
                console.log('Preview image rendered successfully');
            };
            previewImage.onerror = () => {
                console.error('Error rendering preview image');
                showToast('Fout bij het tonen van de foto', 'error');
            };
        }

        // Show/hide sections
        const uploadSection = document.getElementById('upload-section');
        const previewSection = document.getElementById('preview-section');

        if (uploadSection) {
            uploadSection.style.display = 'none';
        }

        if (previewSection) {
            previewSection.style.display = 'block';
        }

        showToast('Foto geladen! Klik op "Start Analyse"', 'success');
    }

    /**
     * Show loading state while processing photo
     */
    showLoadingState() {
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.style.opacity = '0.5';
            uploadArea.style.pointerEvents = 'none';
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.style.opacity = '1';
            uploadArea.style.pointerEvents = 'auto';
        }
    }

    /**
     * Remove current photo
     */
    removePhoto() {
        console.log('Removing photo');
        this.currentPhoto = null;

        const uploadSection = document.getElementById('upload-section');
        const previewSection = document.getElementById('preview-section');

        if (uploadSection) uploadSection.style.display = 'block';
        if (previewSection) previewSection.style.display = 'none';

        // Clear preview image
        const previewImage = document.getElementById('preview-image');
        if (previewImage) previewImage.src = '';
    }

    /**
     * Start the analysis process
     */
    async startAnalysis() {
        if (!this.currentPhoto) return;

        // Hide preview, show analysis steps
        document.getElementById('preview-section').style.display = 'none';
        document.getElementById('analysis-steps-section').style.display = 'block';

        // Run analysis steps animation
        await this.animateAnalysisSteps();

        // Hide steps, show chat results
        document.getElementById('analysis-steps-section').style.display = 'none';

        // Generate analysis
        this.currentAnalysis = this.pickRandomAnalysis();

        // Show AI chat messages
        await this.displayChatResults(this.currentAnalysis);

        // Award points (max 1x per day)
        this.awardPoints();

        // Show follow-up section and new analysis button
        document.getElementById('follow-up-section').style.display = 'block';
        document.getElementById('new-analysis-btn').style.display = 'block';
    }

    /**
     * Animate analysis steps
     */
    async animateAnalysisSteps() {
        const steps = [
            { id: 'step-1', duration: 1000 },
            { id: 'step-2', duration: 1200 },
            { id: 'step-3', duration: 1100 },
            { id: 'step-4', duration: 1000 }
        ];

        for (const step of steps) {
            const stepEl = document.getElementById(step.id);
            const checkmark = stepEl.querySelector('.step-checkmark');

            // Show step
            stepEl.classList.add('show');

            // Wait duration
            await this.delay(step.duration);

            // Show checkmark and mark completed
            stepEl.classList.add('completed');
            checkmark.classList.add('show');

            // Small delay before next step
            await this.delay(300);
        }

        // Extra delay before showing results
        await this.delay(500);
    }

    /**
     * Pick random analysis from mock data
     */
    pickRandomAnalysis() {
        const analyses = window.GazonAI.mockAnalyses;
        return analyses[Math.floor(Math.random() * analyses.length)];
    }

    /**
     * Display chat results with typewriter effect
     */
    async displayChatResults(analysis) {
        const container = document.getElementById('ai-messages-container');
        const section = document.getElementById('chat-results-section');

        // Clear previous messages
        container.innerHTML = '';
        section.style.display = 'block';

        // Message 1: Analysis Result with Score
        await this.showTypingIndicator(container);
        await this.delay(1500);
        await this.removeTypingIndicator(container);

        const message1 = this.createAIMessage();
        container.appendChild(message1);
        message1.classList.add('show');

        await this.typeText(message1, `Ik heb je gazon geanalyseerd!\n\n📊 ANALYSE RESULTAAT\n\nAlgehele gezondheid:\n${'⭐'.repeat(analysis.score)}${'☆'.repeat(5 - analysis.score)} ${analysis.score}/5 - ${analysis.scoreText}\n\n✅ WAT GAAT ER GOED\n${analysis.positives.map(p => '• ' + p).join('\n')}`);

        await this.delay(800);

        // Message 2: Concerns
        await this.showTypingIndicator(container);
        await this.delay(1200);
        await this.removeTypingIndicator(container);

        const message2 = this.createAIMessage();
        container.appendChild(message2);
        message2.classList.add('show');

        await this.typeText(message2, `⚠️ AANDACHTSPUNTEN\n${analysis.concerns.map(c => '• ' + c).join('\n')}`);

        await this.delay(800);

        // Message 3: Advice
        await this.showTypingIndicator(container);
        await this.delay(1500);
        await this.removeTypingIndicator(container);

        const message3 = this.createAIMessage();
        container.appendChild(message3);
        message3.classList.add('show');

        let adviceText = '💡 MIJN ADVIES\n\n';
        analysis.advice.forEach((advice, index) => {
            adviceText += `${index + 1}. ${advice.title}\n   ${advice.text}\n\n`;
        });

        await this.typeText(message3, adviceText.trim());

        await this.delay(800);

        // Message 4: Product Recommendations
        await this.showTypingIndicator(container);
        await this.delay(1200);
        await this.removeTypingIndicator(container);

        const message4 = this.createProductMessage(analysis.products);
        container.appendChild(message4);
        message4.classList.add('show');

        // Scroll to bottom
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    /**
     * Create AI message element
     */
    createAIMessage() {
        const message = document.createElement('div');
        message.className = 'ai-message';

        const avatar = document.createElement('div');
        avatar.className = 'ai-avatar';
        avatar.innerHTML = '<span style="font-size: 1.5rem;">🤖</span> Gazon AI';

        const content = document.createElement('div');
        content.className = 'ai-content';
        content.style.whiteSpace = 'pre-wrap';
        content.style.lineHeight = '1.6';

        message.appendChild(avatar);
        message.appendChild(content);

        return message;
    }

    /**
     * Create product recommendations message
     */
    createProductMessage(productIds) {
        const message = this.createAIMessage();
        const content = message.querySelector('.ai-content');

        let html = '<div style="margin-bottom: 12px; font-weight: 600;">🛒 AANBEVOLEN PRODUCTEN</div>';

        productIds.forEach(productId => {
            const product = window.GazonAI.products[productId];
            if (product) {
                html += `
                    <div class="product-card" style="background: rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">${product.icon}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: white; margin-bottom: 4px;">${product.name}</div>
                                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">${product.description}</div>
                            </div>
                        </div>
                        <a href="https://graszoden.expert/" target="_blank" style="display: block; text-align: center; padding: 10px; background: linear-gradient(135deg, #f29f40, #e08830); border-radius: 8px; color: white; text-decoration: none; font-size: 0.85rem; font-weight: 600;">BEKIJK PRODUCT</a>
                    </div>
                `;
            }
        });

        html += `
            <a href="https://graszoden.expert/" target="_blank" style="display: block; text-align: center; padding: 14px; background: linear-gradient(135deg, #89b865, #538731); border-radius: 8px; color: white; text-decoration: none; font-weight: 600; margin-top: 16px; box-shadow: 0 4px 12px rgba(137,184,101,0.3);">BESTEL ALLES</a>
        `;

        content.innerHTML = html;
        return message;
    }

    /**
     * Show typing indicator
     */
    async showTypingIndicator(container) {
        const indicator = document.createElement('div');
        indicator.className = 'ai-typing';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            Gazon AI is aan het typen
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        container.appendChild(indicator);

        // Scroll to bottom
        indicator.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    /**
     * Remove typing indicator
     */
    async removeTypingIndicator(container) {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Typewriter effect
     */
    async typeText(element, text, speed = 15) {
        const content = element.querySelector('.ai-content');
        content.textContent = '';

        for (let i = 0; i < text.length; i++) {
            content.textContent += text[i];

            // Scroll into view periodically
            if (i % 50 === 0) {
                element.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }

            await this.delay(speed);
        }

        // Final scroll
        element.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    /**
     * Handle follow-up question
     */
    async handleFollowUpQuestion() {
        const input = document.getElementById('follow-up-input');
        const question = input.value.trim();

        if (!question) return;

        // Clear input
        input.value = '';

        // Get answer
        const answer = this.findAnswer(question);

        // Show user question
        const container = document.getElementById('ai-messages-container');

        const userMessage = document.createElement('div');
        userMessage.className = 'ai-message';
        userMessage.style.background = 'rgba(137,184,101,0.2)';
        userMessage.style.borderBottomLeftRadius = '16px';
        userMessage.style.borderBottomRightRadius = '4px';
        userMessage.style.marginLeft = 'auto';
        userMessage.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; color: #89b865;">Jij</div>
            <div style="white-space: pre-wrap;">${question}</div>
        `;
        container.appendChild(userMessage);
        userMessage.classList.add('show');

        // Show AI typing
        await this.delay(500);
        await this.showTypingIndicator(container);
        await this.delay(1500);
        await this.removeTypingIndicator(container);

        // Show AI answer
        const aiMessage = this.createAIMessage();
        container.appendChild(aiMessage);
        aiMessage.classList.add('show');

        await this.typeText(aiMessage, answer, 20);
    }

    /**
     * Find answer based on question keywords
     */
    findAnswer(question) {
        const lowerQuestion = question.toLowerCase();
        const qa = window.GazonAI.mockQA;

        for (const entry of qa) {
            if (entry.keywords.some(keyword => lowerQuestion.includes(keyword))) {
                return entry.answer;
            }
        }

        return window.GazonAI.fallbackAnswer;
    }

    /**
     * Award points (max 1x per day)
     */
    awardPoints() {
        if (this.hasEarnedPointsToday) {
            // Don't award points, but show message
            console.log('Points already earned today');
            return;
        }

        // Award 10 points
        addPoints('photo_analysis', 10, 'Gazon AI analyse voltooid');

        // Save today's date
        const today = new Date().toDateString();
        Storage.set('lastAnalysisPointsDate', today);
        this.hasEarnedPointsToday = true;

        // Show points notification
        const container = document.getElementById('ai-messages-container');
        const pointsBanner = document.createElement('div');
        pointsBanner.style.cssText = `
            background: linear-gradient(135deg, rgba(137,184,101,0.3), rgba(83,135,49,0.3));
            border-radius: 12px;
            padding: 16px;
            margin: 12px 0;
            border: 2px solid rgba(137,184,101,0.5);
            text-align: center;
            animation: fadeInUp 0.3s ease;
        `;
        pointsBanner.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 2rem; font-weight: 700; color: #89b865;">+10</span>
                <img src="./src/assets/icons/logo-white.png" alt="Punten" style="width: 28px; height: 28px; opacity: 0.9;">
            </div>
            <p style="font-size: 0.875rem; color: rgba(255,255,255,0.9); margin: 0; font-weight: 600;">🎉 GazonPunten verdiend!</p>
        `;

        container.insertBefore(pointsBanner, container.firstChild);
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.removePhoto();

        // Hide all sections except upload
        document.getElementById('analysis-steps-section').style.display = 'none';
        document.getElementById('chat-results-section').style.display = 'none';
        document.getElementById('follow-up-section').style.display = 'none';
        document.getElementById('new-analysis-btn').style.display = 'none';

        // Reset steps
        const steps = document.querySelectorAll('.analysis-step');
        steps.forEach(step => {
            step.classList.remove('show', 'completed');
            step.querySelector('.step-checkmark').classList.remove('show');
        });

        // Clear chat
        const container = document.getElementById('ai-messages-container');
        if (container) container.innerHTML = '';

        this.currentAnalysis = null;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create and export singleton instance
const photoAnalysis = new PhotoAnalysis();
export default photoAnalysis;
