import type { AnyFunction, DebouncedFunction, DebounceOptions } from './typings';

export function debounce<F extends AnyFunction>(
  fn: F,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<F> {
  if (typeof fn !== 'function') {
    throw new TypeError('Expected the first parameter to be a function.');
  }

  const { immediate = false, signal } = options;
  // A more robust check for async functions, less likely to be fooled by wrappers.
  const isAsync =
    fn.constructor.name === 'AsyncFunction' ||
    Object.prototype.toString.call(fn) === '[object AsyncFunction]';

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<F> | undefined;
  let lastThis: unknown;

  // Async-specific variables
  let promiseHandlers: {
    resolve: (value: ReturnType<F>) => void;
    reject: (reason?: any) => void;
  }[] = [];
  let leadingValue: Promise<ReturnType<F>> | undefined;

  // Sync-specific variable
  let result: ReturnType<F> | undefined;

  function run() {
    const args = lastArgs;
    const context = lastThis;
    lastArgs = undefined;
    lastThis = undefined;

    if (isAsync) {
      const currentHandlers = promiseHandlers;
      promiseHandlers = [];
      leadingValue = undefined;

      (async () => {
        try {
          const asyncResult = await fn.apply(context, args as Parameters<F>);
          for (const handler of currentHandlers) {
            handler.resolve(asyncResult);
          }
        } catch (error) {
          for (const handler of currentHandlers) {
            handler.reject(error);
          }
        }
      })();
    } else {
      result = fn.apply(context, args as Parameters<F>);
    }
  }

  function later() {
    timeoutId = undefined;
    if (!immediate) {
      run();
    } else if (isAsync) {
      // Clear leadingValue if the timeout completes without another call
      leadingValue = undefined;
    }
  }

  const onAbort = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = undefined;
    try {
      signal?.throwIfAborted();
    } catch (error) {
      for (const handler of promiseHandlers) handler.reject(error);
      promiseHandlers = [];
    }
  };

  if (isAsync) {
    const debouncedAsync = function (this: unknown, ...args: Parameters<F>) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context = this;
      lastArgs = args;
      lastThis = context;

      if (signal?.aborted) {
        return Promise.reject(signal.reason);
      }

      const callNow = immediate && timeoutId === undefined;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = setTimeout(later, wait);

      if (callNow) {
        leadingValue = (async () => {
          return await fn.apply(lastThis, lastArgs as Parameters<F>);
        })();
      }

      return new Promise((resolve, reject) => {
        if (callNow) {
          leadingValue?.then(resolve, reject);
        } else {
          promiseHandlers.push({ resolve, reject });
          if (signal && promiseHandlers.length === 1) {
            signal.addEventListener('abort', onAbort, { once: true });
          }
        }
      });
    };

    debouncedAsync.isPending = false;
    Object.defineProperty(debouncedAsync, 'isPending', {
      get: () => timeoutId !== undefined,
    });

    debouncedAsync.clear = () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = undefined;
      lastArgs = undefined;
      lastThis = undefined;
      promiseHandlers = [];
      leadingValue = undefined;
    };

    debouncedAsync.flush = () => {
      if (timeoutId === undefined) return Promise.resolve(undefined as any);
      return new Promise((resolve, reject) => {
        promiseHandlers.push({ resolve, reject });
        run();
        debouncedAsync.clear();
      });
    };

    return debouncedAsync as DebouncedFunction<F>;
  }

  // Sync implementation
  const debouncedSync = function (this: unknown, ...args: Parameters<F>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    lastArgs = args;
    lastThis = context;

    const callNow = immediate && timeoutId === undefined;
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);

    if (callNow) {
      run();
    }
    return result;
  };

  debouncedSync.isPending = false;
  Object.defineProperty(debouncedSync, 'isPending', {
    get: () => timeoutId !== undefined,
  });

  debouncedSync.clear = () => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = undefined;
    lastArgs = undefined;
    lastThis = undefined;
  };

  debouncedSync.flush = () => {
    if (timeoutId === undefined) return;
    run();
    debouncedSync.clear();
  };

  return debouncedSync as DebouncedFunction<F>;
}

export type * from './typings';
