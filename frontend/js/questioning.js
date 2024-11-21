import { aiService } from './aiService.js';

document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('question-input');
    const submitButton = document.getElementById('submit-question');
    const responseContainer = document.getElementById('response-container');
    const responseContent = document.getElementById('response-content');

    async function handleQuestionSubmit() {
        if (!questionInput.value.trim()) {
            alert('Please enter a question');
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Getting insights...';

            // Show loading state
            responseContainer.style.display = 'block';
            responseContent.innerHTML = '<div class="loading-state">Analyzing your question...</div>';

            // Get response from AI service
            const response = await aiService.analyzeQuestion(questionInput.value.trim());

            // Display the response
            responseContent.innerHTML = response.replace(/\n/g, '<br>');

        } catch (error) {
            responseContent.innerHTML = `<p style="color: var(--error-color)">Error: ${error.message}</p>`;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Get Biblical Insights';
        }
    }

    // Event listeners
    submitButton.addEventListener('click', handleQuestionSubmit);
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleQuestionSubmit();
        }
    });
});
