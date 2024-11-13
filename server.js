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
            model: "gpt-3.5-turbo",
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
            model: "gpt-3.5-turbo",
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});