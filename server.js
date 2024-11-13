import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

app.post('/api/gpt/analyze', async (req, res) => {
    try {
        const { verses, prompt } = req.body;
        if (!verses || !Array.isArray(verses)) {
            return res.status(400).json({ error: 'Invalid verses format' });
        }

        // Initialize OpenAI configuration
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});