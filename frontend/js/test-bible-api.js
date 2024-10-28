// Test script for Bible API
import { bibleAPI } from './api/bible-api.js';

async function testBibleAPI() {
    const testReferences = [
        'John 3:16',
        'Genesis 1:1',
        'Psalm 23:1',
        'Romans 8:28'
    ];

    console.log('Testing Bible API with ASV data...');

    for (const reference of testReferences) {
        try {
            const verse = await bibleAPI.getVerse(reference);
            console.log(`\nReference: ${reference}`);
            console.log(`Version: ${verse.version}`);
            console.log(`Text: ${verse.text}`);
        } catch (error) {
            console.error(`Error fetching ${reference}:`, error.message);
        }
    }
}

// Run tests when page loads
window.addEventListener('load', testBibleAPI);
