// Bible API Service Module
class BibleAPIService {
    constructor() {
        this.cache = new Map();
        this.version = 'ASV';
    }

    async getVerse(reference) {
        if (this.cache.has(reference)) {
            return this.cache.get(reference);
        }
        return this.fetchFromLocalJSON(reference);
    }

    async fetchFromLocalJSON(reference) {
        try {
            const response = await fetch('/data/asv.json');
            const bibleData = await response.json();
            // Parse reference and fetch from local JSON
            const verse = this.parseAndFetchFromJSON(bibleData, reference);
            this.cache.set(reference, verse);
            return verse;
        } catch (error) {
            console.error('Error fetching from local JSON:', error);
            throw new Error(`Failed to fetch verse ${reference}: ${error.message}`);
        }
    }

    parseAndFetchFromJSON(bibleData, reference) {
        // Parse reference format (e.g., "John 3:16")
        const [book, chapter, verse] = this.parseReference(reference);

        // Find the book in ASV data
        const bookData = bibleData[book.toLowerCase()];
        if (!bookData) {
            throw new Error(`Book ${book} not found`);
        }

        // Find the chapter
        const chapterData = bookData[parseInt(chapter)];
        if (!chapterData) {
            throw new Error(`Chapter ${chapter} not found in ${book}`);
        }

        // Find the verse
        const verseText = chapterData[parseInt(verse)];
        if (!verseText) {
            throw new Error(`Verse ${verse} not found in ${book} ${chapter}`);
        }

        return {
            reference,
            text: verseText,
            version: this.version
        };
    }

    parseReference(reference) {
        // Basic reference parser (e.g., "John 3:16" -> ["John", "3", "16"])
        const match = reference.match(/^(\d?\s*\w+)\s+(\d+):(\d+)$/);
        if (!match) {
            throw new Error(`Invalid reference format: ${reference}. Expected format: "Book Chapter:Verse" (e.g., "John 3:16")`);
        }
        return [match[1].trim(), match[2], match[3]];
    }

    getVersion() {
        return this.version;
    }
}

// Export a singleton instance
export const bibleAPI = new BibleAPIService();
