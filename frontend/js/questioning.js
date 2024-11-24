// Import aiService (keeping existing import)
import { aiService } from './aiService.js';
import { API_URL } from './config.js';

// Chat state management
let currentThreadId = null;
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const chatHistory = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Initialize chat thread
    async function initializeChat() {
        try {
            showLoading(true);
            const response = await fetch(`${API_URL}/api/assistant/thread`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to start chat session');
            }

            const data = await response.json();
            currentThreadId = data.threadId;
            appendSystemMessage('Chat session started. How can I help you study the Bible today?');
        } catch (error) {
            console.error('Error initializing chat:', error);
            appendErrorMessage('Failed to start chat session. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    // Send message and get response
    async function sendMessage(message) {
       
        if (!currentThreadId || !message.trim()) return;

        try {
            showLoading(true);
            appendUserMessage(message);
            messageInput.value = '';

            const response = await fetch(`${API_URL}/api/assistant/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: currentThreadId,
                    message: message
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to process message');
            }

            const data = await response.json();
            appendAssistantMessage(data.messages[0]);
            
        } catch (error) {
            console.error('Error sending message:', error);
            appendErrorMessage('Failed to get response. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    // UI Helper Functions
    function appendUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
        
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function appendAssistantMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant-message';
        messageDiv.style.cssText = `
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 0.5rem auto 0.5rem 0;
            max-width: 80%;
            background-color: var(--background-color);
            color: var(--text-color);
            border: 1px solid #E2E8F0;
        `;
        messageDiv.innerHTML = formatMessage(message);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function appendSystemMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message';
        messageDiv.style.cssText = `
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 0.5rem auto;
            text-align: center;
            background-color: var(--background-color);
            color: var(--text-color);
            border: 1px solid #E2E8F0;
            font-style: italic;
        `;
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function appendErrorMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message error-message';
        messageDiv.style.cssText = `
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 0.5rem auto;
            text-align: center;
            background-color: #FEE2E2;
            color: #991B1B;
            border: 1px solid #FCA5A5;
        `;
        messageDiv.innerHTML = `<p>⚠️ ${message}</p>`;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function showLoading(show) {
        isLoading = show;
        loadingIndicator.style.display = show ? 'block' : 'none';
        sendButton.disabled = show;
        messageInput.disabled = show;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatMessage(text) {
        return text
            .split('\n\n')
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');
    }

    // Event listeners
    initializeChat();
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message && !isLoading) {
            sendMessage(message);
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // Add event listener for new conversation button
    document.getElementById('new-conversation').addEventListener('click', () => {
        if (!isLoading) {
            showLoading(true);
            chatHistory.innerHTML = ''; // Clear chat history
            messageInput.value = ''; // Clear input field
            initializeChat() // Start new chat thread
                .catch(error => {
                    console.error('Error:', error);
                    appendErrorMessage('Failed to start new conversation');
                })
                .finally(() => {
                    showLoading(false);
                });
        }
    });

});
