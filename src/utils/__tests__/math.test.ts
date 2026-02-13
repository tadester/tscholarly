import { add } from '../math';

describe('add function', () => {
  it('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });
});
