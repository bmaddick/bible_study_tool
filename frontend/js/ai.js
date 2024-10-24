import { simulateDebate, formatDebateResponse } from './debate.js';
import { handleApologeticsQuery, formatApologeticsResponse } from './apologetics.js';

export function initializeAI() {
    const aiInput = document.getElementById('aiInput');
    const aiSubmit = document.getElementById('aiSubmit');
    const aiResponse = document.getElementById('aiResponse');
    const debateForm = document.getElementById('debateForm');
    const apologeticsForm = document.getElementById('apologeticsForm');

    async function processAIRequest(prompt, type = 'general') {
        try {
            aiResponse.innerHTML = 'Processing your request...';
            let response;

            switch (type) {
                case 'debate':
                    const [position1, position2] = prompt.split(' vs ');
                    const debateResult = await simulateDebate(position1, position2);
                    response = formatDebateResponse(debateResult);
                    break;
                case 'apologetics':
                    const apologeticsResult = await handleApologeticsQuery(prompt);
                    response = formatApologeticsResponse(apologeticsResult);
                    break;
                default:
                    response = await handleGeneralQuery(prompt);
            }

            displayAIResponse(response);
        } catch (error) {
            console.error('Error processing AI request:', error);
            aiResponse.innerHTML = 'Error processing request. Please try again later.';
        }
    }

    async function handleGeneralQuery(prompt) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = {
                    default: "I apologize, but I need more context to provide a meaningful response.",
                    meaning: "This verse is commonly interpreted as...",
                    debate: "From a theological perspective, there are multiple views on this topic...",
                    truth: "The Christian perspective on this matter is..."
                };

                const promptLower = prompt.toLowerCase();
                let response = responses.default;

                if (promptLower.includes('mean') || promptLower.includes('interpret')) {
                    response = responses.meaning;
                } else if (promptLower.includes('debate') || promptLower.includes('discuss')) {
                    response = responses.debate;
                } else if (promptLower.includes('truth') || promptLower.includes('believe')) {
                    response = responses.truth;
                }

                resolve({
                    response: response,
                    timestamp: new Date().toISOString()
                });
            }, 1000);
        });
    }

    function displayAIResponse(data) {
        aiResponse.innerHTML = `
            <div class="ai-response">
                ${data.response}
                <small>Response generated at: ${new Date(data.timestamp).toLocaleString()}</small>
            </div>
        `;
    }

    // Event Listeners
    aiSubmit.addEventListener('click', () => {
        const prompt = aiInput.value.trim();
        if (prompt) {
            processAIRequest(prompt);
        }
    });

    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const prompt = aiInput.value.trim();
            if (prompt) {
                processAIRequest(prompt);
            }
        }
    });

    if (debateForm) {
        debateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const position1 = document.getElementById('position1').value.trim();
            const position2 = document.getElementById('position2').value.trim();
            if (position1 && position2) {
                processAIRequest(`${position1} vs ${position2}`, 'debate');
            }
        });
    }

    if (apologeticsForm) {
        apologeticsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('apologeticsQuery').value.trim();
            if (query) {
                processAIRequest(query, 'apologetics');
            }
        });
    }
}
