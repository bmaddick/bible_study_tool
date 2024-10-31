// verseLinking.js - Handles verse selection and related verse display functionality

class VerseLinkingService {
    constructor(bibleService) {
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

            // Set up event listeners before loading initial chapter
            this.setupEventListeners();

            // Add event listener for displayChapter event
            document.addEventListener('displayChapter', async (event) => {
                console.log('Received displayChapter event:', event.detail);
                const { book, chapter, highlightVerses } = event.detail;
                console.log('Highlighting verses:', highlightVerses);
                await this.displayChapter(book, chapter, highlightVerses);
                console.log('Display chapter completed with highlighting');
            });

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

        await this.updateRelatedVerses();
    }

    async updateRelatedVerses() {
        const relatedVersesContainer = document.querySelector('.related-verses-content');
        if (!relatedVersesContainer) return;

        // Clear existing content immediately
        relatedVersesContainer.innerHTML = '';

        // Show empty state if no verses are selected
        if (this.selectedVerses.size === 0) {
            relatedVersesContainer.innerHTML = '<p class="empty-state">Select a verse number to see related verses</p>';
            return;
        }

        const relatedVerses = await this.getRelatedVerses(Array.from(this.selectedVerses));

        // Add related verses
        for (const verse of relatedVerses) {
            const verseElement = document.createElement('div');
            verseElement.classList.add('related-verse');

            // Fetch the actual verse text from BibleService using the full reference
            let verseText = 'Verse text not available';
            try {
                const verseData = await this.bibleService.getVerse(verse.reference);
                if (verseData && verseData.text) {
                    verseText = verseData.text;
                }
            } catch (error) {
                console.error(`Error fetching verse text for ${verse.reference}:`, error);
            }

            verseElement.innerHTML = `
                <div class="verse-reference">${verse.reference}</div>
                <div class="verse-text">${verseText}</div>
            `;
            relatedVersesContainer.appendChild(verseElement);
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

    async displayChapter(book, chapter, highlightVerses = null) {
        // Clear selected verses when changing chapters or searching
        this.selectedVerses.clear();
        // Update related verses display to show empty state
        await this.updateRelatedVerses();

        this.currentBook = book;
        this.currentChapter = chapter;

        const chapterContent = document.querySelector('.chapter-content');
        const chapterReference = document.querySelector('.chapter-reference');

        if (!chapterContent || !chapterReference) return;

        // Update chapter reference
        chapterReference.textContent = `${book} ${chapter}`;

        // Get chapter content from BibleService
        const verses = await this.bibleService.getChapter(book, chapter);

        // Clear existing content
        chapterContent.innerHTML = '';

        // Convert highlightVerses to array if it's a single value
        const versesToHighlight = highlightVerses ?
            (Array.isArray(highlightVerses) ? highlightVerses : [highlightVerses]) : [];

        // Display verses with clickable verse numbers
        verses.forEach(verse => {
            // Create main verse container
            const verseContainer = document.createElement('div');
            verseContainer.classList.add('verse');
            const verseNum = parseInt(verse.verse);
            const isHighlighted = versesToHighlight.includes(verseNum);
            const isSelected = this.selectedVerses.has(`${book} ${chapter}:${verse.verse}`);

            // Create verse number element
            const verseNumberElement = document.createElement('span');
            verseNumberElement.classList.add('verse-number');
            verseNumberElement.setAttribute('data-verse-number', verse.verse);
            verseNumberElement.setAttribute('data-verse-ref', `${book} ${chapter}:${verse.verse}`);
            verseNumberElement.setAttribute('role', 'button');
            verseNumberElement.setAttribute('tabindex', '0');
            verseNumberElement.setAttribute('aria-label', `Verse ${verse.verse}`);
            verseNumberElement.textContent = verse.verse;

            // Add highlighting class if verse is highlighted or selected
            if (isHighlighted || isSelected) {
                verseContainer.classList.add('highlighted');
                verseNumberElement.classList.add('selected');
            }

            // Create verse text element
            const verseTextElement = document.createElement('span');
            verseTextElement.classList.add('verse-text');
            verseTextElement.setAttribute('data-verse-ref', `${book} ${chapter}:${verse.verse}`);
            verseTextElement.textContent = verse.text;

            // Add elements to verse container
            verseContainer.appendChild(verseNumberElement);
            verseContainer.appendChild(verseTextElement);

            // Add verse container to chapter content
            chapterContent.appendChild(verseContainer);

            // Scroll to first highlighted verse
            if (isHighlighted && versesToHighlight[0] === verseNum) {
                setTimeout(() => verseContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }
        });

        console.log(`Displayed chapter ${book} ${chapter} with highlights:`, versesToHighlight);
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
