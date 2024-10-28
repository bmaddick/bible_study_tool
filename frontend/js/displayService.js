// Service for displaying Bible verses with proper HTML structure
export class DisplayService {
    static createVerseElement(verse) {
        const verseElement = document.createElement('div');
        verseElement.className = 'verse';
        verseElement.dataset.reference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

        const referenceSpan = document.createElement('span');
        referenceSpan.className = 'verse-reference';
        referenceSpan.textContent = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

        const textSpan = document.createElement('span');
        textSpan.className = 'verse-text';
        textSpan.textContent = verse.text;

        verseElement.appendChild(referenceSpan);
        verseElement.appendChild(textSpan);

        return verseElement;
    }

    static displaySearchResults(results, container) {
        container.innerHTML = '';
        if (results.length === 0) {
            container.textContent = 'No verses found.';
            return;
        }

        results.forEach(verse => {
            const verseElement = this.createVerseElement(verse);
            container.appendChild(verseElement);
        });
    }

    static displayVerse(verse, container) {
        container.innerHTML = '';
        const verseElement = this.createVerseElement(verse);
        container.appendChild(verseElement);
    }
}
```

Now let's update the test-bible-new.html to use this display service.

<edit_file file="/home/ubuntu/bible_study_tool/frontend/test-bible-new.html">
```html
<!DOCTYPE html>
<html>
<head>
    <title>Bible Service Test</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/highlight-styles.css">
</head>
<body>
    <h1>Bible Service Test</h1>

    <div class="controls">
        <input type="text" id="verseInput" placeholder="Enter verse (e.g., Genesis 1:1)">
        <button id="lookupBtn">Look up verse</button>

        <input type="text" id="searchInput" placeholder="Search text">
        <button id="searchBtn">Search</button>
    </div>

    <div id="results"></div>

    <div id="highlightToolbar" class="highlight-toolbar" style="display: none;">
        <button class="highlight-btn">Highlight</button>
        <button class="meaning-btn">Get Meaning</button>
        <button class="related-btn">Find Related</button>
    </div>

    <script type="module">
        import { BibleService } from './js/bibleService.js';
        import { HighlightService } from './js/highlightService.js';
        import { DisplayService } from './js/displayService.js';

        const bibleService = new BibleService();
        const highlightService = new HighlightService();
        const resultsContainer = document.getElementById('results');

        // Initialize services
        async function init() {
            try {
                await bibleService.initialize();
                highlightService.initialize();
                document.getElementById('lookupBtn').disabled = false;
                document.getElementById('searchBtn').disabled = false;
            } catch (error) {
                console.error('Initialization error:', error);
                resultsContainer.textContent = 'Error initializing Bible service: ' + error.message;
            }
        }

        // Verse lookup
        document.getElementById('lookupBtn').addEventListener('click', async () => {
            const reference = document.getElementById('verseInput').value;
            try {
                const verse = await bibleService.getVerse(reference);
                DisplayService.displayVerse(verse, resultsContainer);
            } catch (error) {
                resultsContainer.textContent = error.message;
            }
        });

        // Search
        document.getElementById('searchBtn').addEventListener('click', async () => {
            const query = document.getElementById('searchInput').value;
            try {
                const results = await bibleService.searchVerses(query);
                DisplayService.displaySearchResults(results, resultsContainer);
            } catch (error) {
                resultsContainer.textContent = error.message;
            }
        });

        // Initialize on page load
        init();
    </script>
</body>
</html>
