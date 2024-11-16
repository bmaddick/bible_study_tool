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

   /* // Function to parse verse reference
    function parseVerseReference(reference) {
       // Normalize case first
        reference = reference.toLowerCase();

        // Then normalize ordinals and word numbers
        reference = reference
            .replace(/(\\d+)st\\b/g, '$1')
            .replace(/(\\d+)nd\\b/g, '$1')
            .replace(/(\\d+)rd\\b/g, '$1')
            .replace(/(\\d+)th\\b/g, '$1')
            .replace(/first/g, '1')
            .replace(/second/g, '2')
            .replace(/third/g, '3');

        // Remove the verse number requirement and just split into book and chapter
        const parts = reference.split(' ');
        if (parts.length < 2) {
            throw new Error('Invalid reference format. Please use format: "Book Chapter" (e.g., "Genesis 1")');
        }

        const lastPart = parts[parts.length - 1];
        // Capitalize each word in the book name
        const book = parts.slice(0, -1).join(' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        if (lastPart.includes(':')) {
            const [chapterNum, verseNum] = lastPart.split(':');
            return {
                book: book,  // This will now be properly capitalized
                chapter: parseInt(chapterNum),
                verse: parseInt(verseNum)
            };
        } else {
            return {
                book: book,  // This will now be properly capitalized
                chapter: parseInt(lastPart),
                verse: 1
            };
        }
    }

    // Handle verse search
    async function handleVerseSearch(reference) {
        try {
            const parsedRef = parseVerseReference(reference);
            // Book name is already properly capitalized by parseVerseReference
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
    }*/

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
