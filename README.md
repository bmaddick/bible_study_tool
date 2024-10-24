# Bible Study Tool

A comprehensive Bible study application that combines scripture reading with AI-powered interpretation and theological discussion.

## Features

- View and read the Bible (ESV version)
- Search verses by reference
- AI-assisted verse interpretation including:
  - Generally accepted meanings
  - Translation nuances and debates
  - Related verse references
- Theological Q&A with AI
- Christian theological debate simulation
- Faith discussion and apologetics

## Project Structure

- `/frontend` - Vanilla JavaScript web application
  - `/js` - JavaScript modules
    - `app.js` - Main application entry point
    - `navigation.js` - Navigation and UI state management
    - `bibleReader.js` - Bible content display
    - `search.js` - Verse search functionality
    - `ai.js` - AI interaction features
  - `/css` - Styling
    - `styles.css` - Application styles
  - `/data` - Static data files
    - `bible.json` - ESV Bible verses

## Development

### Prerequisites

- Any modern web browser
- A local web server (e.g., Python's `http.server` or VS Code's Live Server)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/bmaddick/bible_study_tool.git
   cd bible_study_tool
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Python 2
   python -m SimpleHTTPServer 8000
   ```

3. Open your browser:
   Navigate to `http://localhost:8000/frontend/index.html`

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License.
