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
        verseContainer.dataset.verseNumber = verse.verse.toString();

        const verseNumberDiv = document.createElement('div');
        verseNumberDiv.className = 'verse-number';
        verseNumberDiv.setAttribute('data-verse-number', verse.verse.toString());
        verseNumberDiv.setAttribute('tabindex', '0');
        verseNumberDiv.textContent = verse.verse;

        const verseContentDiv = document.createElement('div');
        verseContentDiv.className = 'verse-content';

        const referenceDiv = document.createElement('div');
        referenceDiv.className = 'verse-reference';
        referenceDiv.textContent = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

        const textDiv = document.createElement('div');
        textDiv.className = 'verse-text';
        textDiv.textContent = verse.text;

        verseContentDiv.appendChild(referenceDiv);
        verseContentDiv.appendChild(textDiv);

        verseContainer.appendChild(verseNumberDiv);
        verseContainer.appendChild(verseContentDiv);

        // Add highlighting if specified
        if (verse.isHighlighted || verse.highlighted) {
            console.log('Highlighting verse:', verse.verse);
            verseContainer.classList.add('verse-highlighted');
            verseContentDiv.classList.add('verse-content-highlighted');
            verseNumberDiv.classList.add('verse-number-highlighted');
        }

        // Add selection class if specified
        if (verse.isSelected) {
            verseContainer.classList.add('selected');
            verseNumberDiv.classList.add('selected');
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
