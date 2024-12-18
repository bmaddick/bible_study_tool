import { BibleService } from '../bibleService';
import { mockBibleData } from './utils';

describe('BibleService', () => {
  let bibleService;

  beforeEach(() => {
    bibleService = new BibleService();
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(mockBibleData)
    });
  });

  test('getVerse returns correct verse', async () => {
    await bibleService.initialize();
    const verse = await bibleService.getVerse('Genesis 1:1');
    expect(verse).toEqual(mockBibleData.verses['Genesis 1:1']);
  });
});
