import { getHoursUntilNextRefresh } from '../addCorsAndCache';
import { test, expect, afterEach, mock, spyOn } from 'bun:test';

afterEach(() => {
  mock.restore();
});

test('getHoursUntilNextRefresh', () => {
  spyOn(Date.prototype, 'getUTCHours').mockReturnValue(2);
  expect(getHoursUntilNextRefresh()).toBe(0);

  spyOn(Date.prototype, 'getUTCHours').mockReturnValue(3);
  expect(getHoursUntilNextRefresh()).toBe(23);
});
