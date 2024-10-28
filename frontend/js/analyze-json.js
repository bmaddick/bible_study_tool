// Script to analyze ASV JSON structure
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'asv.json');

try {
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const bibleData = JSON.parse(jsonData);

    // Get structure information
    console.log('=== ASV Bible JSON Structure Analysis ===');

    // Verify verses object exists
    if (!bibleData.verses) {
        console.error('No verses object found in JSON');
        process.exit(1);
    }

    // Analyze verses structure
    console.log('\nAnalyzing verses structure...');
    const verses = bibleData.verses;

    // Create a map of book names
    const bookMap = new Map();
    for (let i = 0; i < verses.length; i++) {
        if (verses[i].book_name && !bookMap.has(verses[i].book_name)) {
            bookMap.set(verses[i].book_name, i);
        }
    }

    // Display book mapping
    console.log('\nBook name to index mapping:');
    console.log(Array.from(bookMap).slice(0, 10));

    // Show sample verses from Genesis and John
    const findVersesByBook = (bookName) => {
        const verses = [];
        for (let i = 0; i < bibleData.verses.length; i++) {
            if (bibleData.verses[i].book_name === bookName) {
                verses.push(bibleData.verses[i]);
            }
            if (verses.length >= 3) break; // Get first 3 verses only
        }
        return verses;
    };

    console.log('\nSample verses from Genesis:');
    const genesisVerses = findVersesByBook('Genesis');
    console.log(JSON.stringify(genesisVerses, null, 2));

    console.log('\nSample verses from John:');
    const johnVerses = findVersesByBook('John');
    console.log(JSON.stringify(johnVerses, null, 2));

} catch (error) {
    console.error('Error analyzing JSON:', error);
}
