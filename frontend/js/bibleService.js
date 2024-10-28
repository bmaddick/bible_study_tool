// Bible Service for handling ASV Bible data
export class BibleService {
    constructor() {
        this.verses = null;
        this.verseIndex = new Map(); // Maps "Book Chapter:Verse" to verse data
        this.initialized = false;
        this.initializationError = null;
    }

    async initialize() {
        if (this.initialized) return;
        if (this.initializationError) throw this.initializationError;

        try {
            console.log('Initializing Bible Service...');
            const response = await fetch('./data/asv.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch ASV data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('ASV data loaded, checking structure...');

            // Handle both possible JSON structures
            if (data.verses) {
                this.verses = data.verses;
            } else if (Array.isArray(data)) {
                this.verses = data;
            } else {
                throw new Error('Invalid ASV data structure: expected verses property or array');
            }

            console.log('Verses accessed, building index...');
            console.log('First verse structure:', this.verses[Object.keys(this.verses)[0]]);

            // Build verse index for efficient lookup
            let verseCount = 0;
            for (const [key, verse] of Object.entries(this.verses)) {
                if (verse && verse.book_name && verse.chapter && verse.verse) {
                    const reference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
                    this.verseIndex.set(reference, verse);
                    verseCount++;
                    if (verseCount % 5000 === 0) {
                        console.log(`Indexed ${verseCount} verses...`);
                    }
                }
            }

            this.initialized = true;
            console.log(`Bible Service initialized successfully with ${verseCount} verses indexed`);
            console.log('Sample verse keys:', Array.from(this.verseIndex.keys()).slice(0, 3));
        } catch (error) {
            this.initializationError = error;
            console.error('Error initializing Bible Service:', error);
            throw error;
        }
    }

    async getVerse(reference) {
        await this.initialize();
        console.log(`Looking up verse: ${reference}`);

        const verse = this.verseIndex.get(reference);
        if (verse) {
            console.log(`Found verse: ${reference}`, verse);
            return verse;
        }

        console.warn(`Verse not found: ${reference}`);
        console.log('Available references:', Array.from(this.verseIndex.keys()).slice(0, 5));
        throw new Error(`Verse not found: ${reference}`);
    }

    async searchVerses(query) {
        await this.initialize();
        console.log(`Searching for: ${query}`);

        const results = [];
        const searchTerm = query.toLowerCase();

        for (const verse of this.verseIndex.values()) {
            if (verse.text.toLowerCase().includes(searchTerm)) {
                results.push(verse);
            }
        }

        console.log(`Found ${results.length} verses matching "${query}"`);
        if (results.length > 0) {
            console.log('First match:', results[0]);
        }
        return results;
    }

    async getChapter(book, chapter) {
        await this.initialize();
        console.log(`Getting chapter: ${book} ${chapter}`);

        const results = Array.from(this.verseIndex.values()).filter(verse =>
            verse.book_name === book && verse.chapter === parseInt(chapter)
        );

        console.log(`Found ${results.length} verses in ${book} ${chapter}`);
        if (results.length > 0) {
            console.log('First verse:', results[0]);
        }
        return results;
    }

    // Helper method to get all available books
    async getBooks() {
        await this.initialize();
        const books = new Set(Array.from(this.verseIndex.values()).map(verse => verse.book_name));
        const bookList = Array.from(books).sort();
        console.log('Available books:', bookList);
        return bookList;
    }
}
