import { AIService } from '../aiService';
import { mockAIResponse } from './utils';

jest.mock('../bibleService');

describe('AIService', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AIService();
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(mockAIResponse)
    });
  });

  test('getVerseInterpretation returns formatted response', async () => {
    const response = await aiService.getVerseInterpretation('Test verse');
    expect(response).toBeDefined();
    expect(response.html).toBeDefined();
  });
});
