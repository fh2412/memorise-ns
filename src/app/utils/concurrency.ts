/**
 * Minimal promise concurrency limiter.
 *   const limit = createLimiter(2);
 *   limit(() => doWork());
 */
export function createLimiter(concurrency: number) {
  let active = 0;
  const waiting: (() => void)[] = [];

  const next = () => {
    if (active >= concurrency) return;
    const run = waiting.shift();
    if (!run) return;
    active++;
    run();
  };

  return function limit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      waiting.push(() => {
        task()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
  };
}

/** setTimeout as promise, rejects when the signal aborts. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(abortError());
      },
      { once: true },
    );
  });
}

export function abortError(): DOMException {
  return new DOMException('Aborted', 'AbortError');
}
