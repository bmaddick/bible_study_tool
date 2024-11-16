// Import modules
import { initializeNavigation } from './navigation.js';
import { initializeBibleReader } from './bibleReader.js';
import { initializeSearch } from './search.js';
import { initializeAI } from './ai.js';
import VerseLinkingService from './verseLinking.js';
import { BibleService } from './bibleService.js';
import { DisplayService, displayService } from './displayService.js';
console.log('Loading mobile.js');
import './mobile.js';

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const errorContainer = document.querySelector('.chapter-content') || document.createElement('div');

    try {
        // Initialize navigation first since it doesn't depend on other services
        initializeNavigation();

        // Initialize Bible service and ensure it's ready
        const bibleService = new BibleService();
        await bibleService.initialize();

        // Make bibleService available globally for debugging
        window.bibleService = bibleService;

        // Initialize DisplayService and make it available globally
        await displayService.initialize();
        window.displayService = displayService;

        // Initialize verse linking service with DisplayService
        const verseLinkingService = new VerseLinkingService(bibleService);
        await verseLinkingService.initialize();

        // Initialize search functionality
        try {
            const searchInit = initializeSearch(bibleService);
            if (searchInit && typeof searchInit.then === 'function') {
                await searchInit;
            }
        } catch (error) {
            console.warn('Search initialization failed:', error);
            // Continue execution since search is not critical
        }

        // Set up chapter display event handler
        document.addEventListener('displayChapter', async (event) => {
            try {
                const { book, chapter, highlightVerse } = event.detail;
                await verseLinkingService.displayChapter(book, chapter, highlightVerse);
            } catch (error) {
                console.error('Error displaying chapter:', error);
                errorContainer.innerHTML = `
                    <div class="error-message">
                        Error loading chapter content. Please try again.
                        ${error.message ? `<br>Error: ${error.message}` : ''}
                    </div>
                `;
            }
        });

        // Display initial chapter (Genesis 1) after all critical services are initialized
        await verseLinkingService.displayChapter('Genesis', 1);

        // Initialize AI features after core functionality is working
        try {
            if (document.querySelector('#ai-container')) {
                await initializeAI();
                console.log('AI features initialized successfully');
            } else {
                console.log('AI container not found, skipping AI initialization');
            }
        } catch (error) {
            console.warn('AI features initialization failed:', error);
            // Continue execution since AI features are not critical
        }

        console.log('Bible Study Tool initialized successfully');

    } catch (error) {
        console.error('Critical error initializing application:', error);
        errorContainer.innerHTML = `
            <div class="error-message">
                Error initializing Bible Study Tool. Please refresh the page to try again.
                ${error.message ? `<br>Error: ${error.message}` : ''}
            </div>
        `;
        throw error;
    }
});
