# Bible Study Tool Frontend

## Setup

### Configuration
1. Copy the configuration template:
```bash
cp frontend/js/config.template.js frontend/js/config.js
```

2. Edit `frontend/js/config.js` and replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key.

### AI Features
The application includes several AI-powered features:
- Historical Context: Provides historical background for Bible verses
- Theological Insights: Offers theological analysis and interpretation
- Verse Interpretation: Combines multiple analyses for comprehensive understanding
- Theological Q&A: Answers theological questions
- Debate Simulation: Generates theological debates
- Apologetics: Provides apologetics answers
- Translation Notes: Offers translation analysis

## Development
1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Security Notes
- Never commit your `config.js` file containing API keys
- Always use the template file for reference
- Keep your API keys secure and never share them
