export function initializeSearch(bibleService) {
    return new Promise((resolve, reject) => {
        const searchInput = document.getElementById('verse-search');
        const searchButton = document.getElementById('search-button');
        const searchError = document.getElementById('search-error');

        if (!searchInput || !searchButton || !searchError) {
            console.error('Search elements not found in DOM');
            reject(new Error('Search elements not found in DOM'));
            return;
        }

        async function searchBible(query) {
            try {
                searchError.style.display = 'none';
                const verse = await bibleService.getVerse(query);
                if (verse) {
                    // If exact verse reference found, display it
                    const [book, chapter] = verse.reference.split(' ');
                    document.dispatchEvent(new CustomEvent('displayChapter', {
                        detail: { book, chapter: parseInt(chapter), highlightVerse: verse.verse }
                    }));
                } else {
                    // If no exact match, search for verses containing the text
                    const results = await bibleService.searchVerses(query);
                    displayResults(results);
                }
            } catch (error) {
                console.error('Error searching Bible:', error);
                searchError.textContent = 'Error searching Bible content. Please try again later.';
                searchError.style.display = 'block';
            }
        }

        function displayResults(results) {
            if (results.length === 0) {
                searchError.textContent = 'No verses found.';
                searchError.style.display = 'block';
                return;
            }

            // Group results by chapter and display first result's chapter
            const firstResult = results[0];
            const [book, chapter] = firstResult.reference.split(' ');

            // Dispatch event to display the chapter containing the first result
            document.dispatchEvent(new CustomEvent('displayChapter', {
                detail: {
                    book,
                    chapter: parseInt(chapter),
                    highlightVerse: firstResult.verse
                }
            }));

            // Create search results summary
            const searchSummary = document.createElement('div');
            searchSummary.classList.add('search-summary');
            searchSummary.textContent = `Found ${results.length} matching verses`;

            // Add search summary above chapter content
            const chapterContainer = document.querySelector('.chapter-container');
            if (chapterContainer) {
                chapterContainer.insertBefore(searchSummary, chapterContainer.firstChild);

                // Remove summary after 5 seconds
                setTimeout(() => {
                    searchSummary.remove();
                }, 5000);
            }
        }

        function highlightVerse(verseNumber) {
            const verseElements = document.querySelectorAll('.verse-number');
            verseElements.forEach(element => {
                if (element.dataset.verseNumber === verseNumber.toString()) {
                    element.classList.add('selected');
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    element.classList.remove('selected');
                }
            });
        }

        // Add click event listener
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchBible(query);
            }
        });

        // Add enter key event listener
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchBible(query);
                }
            }
        });

        // Resolve the promise after successful initialization
        resolve();
    });
}
