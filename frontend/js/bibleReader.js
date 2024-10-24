import { bibleAPI } from './api/bible-api.js';

export function initializeBibleReader() {
    const verseContainer = document.querySelector('.verse-container');
    const searchInput = document.querySelector('#verse-search');
    const searchButton = document.querySelector('#search-button');

    async function searchVerse(reference) {
        try {
            verseContainer.innerHTML = '<div class="loading">Loading verse...</div>';
            const verse = await bibleAPI.getVerse(reference);
            displayVerse(verse);
        } catch (error) {
            console.error('Error loading verse:', error);
            verseContainer.innerHTML = `
                <div class="error">
                    Error: ${error.message || 'Failed to load verse. Please try again.'}
                </div>
            `;
        }
    }

    function displayVerse(verse) {
        if (!verse) {
            verseContainer.innerHTML = 'No verse content available.';
            return;
        }

        verseContainer.innerHTML = `
            <div class="verse" data-reference="${verse.reference}">
                <div class="verse-header">
                    <span class="verse-reference">${verse.reference}</span>
                    <span class="verse-version">${verse.version}</span>
                </div>
                <div class="verse-text">${verse.text}</div>
            </div>
        `;
    }

    // Set up event listeners
    searchButton.addEventListener('click', () => {
        const reference = searchInput.value.trim();
        if (reference) {
            searchVerse(reference);
        }
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const reference = searchInput.value.trim();
            if (reference) {
                searchVerse(reference);
            }
        }
    });

    // Load initial verse (John 3:16 as example)
    searchVerse('John 3:16');
}
