import { simulateDebate, formatDebateResponse } from './debate.js';
import { handleApologeticsQuery, formatApologeticsResponse } from './apologetics.js';

export function initializeAI() {
    // Initialize AIService instance
    const aiService = new AIService();

    // Initialize containers
    const historicalContextContainer = document.querySelector('[aria-label="Historical Context"] .historical-context-content');
    const theologicalInsightsContainer = document.querySelector('[aria-label="Theological Insights"] .theological-insights-content');

    if (!historicalContextContainer || !theologicalInsightsContainer) {
        console.warn('AI containers not found, skipping AI initialization');
        return;
    }

    // Return the initialized AIService instance
    return aiService;
}
