// Bible API Service Module
class BibleAPIService {
    constructor() {
        this.cache = new Map();
        this.version = 'ASV';
        this.bibleData = null;
        this.bookIndexMap = new Map();
        this.bookNameVariants = new Map();
    }

    async getVerse(reference) {
        if (this.cache.has(reference)) {
            return this.cache.get(reference);
        }
        return this.fetchFromLocalJSON(reference);
    }

    async fetchFromLocalJSON(reference) {
        try {
            if (!this.bibleData) {
                console.log('Loading ASV Bible data from JSON file...');
                const response = await fetch('/data/asv.json');
                this.bibleData = await response.json();

                // Validate the loaded data structure
                if (!this.bibleData || typeof this.bibleData !== 'object' || !this.bibleData.verses) {
                    throw new Error('Invalid Bible data structure: root must be an object with verses property');
                }

                console.log('Bible data loaded:', {
                    hasVerses: !!this.bibleData.verses,
                    metadata: this.bibleData.metadata,
                    verseCount: Object.keys(this.bibleData.verses).length
                });
                this.buildBookIndexMap();
            }
            // Parse reference and fetch from local JSON
            const verse = this.parseAndFetchFromJSON(reference);
            this.cache.set(reference, verse);
            return verse;
        } catch (error) {
            console.error('Error fetching from local JSON:', error);
            throw new Error(`Failed to fetch verse ${reference}: ${error.message}`);
        }
    }

    buildBookIndexMap() {
        // Build index map for efficient book lookup
        console.log('Building book index map...');
        const bookNames = new Set();

        // Iterate through the array to find first occurrence of each book
        for (let i = 0; i < this.bibleData.length; i++) {
            const verse = this.bibleData[i];
            if (!verse || !verse.book_name) continue;

            const normalizedName = verse.book_name;
            if (!bookNames.has(normalizedName)) {
                this.bookIndexMap.set(normalizedName, i);
                bookNames.add(normalizedName);
                console.log('Added book name:', normalizedName, 'at index:', i);

                // Add singular/plural variants
                if (normalizedName === 'Psalms') {
                    this.bookNameVariants.set('Psalm', normalizedName);
                    console.log('Added variant mapping:', 'Psalm', '->', normalizedName);
                }
            }
        }
        console.log('Available book names:', Array.from(bookNames).sort());
        console.log('Book name variants:', Object.fromEntries(this.bookNameVariants));
    }

    normalizeBookName(bookName) {
        // Check for known variants first
        console.log('Normalizing book name:', bookName);
        if (this.bookNameVariants.has(bookName)) {
            const normalized = this.bookNameVariants.get(bookName);
            console.log('Found variant mapping:', bookName, '->', normalized);
            return normalized;
        }
        console.log('No variant found, using original:', bookName);
        return bookName;
    }

    parseAndFetchFromJSON(reference) {
        // Parse reference format (e.g., "John 3:16")
        const [bookName, chapter, verse] = this.parseReference(reference);
        const normalizedBookName = this.normalizeBookName(bookName);
        console.log('Looking up verse with normalized book name:', normalizedBookName);

        // Validate Bible data
        if (!this.bibleData || !this.bibleData.verses) {
            throw new Error('Invalid Bible data structure: data must contain verses object');
        }

        // Search for the specific verse
        const targetChapter = parseInt(chapter);
        const targetVerse = parseInt(verse);
        let verseObj = null;

        // Search through verses object
        for (const key in this.bibleData.verses) {
            const currentVerse = this.bibleData.verses[key];

            if (currentVerse.book_name === normalizedBookName &&
                parseInt(currentVerse.chapter) === targetChapter &&
                parseInt(currentVerse.verse) === targetVerse) {
                verseObj = currentVerse;
                console.log('Found matching verse:', verseObj);
                break;
            }
        }

        if (!verseObj) {
            console.log('Failed to find verse:', { book: normalizedBookName, chapter: targetChapter, verse: targetVerse });
            throw new Error(`Verse ${chapter}:${verse} not found in ${bookName}`);
        }

        return {
            reference,
            text: verseObj.text,
            version: this.version
        };
    }

    parseReference(reference) {
        // Basic reference parser (e.g., "John 3:16" -> ["John", "3", "16"])
        const match = reference.match(/^(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)$/);
        if (!match) {
            throw new Error(`Invalid reference format: ${reference}. Expected format: "Book Chapter:Verse" (e.g., "John 3:16")`);
        }
        const bookName = match[1].trim();
        console.log(`Parsed reference "${reference}" into book: "${bookName}", chapter: ${match[2]}, verse: ${match[3]}`);
        return [bookName, match[2], match[3]];
    }

    getVersion() {
        return this.version;
    }
}

// Export a singleton instance
export const bibleAPI = new BibleAPIService();
