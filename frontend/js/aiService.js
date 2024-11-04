import { simulateDebate, formatDebateResponse } from './debate.js';
import { handleApologeticsQuery, formatApologeticsResponse } from './apologetics.js';

class AIService {
    constructor() {
        this.relatedVersesContainer = document.querySelector('.related-verses-content');
    }

    async analyzeVerses(selectedRefs) {
        if (!this.relatedVersesContainer) {
            console.error('Related verses container not found');
            return;
        }

        // Show loading state
        this.relatedVersesContainer.innerHTML = '<p class="loading">Analyzing verses...</p>';

        try {
            const response = await fetch('/api/gpt/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    verses: selectedRefs,
                    prompt: "You are a theologian well-versed in Protestant beliefs \
                    with balanced theology that is extremely biblical. Please take \
                    these verses ( '${verses.join(', ')}' ) and comment on their meaning in \
                    one to two sentences. Then provide related verses so the user can \
                    investigate the Bible more deeply and relate these verses to other \
                    locations in the Bible with similar messaging."
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

/* import { config } from './config.js';
import { simulateDebate, formatDebateResponse } from './debate.js';
import { handleApologeticsQuery, formatApologeticsResponse } from './apologetics.js';


class AIService {
    constructor() {
        this.context = [];
        this.bibleService = null;
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    }

    setBibleService(bibleService) {
        this.bibleService = bibleService;
    }

    async getGPTResponse(prompt, systemRole = 'You are a biblical scholar with expertise in historical context, theology, and interpretation.') {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openai.apiKey}`
            },
            body: JSON.stringify({
                model: config.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: systemRole
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async getHistoricalContext(verseText, reference) {
        const prompt = `Provide detailed historical context for this Bible verse:\nReference: ${reference}\nVerse: ${verseText}\n\nInclude:\n1. Historical setting\n2. Cultural background\n3. Original audience\n4. Relevant historical events`;
        return this.getGPTResponse(prompt);
    }

    async getTheologicalInsights(verseText, reference) {
        const prompt = `Provide theological insights for this Bible verse:\nReference: ${reference}\nVerse: ${verseText}\n\nInclude:\n1. Key theological themes\n2. Doctrinal significance\n3. Connection to broader biblical narrative\n4. Application principles`;
        return this.getGPTResponse(prompt);
    }

    async getVerseInterpretation(verseText, reference) {
        const [historicalContext, theologicalInsights] = await Promise.all([
            this.getHistoricalContext(verseText, reference),
            this.getTheologicalInsights(verseText, reference)
        ]);

        return {
            meaning: theologicalInsights,
            historicalContext: historicalContext,
            translationNotes: await this.getTranslationNotes(verseText, reference),
            relatedVerses: await this.findRelatedVerses(reference)
        };
    }

    async findRelatedVerses(verseText, reference) {
        if (!this.bibleService) {
            throw new Error('BibleService not initialized');
        }

        const relatedVerses = await this.bibleService.findRelatedVerses(reference);
        return {
            title: `Related Verses for ${reference}`,
            interpretation: `Here are verses thematically related to "${verseText}"`,
            relatedVerses: relatedVerses.map(rv => ({
                reference: rv.reference,
                text: rv.verse.text,
                relevance: rv.relevance
            })),
            notes: 'Click on any verse reference to view it in context.'
        };
    }

    async simulateDebate(topic) {
        const prompt = `Generate a balanced theological debate on the topic: "${topic}"\n\nProvide:\n1. Two contrasting viewpoints\n2. Biblical arguments for each view\n3. Relevant scripture references\n4. A balanced synthesis`;
        const debateContent = await this.getGPTResponse(prompt);

        try {
            const parsedContent = JSON.parse(debateContent);
            return parsedContent;
        } catch (error) {
            return {
                topic,
                viewA: {
                    position: "Traditional View",
                    arguments: debateContent.split('\n').slice(0, 2),
                    scriptureReferences: []
                },
                viewB: {
                    position: "Alternative View",
                    arguments: debateContent.split('\n').slice(2, 4),
                    scriptureReferences: []
                },
                synthesis: debateContent.split('\n').pop()
            };
        }
    }

    async getApologeticsResponse(question) {
        const prompt = `Provide a comprehensive apologetics response to this question: "${question}"\n\nInclude:\n1. Main argument\n2. Biblical support\n3. Historical evidence\n4. Philosophical reasoning\n5. Common objections and responses`;
        const response = await this.getGPTResponse(prompt);

        try {
            const parsedResponse = JSON.parse(response);
            return parsedResponse;
        } catch (error) {
            return {
                answer: response,
                scriptureReferences: [],
                historicalContext: "",
                philosophicalArguments: []
            };
        }
    }

    async getTheologicalAnswer(question) {
        const prompt = `Answer this theological question: "${question}"\n\nProvide:\n1. Biblical explanation\n2. Key scripture references\n3. Different denominational perspectives\n4. Practical application`;
        const response = await this.getGPTResponse(prompt);

        try {
            const parsedResponse = JSON.parse(response);
            return parsedResponse;
        } catch (error) {
            return {
                answer: response,
                scriptureReferences: [],
                denominationalViews: {
                    catholic: "",
                    protestant: "",
                    orthodox: ""
                }
            };
        }
    }

    async getTranslationNotes(verseText, reference) {
        const prompt = `Provide translation notes for this Bible verse:\nReference: ${reference}\nVerse: ${verseText}\n\nInclude:\n1. Key terms in original languages\n2. Alternative translations\n3. Textual variants if any`;
        return this.getGPTResponse(prompt);
    }
}

export { AIService }; */
