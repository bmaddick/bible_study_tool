import { HighlightService } from '../highlightService';

describe('HighlightService', () => {
  let highlightService;

  beforeEach(() => {
    highlightService = new HighlightService();
    localStorage.clear();
  });

  test('setHighlight stores highlight correctly', () => {
    highlightService.setHighlight('Genesis 1:1', 'test-color');
    expect(highlightService.getHighlight('Genesis 1:1')).toBe('test-color');
  });
});
