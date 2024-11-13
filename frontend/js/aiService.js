import { simulateDebate, formatDebateResponse } from './debate.js';
import { handleApologeticsQuery, formatApologeticsResponse } from './apologetics.js';

class AIService {
    constructor() {
        this.relatedVersesContainer = document.querySelector('.related-verses-content');
        this.historicalContextContainer = document.querySelector('.historical-context-content');
        this.theologicalInsightsContainer = document.querySelector('.theological-insights-content');
    }

    async getHistoricalContext(selectedRefs) {
        if (!this.historicalContextContainer) {
            console.error('Historical context container not found');
            return;
        }
    
        // Show loading state
        this.historicalContextContainer.innerHTML = '<p class="loading">loading...</p>';
    
        try {
            const response = await fetch('http://localhost:3001/api/gpt/historical-context', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    verses: selectedRefs,
                    prompt: `Provide historical context for these Bible verse(s) together: ${selectedRefs.join(', ')}. 
                    Include the most important information from the following options. You can include 
                    multiple if necessary.
                   - The time period when this was written (if it affects the interpretation)
                   - Cultural and historical background (if it affects the interpretation)
                   - Significant historical events or customs relevant to understanding this verse (if needed)
                   - Archaeological evidence or historical documents that provide context (if available)
                   Please format your response in one to two sentences with line breaks between the sentences.
                   Ensure your response is concise and in line with Christian biblical beliefs.`
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to get historical context');
            }
    
            const analysis = await response.json();
            this.historicalContextContainer.innerHTML = analysis.html;
    
        } catch (error) {
            console.error('Error getting historical context:', error);
            this.historicalContextContainer.innerHTML = `
                <div class="error-message">
                    Error getting historical context. Please try again.
                    ${error.message ? `<br>Error: ${error.message}` : ''}
                </div>
            `;
        }
    }

    async getTheologicalInsights(selectedRefs) {
        if (!this.theologicalInsightsContainer) {
            console.error('Theological insights container not found');
            return;
        }
    
        // Show loading state
        this.theologicalInsightsContainer.innerHTML = '<p class="loading">loading...</p>';
    
        try {
            const response = await fetch('http://localhost:3001/api/gpt/theological-insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    verses: selectedRefs,
                    prompt: `Analyze the theological significance of these Bible verses jointly: ${selectedRefs.join(', ')}. 
                    Consider any Implications for Christian faith and practice. Highlight any Christian
                    debate around the interpretation of these verses. If relevant, connect it to the broader 
                    biblical narrative and redemptive history. Your response should usually be 
                    one sentence. Be succinct, concise, and crisp in your response. If the verse is very theologically dense, then you can do a longer 
                    explanation.`
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to get theological insights');
            }
    
            const analysis = await response.json();
            this.theologicalInsightsContainer.innerHTML = analysis.html;
    
        } catch (error) {
            console.error('Error getting theological insights:', error);
            this.theologicalInsightsContainer.innerHTML = `
                <div class="error-message">
                    Error getting theological insights. Please try again.
                    ${error.message ? `<br>Error: ${error.message}` : ''}
                </div>
            `;
        }
    }

    async analyzeVerses(selectedRefs) {
        if (!this.relatedVersesContainer) {
            console.error('Related verses container not found');
            return;
        }

        // Show loading state
        this.relatedVersesContainer.innerHTML = '<p class="loading">loading...</p>';

        try {
            const response = await fetch('http://localhost:3001/api/gpt/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    verses: selectedRefs,
                    prompt: `You are a theologian well-versed in Protestant beliefs \\
                    with balanced theology that is extremely biblical. Please take \\
                    these verses ( ${selectedRefs.join(', ')} ) and comment on their joint meaning in \\
                    two to three sentences. Then provide related verses so the user can \\
                    investigate the Bible more deeply and relate these verses to other \\
                    locations in the Bible with similar messaging. Structure your output like \\
                    this: "This verse [what the verse is about or means]. Other verses that \\
                    discuss similar themes or dig in further are [other verses to check out]. \\
                    End with a poignant, crisp summary of a key point. Don't use transition \\
                    phrases like "in summary," or "thus". Do not reiterate the selected verses \\
                    in your response. Break up your response with new lines for readability.`
                     // Placeholder for your custom prompt
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get verse analysis');
            }

            const analysis = await response.json();
            this.relatedVersesContainer.innerHTML = analysis.html;

        } catch (error) {
            console.error('Error analyzing verses:', error);
            this.relatedVersesContainer.innerHTML = `
                <div class="error-message">
                    Error analyzing verses. Please try again.
                    ${error.message ? `<br>Error: ${error.message}` : ''}
                </div>
            `;
        }
    }
}

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

// Export AIService for use in other modules
export const aiService = new AIService();

