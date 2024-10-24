export function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSubmit = document.getElementById('searchSubmit');
    const searchResults = document.getElementById('searchResults');

    async function searchBible(query) {
        try {
            const response = await fetch('../data/bible.json');
            const bibleData = await response.json();
            const results = findVerses(bibleData, query);
            displayResults(results);
        } catch (error) {
            console.error('Error searching Bible:', error);
            searchResults.innerHTML = 'Error searching Bible content. Please try again later.';
        }
    }

    function findVerses(data, query) {
        if (!data || !data.verses) return [];
        return data.verses.filter(verse =>
            verse.reference.toLowerCase().includes(query.toLowerCase()) ||
            verse.text.toLowerCase().includes(query.toLowerCase())
        );
    }

    function displayResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = 'No verses found.';
            return;
        }

        const content = results.map(verse => `
            <div class="search-result">
                <strong>${verse.reference}</strong>
                <p>${verse.text}</p>
            </div>
        `).join('');

        searchResults.innerHTML = content;
    }

    searchSubmit.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchBible(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchBible(query);
            }
        }
    });
}
