/**
 * Test suite for verse linking functionality
 * @param {BibleService} bibleService - Instance of BibleService to test
 * @returns {Object} Test results with counts and details
 */
export async function runVerseLinkingTests(bibleService) {
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };

    // Test verse lookups with different formats
    const testReferences = [
        'Genesis 1:1',
        '1 John 1:1',
        'First John 1:1',
        'Psalm 23:1',
        'Matthew 5:3-5',
        'Revelation 22:21'
    ];

    // Test basic verse lookups
    for (const ref of testReferences) {
        try {
            const result = await bibleService.getVerse(ref);
            // Check if reference is a verse range
            const isVerseRange = ref.includes('-');

            if (isVerseRange) {
                // For verse ranges, expect an array of verses
                if (Array.isArray(result) && result.length > 0 && result.every(v => v.text)) {
                    results.passed++;
                    results.details.push(`✅ Successfully looked up verse range: ${ref}`);
                } else {
                    results.failed++;
                    results.details.push(`❌ Failed to get valid verse range content for: ${ref}`);
                }
            } else {
                // For single verses, expect a single verse object
                if (result && result.text) {
                    results.passed++;
                    results.details.push(`✅ Successfully looked up verse: ${ref}`);
                } else {
                    results.failed++;
                    results.details.push(`❌ Failed to get valid verse content for: ${ref}`);
                }
            }
        } catch (error) {
            results.failed++;
            results.details.push(`❌ Error looking up ${ref}: ${error.message}`);
        }
    }

    // Test related verses functionality
    try {
        const relatedVerses = await bibleService.findRelatedVerses('John 3:16');
        if (Array.isArray(relatedVerses) && relatedVerses.length > 0) {
            results.passed++;
            results.details.push('✅ Successfully found related verses for John 3:16');
        } else {
            results.failed++;
            results.details.push('❌ Failed to find related verses for John 3:16');
        }
    } catch (error) {
        results.failed++;
        results.details.push(`❌ Error finding related verses: ${error.message}`);
    }

    // Test invalid verse reference handling
    try {
        await bibleService.getVerse('InvalidBook 1:1');
        results.failed++;
        results.details.push('❌ Failed to reject invalid verse reference');
    } catch (error) {
        results.passed++;
        results.details.push('✅ Successfully rejected invalid verse reference');
    }

    // Test verse reference UI element creation
    try {
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse';
        verseDiv.innerHTML = `
            <span class="verse-reference">John 3:16</span>
            <span class="verse-text">For God so loved the world...</span>
        `;
        document.body.appendChild(verseDiv);

        const reference = verseDiv.querySelector('.verse-reference');
        if (reference && reference.className === 'verse-reference') {
            results.passed++;
            results.details.push('✅ Successfully created verse reference UI element');
        } else {
            results.failed++;
            results.details.push('❌ Failed to create proper verse reference UI element');
        }

        // Clean up
        document.body.removeChild(verseDiv);
    } catch (error) {
        results.failed++;
        results.details.push(`❌ Error testing UI: ${error.message}`);
    }

    return results;
}
