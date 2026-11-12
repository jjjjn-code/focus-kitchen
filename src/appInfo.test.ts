import { describe, expect, it } from 'vitest';
import { APP_NAME } from './appInfo';

describe('app info', () => {
  it('has a name', () => {
    expect(APP_NAME).toBe('Focus Kitchen');
  });
});
