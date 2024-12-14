// verseLinking.js - Handles verse selection and related verse display functionality
import { displayService } from './displayService.js';
import { aiService } from './aiService.js';

class VerseLinkingService {
    constructor(bibleService) {
        console.log('Initializing VerseLinkingService...');
        this.bibleService = bibleService;
        this.selectedVerses = new Set();
        this.currentChapter = null;
        this.currentBook = null;
    }

    async initialize() {
        try {
            // Ensure BibleService is initialized first
            if (!this.bibleService) {
                throw new Error('BibleService not provided to VerseLinkingService');
            }
            await this.bibleService.initialize();

            // Ensure DisplayService is available
            if (!window.displayService) {
                console.error('DisplayService not available');
                throw new Error('DisplayService not available');
            }

            // Set up event listeners before loading initial chapter
            this.setupEventListeners();

            // Initialize chapter navigation and wait for completion
            await this.initializeChapterNavigation().catch(error => {
                console.error('Error initializing chapter navigation:', error);
                throw error;
            });
        } catch (error) {
            console.error('Error initializing VerseLinkingService:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Remove DOMContentLoaded since we're initialized after DOM is ready
        const chapterContent = document.querySelector('.chapter-content');
        if (chapterContent) {
            chapterContent.addEventListener('click', (e) => {
                // Check for both verse-number class and elements with verse number aria-label
                if (e.target.classList.contains('verse-number') ||
                    (e.target.hasAttribute('aria-label') &&
                     e.target.getAttribute('aria-label').startsWith('Verse '))) {
                    this.handleVerseClick(e.target);
                }
            });
        }

        const prevButton = document.getElementById('prev-chapter');
        const nextButton = document.getElementById('next-chapter');

        if (prevButton) {
            prevButton.addEventListener('click', () => this.navigateChapter('prev'));
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => this.navigateChapter('next'));
        }
    }

    async handleVerseClick(verseElement) {
        const verseNumber = verseElement.dataset.verseNumber;
        const verseReference = `${this.currentBook} ${this.currentChapter}:${verseNumber}`;

        // Toggle verse selection
        if (this.selectedVerses.has(verseReference)) {
            this.selectedVerses.delete(verseReference);
            verseElement.classList.remove('selected');
        } else {
            this.selectedVerses.add(verseReference);
            verseElement.classList.add('selected');
        }

        // After updating selection state, trigger AI analysis
        if (this.selectedVerses.size > 0) {
            const selectedRefs = Array.from(this.selectedVerses);
            // Set all loading states immediately
            aiService.relatedVersesContainer.innerHTML = 'loading...';
            aiService.historicalContextContainer.innerHTML = 'loading...';
            aiService.theologicalInsightsContainer.innerHTML = 'loading...';
            await Promise.all([
                aiService.analyzeVerses(selectedRefs),
                aiService.getHistoricalContext(selectedRefs),
                aiService.getTheologicalInsights(selectedRefs)
            ]);
        }
        else {
            // Clear both containers when no verses are selected
            aiService.relatedVersesContainer.innerHTML = 'Select a verse number to see commentary';
            aiService.historicalContextContainer.innerHTML = 'Select a verse to see historical context';
            aiService.theologicalInsightsContainer.innerHTML = 'Select a verse to see theological insights';
        }

        // await this.updateRelatedVerses();
    }

    async updateRelatedVerses() {
        const relatedVersesContainer = document.querySelector('.related-verses-content');
        const historicalContextContainer = document.querySelector('.historical-context-content');
        const theologicalInsightsContainer = document.querySelector('.theological-insights-content');
        if (!relatedVersesContainer) return;

        // Clear existing content immediately
        relatedVersesContainer.innerHTML = '';
        historicalContextContainer.innerHTML = '';
        theologicalInsightsContainer.innerHTML = '';

        // Show empty state if no verses are selected
        if (this.selectedVerses.size === 0) {
            // Original empty states:
            // relatedVersesContainer.innerHTML = '<p class="empty-state">Select a verse number to see commentary</p>';
            // historicalContextContainer.innerHTML = '<p class="empty-state">Select a verse to see historical context</p>';
            // theologicalInsightsContainer.innerHTML = '<p class="empty-state">Select a verse to see theological insights</p>';
            relatedVersesContainer.innerHTML = 'Select a verse number to see commentary';
            historicalContextContainer.innerHTML = 'Select a verse to see historical context';
            theologicalInsightsContainer.innerHTML = 'Select a verse to see theological insights';
            return;
        }
    }

    async getRelatedVerses(selectedVerses) {
        // Get related verses from BibleService
        const relatedVerses = [];
        for (const reference of selectedVerses) {
            const related = await this.bibleService.findRelatedVerses(reference);
            relatedVerses.push(...related);
        }
        return relatedVerses;
    }

    async displayChapter(book, chapter, highlightVerse = null) {
        this.currentBook = book;
        this.currentChapter = chapter;
        // Clear selected verses when changing chapters
        this.selectedVerses.clear();
        // Clear both containers
        // Original empty states:
        // aiService.relatedVersesContainer.innerHTML = '<p class="empty-state">Select a verse number to see commentary</p>';
        // aiService.historicalContextContainer.innerHTML = '<p class="empty-state">Select a verse to see historical context</p>';
        // aiService.theologicalInsightsContainer.innerHTML = '<p class="empty-state">Select a verse to see theological insights</p>';
        aiService.relatedVersesContainer.innerHTML = 'Select a verse number to see commentary';
        aiService.historicalContextContainer.innerHTML = 'Select a verse to see historical context';
        aiService.theologicalInsightsContainer.innerHTML = 'Select a verse to see theological insights';

        const chapterContent = document.querySelector('.chapter-content');
        const chapterReference = document.querySelector('.chapter-reference');

        if (!chapterContent || !chapterReference) return;

        // Update chapter reference
        chapterReference.textContent = `${book} ${chapter}`;

        // Get chapter content from BibleService with highlighting
        let verses;
        let highlightedVerseNumbers = [];

        if (highlightVerse) {
            // Parse verse range if present
            if (highlightVerse.includes('-')) {
                const [start, end] = highlightVerse.split('-').map(Number);
                highlightedVerseNumbers = Array.from(
                    { length: end - start + 1 },
                    (_, i) => start + i
                );
            } else {
                highlightedVerseNumbers = [Number(highlightVerse)];
            }

            // Get the full chapter first
            verses = await this.bibleService.getChapter(book, chapter);

            // Mark verses for highlighting
            verses = verses.map(verse => ({
                ...verse,
                isHighlighted: highlightedVerseNumbers.includes(verse.verse)
            }));
        } else {
            // Otherwise, just get the chapter without highlighting
            verses = await this.bibleService.getChapter(book, chapter);
        }

        // Clear existing content
        chapterContent.innerHTML = '';

        console.log('Rendering verses with highlighting:', {
            book,
            chapter,
            highlightedVerses: verses.filter(v => v.isHighlighted).map(v => v.verse)
        });

        // Display verses with clickable verse numbers using DisplayService
        verses.forEach(verse => {
            const verseData = {
                ...verse,
                book_name: book,
                chapter: chapter,
                isHighlighted: verse.isHighlighted || false,
                isSelected: this.selectedVerses.has(`${book} ${chapter}:${verse.verse}`)
            };

            console.log('Creating verse element:', {
                verse: verse.verse,
                isHighlighted: verseData.isHighlighted,
                isSelected: verseData.isSelected
            });

            // Create verse element using DisplayService
            const verseElement = displayService.createVerseElement({
                ...verseData,
                text: verse.text,
                verse: verse.verse,
                reference: `${book} ${chapter}:${verse.verse}`
            });

            // Add click handling attributes to verse number
            const verseNumber = verseElement.querySelector('.verse-number');
            if (verseNumber) {
                verseNumber.setAttribute('role', 'button');
                verseNumber.setAttribute('tabindex', '0');
                verseNumber.setAttribute('data-verse-ref', `${book} ${chapter}:${verse.verse}`);
                verseNumber.setAttribute('data-verse-number', verse.verse.toString());
            }

            chapterContent.appendChild(verseElement);

            // Scroll to first highlighted verse
            if (verseData.isHighlighted) {
                setTimeout(() => verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }
        });

        // Update related verses display
        await this.updateRelatedVerses();
    }

    async navigateChapter(direction) {
        if (!this.currentBook || !this.currentChapter) return;

        const books = await this.bibleService.getBooks();
        const currentBookIndex = books.indexOf(this.currentBook);
        const currentChapter = parseInt(this.currentChapter);

        let nextBook = this.currentBook;
        let nextChapter = currentChapter;

        if (direction === 'next') {
            const totalChapters = await this.bibleService.getChapterCount(this.currentBook);
            if (currentChapter < totalChapters) {
                nextChapter = currentChapter + 1;
            } else if (currentBookIndex < books.length - 1) {
                nextBook = books[currentBookIndex + 1];
                nextChapter = 1;
            }
        } else if (direction === 'prev') {
            if (currentChapter > 1) {
                nextChapter = currentChapter - 1;
            } else if (currentBookIndex > 0) {
                nextBook = books[currentBookIndex - 1];
                const totalChapters = await this.bibleService.getChapterCount(nextBook);
                nextChapter = totalChapters;
            }
        }

        if (nextBook !== this.currentBook || nextChapter !== currentChapter) {
            await this.displayChapter(nextBook, nextChapter);
        }
    }

    async initializeChapterNavigation() {
        try {
            // Start with Genesis 1 by default
            await this.displayChapter('Genesis', 1);
            return Promise.resolve();
        } catch (error) {
            console.error('Error initializing chapter navigation:', error);
            return Promise.reject(error);
        }
    }
}

export default VerseLinkingService;
