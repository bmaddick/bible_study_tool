// Bible API Service Module
class BibleAPIService {
    constructor() {
        this.cache = new Map();
        this.isESVEnabled = false; // Will be true when ESV API key is configured
    }

    async getVerse(reference) {
        if (this.cache.has(reference)) {
            return this.cache.get(reference);
        }

        if (this.isESVEnabled) {
            // ESV API integration will go here when API key is available
            return this.fetchFromESVAPI(reference);
        }

        return this.fetchFromLocalJSON(reference);
    }

    async fetchFromLocalJSON(reference) {
        try {
            const response = await fetch('/data/bible.json');
            const bibleData = await response.json();
            // Parse reference and fetch from local JSON
            const verse = this.parseAndFetchFromJSON(bibleData, reference);
            this.cache.set(reference, verse);
            return verse;
        } catch (error) {
            console.error('Error fetching from local JSON:', error);
            throw error;
        }
    }

    async fetchFromESVAPI(reference) {
        // This will be implemented when ESV API key is available
        throw new Error('ESV API not yet configured');
    }

    parseAndFetchFromJSON(bibleData, reference) {
        // Parse reference format (e.g., "John 3:16")
        const [book, chapter, verse] = this.parseReference(reference);

        // Find the book in the JSON data
        const bookData = bibleData.find(b =>
            b.name.toLowerCase() === book.toLowerCase() ||
            b.abbrev.toLowerCase() === book.toLowerCase()
        );

        if (!bookData) {
            throw new Error(`Book "${book}" not found`);
        }

        // Get the verse from the specified chapter
        const chapterIndex = parseInt(chapter) - 1;
        const verseIndex = parseInt(verse) - 1;

        if (!bookData.chapters[chapterIndex] ||
            !bookData.chapters[chapterIndex][verseIndex]) {
            throw new Error(`Verse ${reference} not found`);
        }

        return {
            reference,
            text: bookData.chapters[chapterIndex][verseIndex],
            version: this.isESVEnabled ? 'ESV' : 'KJV'
        };
    }

    parseReference(reference) {
        // Basic reference parser (e.g., "John 3:16" -> ["John", "3", "16"])
        const match = reference.match(/^(\d?\s*\w+)\s+(\d+):(\d+)$/);
        if (!match) {
            throw new Error(`Invalid reference format: ${reference}`);
        }
        return [match[1], match[2], match[3]];
    }

    // Method to enable ESV API when key becomes available
    enableESVAPI(apiKey) {
        this.apiKey = apiKey;
        this.isESVEnabled = true;
    }
}

// Export a singleton instance
export const bibleAPI = new BibleAPIService();
