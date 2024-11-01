// Service for displaying Bible verses with proper HTML structure
export class DisplayService {
    static createVerseElement(verse) {
        const verseElement = document.createElement('div');
        verseElement.className = 'verse';
        verseElement.dataset.reference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

        const verseNumberSpan = document.createElement('span');
        verseNumberSpan.className = 'verse-number';
        verseNumberSpan.setAttribute('data-verse-number', verse.verse.toString());
        verseNumberSpan.textContent = verse.verse;

        const referenceSpan = document.createElement('span');
        referenceSpan.className = 'verse-reference';
        referenceSpan.textContent = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

        const textSpan = document.createElement('span');
        textSpan.className = 'verse-text';
        textSpan.textContent = verse.text;

        verseElement.appendChild(verseNumberSpan);
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
