export type AnyFunction<T = any> = (...args: any[]) => T;

export interface DebounceOptions {
  /**
   * Execute the function immediately at the start of the wait interval.
   * For asynchronous functions, this is equivalent to calling on the leading edge of the timeout.
   *
   * @default false
   */
  readonly immediate?: boolean;
  /**
   * An `AbortSignal` to cancel the debounced function.
   * This is only applicable to asynchronous functions.
   */
  readonly signal?: AbortSignal;
}

interface DebouncedMethods<F extends AnyFunction> {
  /**
   * Indicates whether the debounce delay is currently active.
   */
  readonly isPending: boolean;

  /**
   * Cancels any scheduled executions.
   */
  clear(): void;

  /**
   * If an execution is scheduled, it will be immediately executed and the timer will be cleared.
   * For asynchronous functions, this returns a promise that resolves with the result.
   */
  flush: F extends AnyFunction<Promise<any>> ? () => Promise<ReturnType<F>> : () => void;
}

export type DebouncedFunction<F extends AnyFunction> = DebouncedMethods<F> & {
  (
    ...args: Parameters<F>
  ): F extends AnyFunction<Promise<any>> ? Promise<ReturnType<F>> : ReturnType<F> | undefined;
};
