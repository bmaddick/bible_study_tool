// Service for displaying Bible verses with proper HTML structure
export class DisplayService {
    static createVerseElement(verse) {
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
