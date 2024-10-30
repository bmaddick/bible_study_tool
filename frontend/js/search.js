export function initializeSearch(bibleService, verseLinkingService) {
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
                if (!query || typeof query !== 'string') {
                    throw new Error('Please enter a valid verse reference');
                }

                // Clean and normalize the input
                const cleanQuery = query.trim().replace(/\s+/g, ' ');

                // Initialize variables
                let book, chapter, verseStart, verseEnd;

                // Handle book-only reference (e.g., "John")
                if (!cleanQuery.includes(' ')) {
                    book = cleanQuery;
                    chapter = 1;
                    verseStart = 1;
                    verseEnd = 1;
                } else {
                    // Handle references with spaces
                    const parts = cleanQuery.split(':');
                    const beforeColon = parts[0].trim();
                    const spaceParts = beforeColon.split(' ');

                    // Extract book and chapter
                    chapter = parseInt(spaceParts[spaceParts.length - 1]);
                    book = spaceParts.slice(0, -1).join(' ');

                    if (parts.length === 1) {
                        // Chapter-only reference (e.g., "John 3")
                        verseStart = 1;
                        verseEnd = 1;
                    } else {
                        // Verse reference (e.g., "John 3:16" or "John 3:16-20")
                        const verseParts = parts[1].split('-');
                        verseStart = parseInt(verseParts[0]);
                        verseEnd = verseParts.length > 1 ? parseInt(verseParts[1]) : verseStart;
                    }
                }

                if (!book) {
                    throw new Error('Please enter a valid book name');
                }

                try {
                    // Construct query for BibleService
                    const formattedQuery = `${book} ${chapter}:${verseStart}${verseEnd !== verseStart ? `-${verseEnd}` : ''}`;
                    const verses = await bibleService.getVerse(formattedQuery);

                    if (verses) {
                        const verseArray = Array.isArray(verses) ? verses : [verses];
                        const highlightVerses = verseArray.map(v => parseInt(v.verse));

                        document.dispatchEvent(new CustomEvent('displayChapter', {
                            detail: {
                                book,
                                chapter,
                                highlightVerses
                            }
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching verses:', error);
                    throw new Error('Error fetching Bible content. Please check your reference and try again.');
                }
            } catch (error) {
                console.error('Error searching Bible:', error);
                searchError.textContent = error.message || 'Error searching Bible content. Please try again later.';
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
                    highlightVerses: [firstResult.verse]
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

        function highlightVerse(verseNumbers) {
            const verseElements = document.querySelectorAll('[data-verse-number]');
            const versesToHighlight = Array.isArray(verseNumbers) ? verseNumbers : [verseNumbers];

            // Remove all existing highlights first
            verseElements.forEach(element => {
                element.classList.remove('selected');
            });

            // Add highlights to specified verses
            verseElements.forEach(element => {
                const verseNum = parseInt(element.dataset.verseNumber);
                if (versesToHighlight.includes(verseNum)) {
                    element.classList.add('selected');
                    if (verseNum === versesToHighlight[0]) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
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
