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
       // Handle multiple references by splitting on 'and'
        if (reference.includes(' and ')) {
            const refs = reference.split(' and ');
            return refs.map(ref => this.parseReference(ref.trim())).flat();
        }
        // Normalize case at start
        reference = reference.toLowerCase();

        reference = this.normalizeBookName(reference);
        console.log("After normalization:", reference);
        
        // Remove any text after hyphen and trim
        reference = reference.split(' - ')[0].trim();

        // Capitalize first letter of each word
        reference = reference.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        console.log(`Parsing reference: ${reference}`);

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

    normalizeBookName(name) {
        const prefixMap = {
            'first': '1',
            '1st': '1',
            'second': '2',
            '2nd': '2',
            'third': '3',
            '3rd': '3',
            'First': '1',
            'Second': '2',
            'Third': '3',
        };
        
        const [first, ...rest] = name.toLowerCase().trim().split(' ');
        const prefix = prefixMap[first] || first;
        
        return [prefix, ...rest]
            .map((word, i) => i === 0 && /^\\d+$/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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
            let highlightedVerseNumbers = new Set();

            // First, collect all verse numbers that should be highlighted
            for (const ref of parsedRefs) {
                if (!ref.showFullChapter) {
                    highlightedVerseNumbers.add(ref.verse);
                }
            }

            // Get the full chapter from the first reference
            const firstRef = parsedRefs[0];
            const chapterVerses = await this.getChapter(firstRef.book, firstRef.chapter);

            // Map the verses and set highlighting based on verse numbers
            return chapterVerses.map(verse => {
                const normalizedBookName = this.normalizeBookName(verse.book_name);
                return {
                    ...verse,
                    reference: `${normalizedBookName} ${verse.chapter}:${verse.verse}`,
                    isHighlighted: highlightedVerseNumbers.size > 0 ?
                        highlightedVerseNumbers.has(verse.verse) :
                        false
                };
            });

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
