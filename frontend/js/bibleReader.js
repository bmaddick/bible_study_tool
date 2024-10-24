export function initializeBibleReader() {
    const verseContainer = document.querySelector('.verse-container');

    async function loadBibleData() {
        try {
            const response = await fetch('../data/bible.json');
            const bibleData = await response.json();
            displayBibleContent(bibleData);
        } catch (error) {
            console.error('Error loading Bible data:', error);
            verseContainer.innerHTML = 'Error loading Bible content. Please try again later.';
        }
    }

    function displayBibleContent(data) {
        if (!data || !data.verses) {
            verseContainer.innerHTML = 'No Bible content available.';
            return;
        }

        const content = data.verses.map(verse => `
            <div class="verse" data-reference="${verse.reference}">
                <span class="verse-reference">${verse.reference}</span>
                <span class="verse-text">${verse.text}</span>
            </div>
        `).join('');

        verseContainer.innerHTML = content;
    }

    // Load initial content
    loadBibleData();
}
