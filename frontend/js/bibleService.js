// Bible Service for handling ASV Bible data
export class BibleService {
    constructor() {
        this.verses = null;
        this.verseIndex = new Map(); // Maps "Book Chapter:Verse" to verse data
        this.initialized = false;
        this.initializationError = null;
    }

    isValidVerse(verse) {
        return verse &&
            typeof verse === 'object' &&
            typeof verse.book_name === 'string' &&
            typeof verse.chapter === 'number' &&
            typeof verse.verse === 'number' &&
            typeof verse.text === 'string';
    }

    // Parse reference into standardized format and handle verse ranges
    parseReference(reference) {
        console.log(`Parsing reference: ${reference}`);
        // Remove any text after hyphen and trim
        reference = reference.split(' - ')[0].trim();

        // Convert numeric prefixes to written form
        reference = reference.replace(/^(\d+)\s+/, (match, num) => {
            const numbers = ['First', 'Second', 'Third'];
            return `${numbers[parseInt(num) - 1] || num} `;
        });

        // Match patterns for different formats
        const patterns = [
            // Full verse reference with optional range
            /^((?:First|Second|Third|[123])\s+)?([A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/,
            /^([A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/,
            // Chapter-only reference
            /^((?:First|Second|Third|[123])\s+)?([A-Za-z]+)\s+(\d+)$/,
            /^([A-Za-z]+)\s+(\d+)$/,
            // Book-only reference
            /^((?:First|Second|Third|[123])\s+)?([A-Za-z]+)$/,
            /^([A-Za-z]+)$/
        ];

        let match = null;
        let matchedPattern = -1;
        for (let i = 0; i < patterns.length; i++) {
            match = reference.match(patterns[i]);
            if (match) {
                matchedPattern = i;
                break;
            }
        }

        if (!match) {
            console.warn(`Invalid reference format: ${reference}`);
            throw new Error(`Invalid reference format: ${reference}`);
        }

        const references = [];

        if (matchedPattern <= 1) {
            // Full verse reference with optional range
            const [_, prefix, bookName, chapter, startVerse, endVerse] = match;
            const book = prefix ? `${prefix}${bookName}` : bookName;
            const start = parseInt(startVerse);
            const end = endVerse ? parseInt(endVerse) : start;

            for (let verse = start; verse <= end; verse++) {
                references.push({
                    book,
                    chapter: parseInt(chapter),
                    verse,
                    reference: `${book} ${chapter}:${verse}`
                });
            }
        } else if (matchedPattern <= 3) {
            // Chapter-only reference
            const [_, prefix, bookName, chapter] = match;
            const book = prefix ? `${prefix}${bookName}` : bookName;
            references.push({
                book,
                chapter: parseInt(chapter),
                verse: 1,
                reference: `${book} ${chapter}`,
                showFullChapter: true
            });
        } else {
            // Book-only reference
            const [_, prefix, bookName] = match;
            const book = prefix ? `${prefix}${bookName}` : (bookName || match[1]);
            references.push({
                book,
                chapter: 1,
                verse: 1,
                reference: book,
                showFullChapter: true
            });
        }

        console.log(`Parsed references:`, references);
        return references;
    }

    async initialize() {
        if (this.initialized) return;
        if (this.initializationError) throw this.initializationError;

        try {
            console.log('Initializing Bible Service...');
            const response = await fetch('data/asv.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch ASV data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('ASV data loaded, checking structure...');

            // Validate root structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid Bible data structure: root must be an object');
            }

            // Check if data has metadata and verses properties
            if (!data.verses || typeof data.verses !== 'object' || !data.metadata) {
                throw new Error('Invalid Bible data structure: must contain metadata and verses objects');
            }

            // Store metadata
            this.metadata = data.metadata;

            // Process and validate verses
            const processedVerses = {};
            let validVerseCount = 0;

            // Iterate through numbered verse objects
            for (const key in data.verses) {
                const verse = data.verses[key];
                if (this.isValidVerse(verse)) {
                    // Create a unique key combining book, chapter, and verse
                    const verseKey = `${verse.book_name}_${verse.chapter}_${verse.verse}`;
                    processedVerses[verseKey] = verse;
                    validVerseCount++;
                } else {
                    console.warn(`Skipping invalid verse at key ${key}`);
                }
            }

            if (validVerseCount === 0) {
                throw new Error('Invalid Bible data structure: no valid verses found in data');
            }

            this.verses = processedVerses;
            console.log(`Successfully loaded ${validVerseCount} valid verses from ASV data`);

            console.log('Building verse index...');
            await this.buildVerseIndex();

            this.initialized = true;
            console.log(`Bible Service initialized with ${this.verseIndex.size} verses indexed`);
            this.logSampleVerses();

            // Expose service instance globally for testing
            window.bibleService = this;
        } catch (error) {
            this.initializationError = error;
            console.error('Error initializing Bible Service:', error);
            throw error;
        }
    }
    normalizeBookName(name) {
        return name
            .replace(/^(\d+)\s+/, (match, num) => {
                const numbers = ['First', 'Second', 'Third'];
                return `${numbers[parseInt(num) - 1] || num} `;
            })
            .replace(/\s+/g, ' ')
            .trim();
    }

    async buildVerseIndex() {

        for (const verse of Object.values(this.verses)) {
            if (!verse || !verse.book_name || !verse.chapter || !verse.verse) continue;

            // Create canonical reference format
            const normalizedBookName = this.normalizeBookName(verse.book_name);
            const verseRef = `${verse.chapter}:${verse.verse}`;
            const reference = `${normalizedBookName} ${verseRef}`;

            // Index only the canonical form
            this.verseIndex.set(reference, verse);

            // Store original book name for exact matches
            verse.originalBookName = verse.book_name;
            verse.normalizedBookName = normalizedBookName;
        }
    }

    logSampleVerses() {
        const samples = Array.from(this.verseIndex.keys()).slice(0, 5);
        console.log('Sample indexed verses:', samples);
        for (const sample of samples) {
            console.log(`${sample}:`, this.verseIndex.get(sample).text);
        }
    }

    async getVerse(reference) {
        await this.initialize();
        console.log(`Looking up verse: ${reference}`);

        try {
            if (!reference || typeof reference !== 'string') {
                throw new Error('Invalid verse reference: must be a non-empty string');
            }

            const parsedRefs = this.parseReference(reference);
            console.log(`Parsed ${parsedRefs.length} references for range: ${reference}`);
            const verses = [];

            for (const ref of parsedRefs) {
                console.log(`Processing reference: ${ref.reference}`);

                if (ref.showFullChapter) {
                    // Get all verses in the chapter
                    const chapterVerses = await this.getChapter(ref.book, ref.chapter);
                    verses.push(...chapterVerses.map(verse => ({
                        ...verse,
                        reference: `${ref.book} ${ref.chapter}:${verse.verse}`,
                        isHighlighted: false
                    })));
                } else {
                    // Create canonical reference format using the same normalization as buildVerseIndex
                    const normalizedBookName = this.normalizeBookName(ref.book);
                    const canonicalReference = `${normalizedBookName} ${ref.chapter}:${ref.verse}`;
                    console.log(`Looking for canonical reference: ${canonicalReference}`);

                    // Look up verse directly using canonical reference
                    const verse = this.verseIndex.get(canonicalReference);

                    if (!verse) {
                        console.warn(`Verse not found: ${canonicalReference}`);
                        throw new Error(`Verse not found: ${ref.reference}. Please check the book name, chapter, and verse number.`);
                    }

                    console.log(`Found verse: ${canonicalReference}`);
                    verses.push({
                        ...verse,
                        reference: canonicalReference,
                        isHighlighted: true
                    });
                }
            }

            // For verse ranges, get the full chapter and mark specified verses as highlighted
            if (verses.some(v => v.isHighlighted)) {
                const firstVerse = verses[0];
                const chapterVerses = await this.getChapter(firstVerse.book_name, firstVerse.chapter);
                const highlightedVerseNumbers = verses.map(v => v.verse);

                return chapterVerses.map(verse => ({
                    ...verse,
                    reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
                    isHighlighted: highlightedVerseNumbers.includes(verse.verse)
                }));
            }

            return verses;
        } catch (error) {
            console.warn('Verse lookup error:', error.message);
            throw error;
        }
    }
    findVerseByFuzzyMatch(reference) {
        const [bookName, verseRef] = reference.split(/\s+(?=\d+:)/);
        const normalizedSearch = bookName.toLowerCase();

        // Try fuzzy matching
        for (const [key, verse] of this.verseIndex.entries()) {
            if (key.toLowerCase().includes(normalizedSearch) && key.endsWith(verseRef)) {
                return verse;
            }
        }
        return null;
    }

    logAvailableReferences() {
        const refs = Array.from(this.verseIndex.keys()).slice(0, 5);
        console.log('Available references:', refs);
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
        return results;
    }

    async getChapter(book, chapter) {
        await this.initialize();
        console.log(`Getting chapter: ${book} ${chapter}`);

        const results = Array.from(this.verseIndex.values())
            .filter(verse => verse.book_name === book && verse.chapter === parseInt(chapter))
            .sort((a, b) => a.verse - b.verse);

        console.log(`Found ${results.length} verses in ${book} ${chapter}`);
        return results;
    }

    async getBooks() {
        await this.initialize();
        const books = new Set(Array.from(this.verseIndex.values()).map(verse => verse.book_name));
        return Array.from(books).sort();
    }

    async getChapterCount(book) {
        await this.initialize();
        const chapters = new Set(Array.from(this.verseIndex.values())
            .filter(verse => verse.book_name === book)
            .map(verse => verse.chapter));
        return Math.max(...Array.from(chapters));
    }

    async findRelatedVerses(reference) {
        await this.initialize();
        console.log(`Finding related verses for: ${reference}`);

        const sourceVerse = await this.getVerse(reference);
        if (!sourceVerse) {
            throw new Error(`Source verse not found: ${reference}`);
        }

        const keywords = sourceVerse.text.toLowerCase()
            .replace(/[.,;:!?]/g, '')
            .split(' ')
            .filter(word => word.length > 4);

        const results = [];
        for (const verse of this.verseIndex.values()) {
            if (verse.book_name === sourceVerse.book_name &&
                verse.chapter === sourceVerse.chapter &&
                verse.verse === sourceVerse.verse) {
                continue;
            }

            const verseText = verse.text.toLowerCase();
            const matchCount = keywords.filter(keyword => verseText.includes(keyword)).length;

            if (matchCount >= 2) {
                results.push({
                    verse,
                    relevance: matchCount,
                    reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
                });
            }
        }

        results.sort((a, b) => b.relevance - a.relevance);
        return results.slice(0, 5);
    }
}
