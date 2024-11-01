// Service for displaying Bible verses with proper HTML structure
class DisplayService {
    constructor() {
        if (DisplayService.instance) {
            return DisplayService.instance;
        }
        this.initialized = false;
        DisplayService.instance = this;
        console.log('DisplayService instance created');
    }

    initialize() {
        if (this.initialized) {
            console.log('DisplayService already initialized');
            return Promise.resolve();
        }

        console.log('Initializing DisplayService...');
        this.initialized = true;
        return Promise.resolve();
    }

    createVerseElement(verse) {
        console.log('Creating verse element:', verse);
        const verseContainer = document.createElement('div');
        verseContainer.className = 'verse';
        verseContainer.dataset.reference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

        const verseNumberSpan = document.createElement('span');
        verseNumberSpan.className = 'verse-number';
        verseNumberSpan.setAttribute('data-verse-number', verse.verse.toString());
        verseNumberSpan.textContent = verse.verse;

        const verseContentDiv = document.createElement('div');
        verseContentDiv.className = 'verse-content';

        const referenceSpan = document.createElement('span');
        referenceSpan.className = 'verse-reference';
        referenceSpan.textContent = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

        const textSpan = document.createElement('span');
        textSpan.className = 'verse-text';
        textSpan.textContent = verse.text;

        verseContentDiv.appendChild(referenceSpan);
        verseContentDiv.appendChild(textSpan);

        verseContainer.appendChild(verseNumberSpan);
        verseContainer.appendChild(verseContentDiv);

        // Add highlighting if specified
        if (verse.isHighlighted || verse.highlighted) {
            console.log('Highlighting verse:', verse.verse);
            verseContainer.classList.add('verse-highlighted');
            verseNumberSpan.classList.add('highlighted');
        }

        // Add selection class if specified
        if (verse.isSelected) {
            verseContainer.classList.add('selected');
            verseNumberSpan.classList.add('selected');
        }

        return verseContainer;
    }

    displaySearchResults(results, container) {
        console.log('Displaying search results:', results.length);
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

    displayVerse(verse, container) {
        console.log('Displaying single verse:', verse);
        container.innerHTML = '';
        const verseElement = this.createVerseElement(verse);
        container.appendChild(verseElement);
    }
}

// Create and export singleton instance
const displayService = new DisplayService();
export { displayService as DisplayService };
