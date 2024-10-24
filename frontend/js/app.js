// Import modules
import { initializeNavigation } from './navigation.js';
import { initializeBibleReader } from './bibleReader.js';
import { initializeSearch } from './search.js';
import { initializeAI } from './ai.js';

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    initializeNavigation();

    // Initialize features
    initializeBibleReader();
    initializeSearch();
    initializeAI();
});
