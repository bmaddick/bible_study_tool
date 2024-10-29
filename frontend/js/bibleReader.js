import { bibleAPI } from './api/bible-api.js';

export function initializeBibleReader() {
    const searchInput = document.querySelector('#verse-search');
    const searchButton = document.querySelector('#search-button');
    const searchError = document.querySelector('#search-error');

    // Function to display search error messages
    function showSearchError(message) {
        if (searchError) {
            searchError.textContent = message;
            searchError.style.display = 'block';
            setTimeout(() => {
                searchError.style.display = 'none';
            }, 3000);
        }
    }

    // Function to highlight searched verse
    function highlightSearchedVerse(reference) {
        const verseElement = document.querySelector(`[data-reference="${reference}"]`);
        if (verseElement) {
            verseElement.classList.add('search-highlight');
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                verseElement.classList.remove('search-highlight');
            }, 3000);
            return true;
        }
        return false;
    }

    // Function to parse verse reference
    function parseVerseReference(reference) {
        const parts = reference.trim().split(' ');
        if (parts.length < 2) {
            throw new Error('Invalid verse reference format. Please use format: "Book Chapter:Verse" (e.g., "Genesis 1:1")');
        }

        const chapter = parts[parts.length - 1];
        const book = parts.slice(0, -1).join(' ');

        if (!chapter.includes(':')) {
            throw new Error('Please include verse number (e.g., "Genesis 1:1")');
        }

        const [chapterNum, verseNum] = chapter.split(':');
        return {
            book,
            chapter: parseInt(chapterNum),
            verse: parseInt(verseNum)
        };
    }

    // Handle verse search
    async function handleVerseSearch(reference) {
        try {
            const parsedRef = parseVerseReference(reference);
            const fullReference = `${parsedRef.book} ${parsedRef.chapter}:${parsedRef.verse}`;

            // Use the shared bibleService instance
            const bibleService = window.bibleService;
            if (!bibleService) {
                throw new Error('Bible service not initialized');
            }

            // Let verseLinking service handle chapter display
            const verseLinkingEvent = new CustomEvent('displayChapter', {
                detail: {
                    book: parsedRef.book,
                    chapter: parsedRef.chapter,
                    highlightVerse: parsedRef.verse
                }
            });
            document.dispatchEvent(verseLinkingEvent);

        } catch (error) {
            console.error('Search error:', error);
            showSearchError(error.message);
        }
    }

    // Set up search event listeners
    searchButton.addEventListener('click', () => {
        const reference = searchInput.value.trim();
        if (reference) {
            handleVerseSearch(reference);
        }
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const reference = searchInput.value.trim();
            if (reference) {
                handleVerseSearch(reference);
            }
        }
    });
}
