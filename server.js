import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

// Initialize OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/gpt/analyze', async (req, res) => {
    try {
        const { verses, prompt } = req.body;
        if (!verses || !Array.isArray(verses)) {
            return res.status(400).json({ error: 'Invalid verses format' });
        }

        

        // Make API call to GPT using the prompt from aiService
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [{ role: "user", content: prompt }]
        });

        // Send response
        res.json({
            html: completion.choices[0].message.content
                .split('\\n\\n')  // Split on double newlines for paragraphs
                .map(para => `<p>${para.replace(/\\n/g, '<br>')}</p>`)  // Convert single newlines to <br>
                .join('')
        });
    } catch (error) {
        console.error('Error in /api/gpt/analyze:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/gpt/historical-context', async (req, res) => {
    try {
        const { verses, prompt } = req.body;
        if (!verses || !Array.isArray(verses)) {
            return res.status(400).json({ error: 'Invalid verses format' });
        }

        console.log('Received historical context request for verses:', verses);
        console.log('Using prompt:', prompt);

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [{ role: "user", content: prompt }]
        });

        if (!completion || !completion.choices || !completion.choices[0]) {
            console.error('Invalid API response structure:', completion);
            return res.status(500).json({ error: 'Invalid API response structure' });
        }

        // Send response with the same newline formatting we implemented earlier
        res.json({
            html: completion.choices[0].message.content
                .split('\\n\\n')
                .map(para => `<p>${para.replace(/\\n/g, '<br>')}</p>`)
                .join('')
        });

    } catch (error) {
        console.error('Error in /api/gpt/historical-context:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.post('/api/gpt/theological-insights', async (req, res) => {
    try {
        const { verses, prompt } = req.body;

        if (!verses || !Array.isArray(verses)) {
            return res.status(400).json({ error: 'Invalid verses format' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [
                {
                    role: "system",
                    content: `You are a knowledgeable theologian with expertise in Protestant theology and biblical interpretation. Your responses should be biblically grounded and focused on theological implications.`
                },
                {
                    role: "user",
                    content: prompt || `Analyze the theological significance of these Bible verses: ${verses.join(', ')}. Consider:
                        1. Key theological themes and doctrines present
                        2. How this passage contributes to our understanding of God's character
                        3. Implications for Christian faith and practice
                        4. Connection to the broader biblical narrative and redemptive history

                        Format your response with clear paragraphs and line breaks for readability.`
                }
            ]
        });

        const formattedResponse = completion.choices[0].message.content
            .split('\\n')
            .map(line => `<p>${line}</p>`)
            .join('');

        res.json({ html: formattedResponse });
    } catch (error) {
        console.error('Error in theological insights:', error);
        res.status(500).json({ error: 'Failed to get theological insights' });
    }
});

app.post('/api/gpt/question', async (req, res) => {
    try {
        const { question, prompt } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [
                {
                    role: "system",
                    content: `You are a knowledgeable theologian with expertise in Protestant theology and biblical interpretation. Your responses should be biblically grounded, balanced, and focused on providing clear, helpful answers to theological questions.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const formattedResponse = completion.choices[0].message.content
            .split('\n')
            .map(line => line.trim() ? `<p>${line}</p>` : '')
            .join('');

        res.json({ html: formattedResponse });
    } catch (error) {
        console.error('Error analyzing question:', error);
        res.status(500).json({ error: 'Failed to analyze question' });
    }
});

// Assistant ID for Bible Study
const ASSISTANT_ID = 'asst_9BmgeQ4ztUCjhZU3cKHOgkP2';

// Create a new thread
app.post('/api/assistant/thread', async (req, res) => {
    try {
        console.log('Creating new thread with Assistant ID:', ASSISTANT_ID);
        const thread = await openai.beta.threads.create();
        console.log('Thread created:', thread);
        res.json({ threadId: thread.id });
    } catch (error) {
        console.error('Detailed error in thread creation:', error);
        res.status(500).json({
            error: 'Failed to create thread',
            details: error.message,
            stack: error.stack
        });
    }
});

// Send message and get response
app.post('/api/assistant/message', async (req, res) => {
    try {
        const { threadId, message } = req.body;
        console.log('Adding message to thread:', threadId);

        // Add the user's message to the thread
        const threadMessage = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message
        });
        console.log('Message added:', threadMessage);

        // Run the assistant
        console.log('Running assistant on thread');
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID
        });

        // Wait for the run to complete
        let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
            console.log('Run status:', runStatus.status);
        }

        if (runStatus.status === 'completed') {
            // Get the assistant's messages
            const messages = await openai.beta.threads.messages.list(threadId);
            const assistantMessages = messages.data
                .filter(msg => msg.role === 'assistant')
                .map(msg => msg.content[0].text.value);

            console.log('Assistant messages:', assistantMessages);
            res.json({ messages: assistantMessages });
        } else {
            throw new Error(`Run failed with status: ${runStatus.status}`);
        }
    } catch (error) {
        console.error('Error in message handling:', error);
        res.status(500).json({
            error: 'Failed to process message',
            details: error.message,
            stack: error.stack
        });
    }
});

// Get thread history
app.get('/api/assistant/history/:threadId', async (req, res) => {
    try {
        const { threadId } = req.params;
        const messages = await openai.beta.threads.messages.list(threadId);

        const formattedMessages = messages.data.map(msg => ({
            role: msg.role,
            content: msg.content[0].text.value
        }));

        res.json({ messages: formattedMessages });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch message history' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
