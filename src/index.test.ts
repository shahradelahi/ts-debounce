import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from './index';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sync', () => {
    it('should debounce a function', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      debounced();
      debounced();

      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should call the function with the last arguments', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced(1);
      debounced(2);
      debounced(3);

      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledWith(3);
    });

    it('should preserve the `this` context', () => {
      const context = {
        func: vi.fn(),
      };
      const debounced = debounce(context.func, 100);

      debounced.call(context);

      vi.advanceTimersByTime(100);

      expect(context.func).toHaveBeenCalledTimes(1);
      expect(context.func).toHaveBeenCalledWith();
    });

    describe('immediate option', () => {
      it('should call the function immediately', () => {
        const func = vi.fn();
        const debounced = debounce(func, 100, { immediate: true });

        debounced();

        expect(func).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);
      });

      it('should not call the function again after the wait time', () => {
        const func = vi.fn();
        const debounced = debounce(func, 100, { immediate: true });

        debounced();
        debounced();

        expect(func).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);
      });
    });

    describe('isPending', () => {
      it('should be true when the function is pending', () => {
        const debounced = debounce(() => {}, 100);

        expect(debounced.isPending).toBe(false);

        debounced();

        expect(debounced.isPending).toBe(true);

        vi.advanceTimersByTime(100);

        expect(debounced.isPending).toBe(false);
      });
    });

    describe('clear', () => {
      it('should cancel the execution', () => {
        const func = vi.fn();
        const debounced = debounce(func, 100);

        debounced();
        debounced.clear();

        vi.advanceTimersByTime(100);

        expect(func).not.toHaveBeenCalled();
      });
    });

    describe('flush', () => {
      it('should execute the function immediately', () => {
        const func = vi.fn();
        const debounced = debounce(func, 100);

        debounced();
        debounced.flush();

        expect(func).toHaveBeenCalledTimes(1);
      });

      it('should not execute the function again after the wait time', () => {
        const func = vi.fn();
        const debounced = debounce(func, 100);

        debounced();
        debounced.flush();

        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);
      });

      it('should do nothing if no function is pending', () => {
        const func = vi.fn();
        const debounced = debounce(func, 100);

        debounced.flush();

        expect(func).not.toHaveBeenCalled();
      });
    });
  });

  describe('async', () => {
    it('should debounce an async function', async () => {
      const func = vi.fn(async (x) => x);
      const debounced = debounce(func, 100);

      const p1 = debounced(1);
      const p2 = debounced(2);
      const p3 = debounced(3);

      await vi.advanceTimersByTimeAsync(100);

      const results = await Promise.all([p1, p2, p3]);

      expect(func).toHaveBeenCalledTimes(1);
      expect(func).toHaveBeenCalledWith(3);
      expect(results).toEqual([3, 3, 3]);
    });

    it('should resolve with the last value', async () => {
      const func = vi.fn(async (x) => x);
      const debounced = debounce(func, 100);

      const promise = debounced(1);
      debounced(2);

      vi.advanceTimersByTime(100);

      await expect(promise).resolves.toBe(2);
    });

    it('should reject all promises if the function rejects', async () => {
      const error = new Error('test error');
      const func = vi.fn(async () => {
        throw error;
      });
      const debounced = debounce(func, 100);

      const p1 = debounced();
      const p2 = debounced();

      vi.advanceTimersByTime(100);

      await expect(p1).rejects.toThrow(error);
      await expect(p2).rejects.toThrow(error);
    });

    describe('immediate option', () => {
      it('should call the function immediately', async () => {
        const func = vi.fn(async (x) => x);
        const debounced = debounce(func, 100, { immediate: true });

        const promise = debounced(1);

        expect(func).toHaveBeenCalledTimes(1);
        await expect(promise).resolves.toBe(1);

        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);
      });
    });

    describe('isPending', () => {
      it('should be true when the function is pending', () => {
        const debounced = debounce(async () => {}, 100);

        expect(debounced.isPending).toBe(false);

        debounced();

        expect(debounced.isPending).toBe(true);

        vi.advanceTimersByTime(100);

        expect(debounced.isPending).toBe(false);
      });
    });

    describe('clear', () => {
      it('should cancel the execution', async () => {
        const func = vi.fn(async () => {});
        const debounced = debounce(func, 100);

        debounced();
        debounced.clear();

        vi.advanceTimersByTime(100);

        // The promise will not resolve or reject, it will be pending forever
        // This is a limitation of promise cancellation
        expect(func).not.toHaveBeenCalled();
      });
    });

    describe('flush', () => {
      it('should execute the function immediately and return a promise', async () => {
        const func = vi.fn(async (x) => x);
        const debounced = debounce(func, 100);

        debounced(1);
        const promise = debounced.flush();

        expect(func).toHaveBeenCalledTimes(1);
        await expect(promise).resolves.toBe(1);
      });

      it('should not execute the function again after the wait time', async () => {
        const func = vi.fn(async (x) => x);
        const debounced = debounce(func, 100);

        debounced(1);
        await debounced.flush();

        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);
      });

      it('should resolve with undefined if no function is pending', async () => {
        const func = vi.fn(async (x) => x);
        const debounced = debounce(func, 100);

        await expect(debounced.flush()).resolves.toBeUndefined();
        expect(func).not.toHaveBeenCalled();
      });
    });

    describe('signal', () => {
      it('should abort the debounced function', async () => {
        const controller = new AbortController();
        const func = vi.fn(async () => {});
        const debounced = debounce(func, 100, {
          signal: controller.signal,
        });

        const promise = debounced();
        controller.abort();

        await expect(promise).rejects.toThrow('This operation was aborted');
        expect(func).not.toHaveBeenCalled();
      });
    });
  });
});
