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
                    prompt: `You are a theologian well-versed in Protestant beliefs 
                    with balanced theology that is extremely biblical.
                    Provide historical context for these Bible verse(s) together: ${selectedRefs.join(', ')}. 
                    Only include information from one or two of the following options:
                   - The time period when this was written and what was happening in the world
                   - Defining things that were common at the time but are not common today, such as definitions of measurement.
                   - Significant historical events or customs relevant to understanding this verse.
                   Please format your response in one to two sentences with line breaks between the sentences.
                   Ensure your response is concise and in line with Christian biblical beliefs. Do not include
                   anything that would challenge the Christian story or the accuracy of the Bible.
                   
                   do not include the contents of the verse in your response.`
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
                    prompt: `You are a theologian well-versed in Protestant beliefs 
                    with balanced theology that is extremely biblical.
                    Analyze the theological significance of these Bible verses jointly: ${selectedRefs.join(', ')}. 
                    Get straight to the point. Don't say things like "this verse states... [verse contents]"
                    Do not repeat the contents of the verse(s). Tell the reader how the verses are interpreted. If there
                    is debate, mention the different perspectives. Be succinct, concise, and crisp in your response. Your response should usually be 
                    one or two sentences.
                    
                    break your response into multiple lines whenever possible. 
                    
                    do not include the contents of the verse in your response.`
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
                    prompt: `You are a theologian well-versed in Protestant beliefs
                    with balanced theology that is extremely biblical. You communicate in short, crisp sentences. Please
                    consider these verses ( ${selectedRefs.join(', ')} ). Respond with this template:
                    The verse(s) [verses' book and verse number] [what the verses mean jointly - feel free to go beyond
                    surface level meaning. You're a theologian after all]. Some verses other
                    verses to check out are [other verses to check out].

                    Don't use transition phrases like "in summary," or "thus". Do not reiterate the selected verses
                    in your response. Break up your response with new lines for readability. Be concise.

                    do not include the contents of the verse in your response.`
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

    async analyzeQuestion(question) {
        try {
            const response = await fetch('http://localhost:3001/api/gpt/question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question,
                    prompt: `You are a theologian well-versed in Protestant beliefs
                    with balanced theology that is extremely biblical. A person has asked this question: "${question}"

                    Provide a thoughtful, biblical response that:
                    1. Addresses the question directly
                    2. References relevant Bible verses (include book, chapter, and verse)
                    3. Explains the theological principles involved
                    4. If there are different interpretations among Christians, briefly mention them

                    Format your response with line breaks between main points for readability.
                    Be concise but thorough. Use clear, simple language.
                    Ensure your response aligns with traditional Christian biblical beliefs.`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze question');
            }

            const analysis = await response.json();
            return analysis.html;

        } catch (error) {
            console.error('Error analyzing question:', error);
            throw new Error('Error analyzing question. Please try again.');
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

