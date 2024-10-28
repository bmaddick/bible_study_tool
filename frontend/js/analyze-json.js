// Script to analyze ASV JSON structure
const fs = require('fs');
const path = require('path');

function analyzeJSON() {
    try {
        // Read ASV JSON file from attachments directory
        const asvPath = path.join(process.env.HOME, 'attachments', 'asv.json');
        const data = fs.readFileSync(asvPath, 'utf8');
        const bibleData = JSON.parse(data);

        // Get structure information
        console.log('=== ASV Bible JSON Structure Analysis ===');

        // Analyze root structure
        const isArray = Array.isArray(bibleData);
        console.log('\nRoot structure:', isArray ? 'Array' : 'Object');

        // Get verses data
        const verses = isArray ? bibleData : (bibleData.verses || []);
        console.log('Total verses:', verses.length);

        if (verses.length === 0) {
            console.error('No verses found in JSON data');
            return;
        }

        // Display first verse structure
        console.log('\nFirst verse structure:');
        console.log(JSON.stringify(verses[0], null, 2));

        // Create a detailed map of book names
        const bookMap = new Map();
        const bookAnalysis = new Map();
        for (let i = 0; i < verses.length; i++) {
            const verse = verses[i];
            // Check different possible book name properties
            const bookName = verse.book_name || verse.bookName || verse.book;

            if (bookName && !bookMap.has(bookName)) {
                bookMap.set(bookName, i);
                // Analyze book name format
                bookAnalysis.set(bookName, {
                    exactName: bookName,
                    firstVerseIndex: i,
                    length: bookName.length,
                    charCodes: Array.from(bookName).map(c => `${c} (${c.charCodeAt(0)})`),
                    hasSpaces: bookName.includes(' '),
                    hasPunctuation: /[^\w\s]/.test(bookName),
                    trimmedLength: bookName.trim().length
                });
            }
        }

        // Display detailed book mapping analysis
        console.log('\nDetailed Book Name Analysis:');
        for (const [bookName, analysis] of bookAnalysis) {
            console.log(`\nBook: "${bookName}"`);
            console.log('- First verse index:', analysis.firstVerseIndex);
            console.log('- Length:', analysis.length);
            console.log('- Character codes:', analysis.charCodes.join(', '));
            console.log('- Contains spaces:', analysis.hasSpaces);
            console.log('- Contains punctuation:', analysis.hasPunctuation);
            console.log('- Trimmed length:', analysis.trimmedLength);
        }

        // Show sample verses from each book
        const findVersesByBook = (bookName) => {
            const verses = [];
            const startIndex = bookMap.get(bookName);
            if (startIndex !== undefined) {
                for (let i = startIndex; i < bibleData.length; i++) {
                    const verse = bibleData[i];
                    const currentBook = verse.book_name || verse.bookName || verse.book;
                    if (currentBook === bookName) {
                        verses.push(verse);
                    }
                    if (verses.length >= 3 || currentBook !== bookName) break;
                }
            }
            return verses;
        };

        // Get samples from first and last books
        const books = Array.from(bookMap.keys());
        console.log('\nSample verses from first book:');
        const firstBookVerses = findVersesByBook(books[0]);
        console.log(JSON.stringify(firstBookVerses, null, 2));

        console.log('\nSample verses from last book:');
        const lastBookVerses = findVersesByBook(books[books.length - 1]);
        console.log(JSON.stringify(lastBookVerses, null, 2));

        // Display all unique book names
        const uniqueBooks = Array.from(bookMap.keys()).sort();
        console.log('\nAll available books:', uniqueBooks);
        console.log('Total number of books:', uniqueBooks.length);

        // Analyze verse properties
        const verseProperties = new Set();
        Object.keys(verses[0]).forEach(prop => verseProperties.add(prop));
        console.log('\nVerse properties:', Array.from(verseProperties));

    } catch (error) {
        console.error('Error analyzing JSON:', error);
        if (error.code === 'ENOENT') {
            console.error('ASV JSON file not found. Please ensure it exists in ~/attachments/asv.json');
        }
    }
}

// Run analysis when script loads
analyzeJSON();
