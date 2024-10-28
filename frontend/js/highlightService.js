// Highlight Service for managing verse highlights and AI interactions
export class HighlightService {
    constructor() {
        this.highlights = new Map(); // Maps verse references to highlight data
        this.currentVerseReference = null;
        this.currentSelectedText = null;
    }

    // Add highlight to a verse
    addHighlight(verseReference, selectedText, color = '#ffeb3b') {
        this.highlights.set(verseReference, {
            text: selectedText,
            color: color,
            timestamp: new Date().toISOString()
        });
        this.saveHighlights();
        this.applyHighlightToDOM(verseReference, selectedText);
    }

    // Remove highlight from a verse
    removeHighlight(verseReference) {
        this.highlights.delete(verseReference);
        this.saveHighlights();
    }

    // Get highlight for a specific verse
    getHighlight(verseReference) {
        return this.highlights.get(verseReference);
    }

    // Get all highlights
    getAllHighlights() {
        return Array.from(this.highlights.entries()).map(([reference, data]) => ({
            reference,
            ...data
        }));
    }

    // Save highlights to localStorage
    saveHighlights() {
        const highlightData = Array.from(this.highlights.entries());
        localStorage.setItem('bibleHighlights', JSON.stringify(highlightData));
    }

    // Load highlights from localStorage
    loadHighlights() {
        const savedHighlights = localStorage.getItem('bibleHighlights');
        if (savedHighlights) {
            this.highlights = new Map(JSON.parse(savedHighlights));
            // Apply saved highlights to DOM
            this.highlights.forEach((data, reference) => {
                this.applyHighlightToDOM(reference, data.text);
            });
        }
    }

    // Initialize the service
    initialize() {
        this.loadHighlights();
        this.setupSelectionListener();
        this.setupToolbarListeners();
        // Add click outside listener to hide toolbar
        document.addEventListener('click', (e) => {
            const toolbar = document.getElementById('highlightToolbar');
            if (toolbar && !toolbar.contains(e.target)) {
                toolbar.style.display = 'none';
            }
        });
    }

    // Set up listener for text selection
    setupSelectionListener() {
        document.addEventListener('mouseup', (e) => {
            const toolbar = document.getElementById('highlightToolbar');
            const selection = window.getSelection();
            if (selection.toString().trim() && !toolbar.contains(e.target)) {
                this.handleTextSelection(selection);
            }
        });
    }

    // Handle text selection
    handleTextSelection(selection) {
        const selectedText = selection.toString().trim();
        if (!selectedText) return;

        const verseElement = selection.anchorNode.parentElement.closest('.verse');
        if (!verseElement) return;

        const verseReference = verseElement.dataset.reference;
        if (!verseReference) return;

        this.currentVerseReference = verseReference;
        this.currentSelectedText = selectedText;
        this.showHighlightToolbar(selection);
    }

    // Show highlight toolbar with AI interaction options
    showHighlightToolbar(selection) {
        const toolbar = document.getElementById('highlightToolbar');
        if (!toolbar) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        toolbar.style.display = 'flex';
        toolbar.style.left = `${rect.left + scrollLeft}px`;
        toolbar.style.top = `${rect.bottom + scrollTop + 5}px`;

        // Ensure toolbar stays within viewport
        const toolbarRect = toolbar.getBoundingClientRect();
        if (toolbarRect.right > window.innerWidth) {
            toolbar.style.left = `${window.innerWidth - toolbarRect.width - 10}px`;
        }
    }

    // Apply highlight to DOM
    applyHighlightToDOM(verseReference, text) {
        const verseElement = document.querySelector(`.verse[data-reference="${verseReference}"]`);
        if (!verseElement) return;

        const verseText = verseElement.textContent;
        const startIndex = verseText.indexOf(text);
        if (startIndex === -1) return;

        const span = document.createElement('span');
        span.className = 'highlighted-text';
        span.textContent = text;

        const range = document.createRange();
        const textNode = Array.from(verseElement.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE && node.textContent.includes(text));

        if (textNode) {
            range.setStart(textNode, startIndex);
            range.setEnd(textNode, startIndex + text.length);
            range.surroundContents(span);
        }
    }

    // Set up toolbar button listeners
    setupToolbarListeners() {
        const toolbar = document.getElementById('highlightToolbar');
        if (!toolbar) return;

        document.getElementById('highlightBtn').addEventListener('click', () => {
            if (this.currentVerseReference && this.currentSelectedText) {
                this.addHighlight(this.currentVerseReference, this.currentSelectedText);
                toolbar.style.display = 'none';
            }
        });

        document.getElementById('meaningBtn').addEventListener('click', () => {
            if (this.currentVerseReference && this.currentSelectedText) {
                this.requestVerseMeaning(this.currentVerseReference, this.currentSelectedText);
                toolbar.style.display = 'none';
            }
        });

        document.getElementById('relatedBtn').addEventListener('click', () => {
            if (this.currentVerseReference && this.currentSelectedText) {
                this.findRelatedVerses(this.currentVerseReference, this.currentSelectedText);
                toolbar.style.display = 'none';
            }
        });
    }

    // Request verse meaning from AI service (placeholder)
    async requestVerseMeaning(verseReference, selectedText) {
        console.log(`Requesting meaning for ${verseReference}: ${selectedText}`);
        // TODO: Implement AI interaction
    }

    // Find related verses (placeholder)
    async findRelatedVerses(verseReference, selectedText) {
        console.log(`Finding verses related to ${verseReference}: ${selectedText}`);
        // TODO: Implement AI interaction
    }
}
