// Highlight Service for managing verse highlights and AI interactions
export class HighlightService {
    constructor() {
        this.highlights = new Map(); // Maps verse references to highlight data
    }

    // Add highlight to a verse
    addHighlight(verseReference, selectedText, color = '#ffeb3b') {
        this.highlights.set(verseReference, {
            text: selectedText,
            color: color,
            timestamp: new Date().toISOString()
        });
        this.saveHighlights();
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
        }
    }

    // Initialize the service
    initialize() {
        this.loadHighlights();
        this.setupSelectionListener();
    }

    // Set up listener for text selection
    setupSelectionListener() {
        document.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection.toString().trim()) {
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

        // Create highlight toolbar
        this.showHighlightToolbar(selection, verseReference, selectedText);
    }

    // Show highlight toolbar with AI interaction options
    showHighlightToolbar(selection, verseReference, selectedText) {
        const toolbar = document.createElement('div');
        toolbar.className = 'highlight-toolbar';
        toolbar.innerHTML = `
            <button class="highlight-btn">Highlight</button>
            <button class="meaning-btn">Get Meaning</button>
            <button class="related-btn">Find Related Verses</button>
        `;

        // Position toolbar near selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        toolbar.style.position = 'absolute';
        toolbar.style.top = `${rect.bottom + window.scrollY + 10}px`;
        toolbar.style.left = `${rect.left + window.scrollX}px`;

        // Add event listeners
        toolbar.querySelector('.highlight-btn').addEventListener('click', () => {
            this.addHighlight(verseReference, selectedText);
            toolbar.remove();
        });

        toolbar.querySelector('.meaning-btn').addEventListener('click', () => {
            this.requestVerseMeaning(verseReference, selectedText);
            toolbar.remove();
        });

        toolbar.querySelector('.related-btn').addEventListener('click', () => {
            this.findRelatedVerses(verseReference, selectedText);
            toolbar.remove();
        });

        // Remove toolbar when clicking outside
        document.addEventListener('mousedown', function closeToolbar(e) {
            if (!toolbar.contains(e.target)) {
                toolbar.remove();
                document.removeEventListener('mousedown', closeToolbar);
            }
        });

        document.body.appendChild(toolbar);
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
