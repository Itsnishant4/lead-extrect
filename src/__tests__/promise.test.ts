import { describe, it, expect } from 'vitest';
import { pLimit } from '@/lib/utils/promise';

describe('pLimit', () => {
  it('limits concurrency to specified value', async () => {
    const limit = pLimit(2);
    let running = 0;
    let maxRunning = 0;

    const task = () =>
      limit(async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise(resolve => setTimeout(resolve, 50));
        running--;
        return 'done';
      });

    const results = await Promise.all([task(), task(), task(), task(), task()]);
    expect(maxRunning).toBeLessThanOrEqual(2);
    expect(results).toEqual(['done', 'done', 'done', 'done', 'done']);
  });

  it('returns results in order', async () => {
    const limit = pLimit(1);

    const results = await Promise.all([
      limit(async () => {
        await new Promise(r => setTimeout(r, 30));
        return 'a';
      }),
      limit(async () => {
        await new Promise(r => setTimeout(r, 10));
        return 'b';
      }),
      limit(async () => 'c'),
    ]);

    expect(results).toEqual(['a', 'b', 'c']);
  });

  it('handles errors without blocking queue', async () => {
    const limit = pLimit(1);

    const results = await Promise.allSettled([
      limit(async () => {
        throw new Error('fail');
      }),
      limit(async () => 'success'),
    ]);

    expect(results[0].status).toBe('rejected');
    expect(results[1].status).toBe('fulfilled');
    if (results[1].status === 'fulfilled') {
      expect(results[1].value).toBe('success');
    }
  });

  it('works with concurrency of 1 (serial execution)', async () => {
    const limit = pLimit(1);
    const order: number[] = [];

    await Promise.all([
      limit(async () => { order.push(1); }),
      limit(async () => { order.push(2); }),
      limit(async () => { order.push(3); }),
    ]);

    expect(order).toEqual([1, 2, 3]);
  });

  it('allows high concurrency', async () => {
    const limit = pLimit(100);
    const results = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        limit(async () => i)
      )
    );
    expect(results).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });
});
