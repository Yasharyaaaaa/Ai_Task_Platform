import { describe, it, expect } from 'vitest';
import { OP_ICON, OP_META, isAiOp, STRING_OPS, AI_OPS, STATUS_FILTERS, STATUS_CONFIG } from '../config/operations';

describe('operations config', () => {
  it('has metadata and an icon for every operation', () => {
    [...STRING_OPS, ...AI_OPS].forEach((op) => {
      expect(OP_META[op]).toBeDefined();
      expect(OP_ICON[op]).toBeTruthy();
    });
  });

  it('isAiOp distinguishes AI ops from string ops', () => {
    expect(isAiOp('summarize')).toBe(true);
    expect(isAiOp('custom')).toBe(true);
    expect(isAiOp('uppercase')).toBe(false);
  });

  it('STATUS_FILTERS begins with "all" and covers every status', () => {
    expect(STATUS_FILTERS[0]).toBe('all');
    Object.keys(STATUS_CONFIG).forEach((status) => {
      expect(STATUS_FILTERS).toContain(status);
    });
  });
});
