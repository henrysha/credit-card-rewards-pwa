/**
 * Utility to expose internal functions for BDD testing/debugging.
 */
export function exposeForTesting(name: string, fn: unknown) {
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>)[name] = fn;
    console.log(`Exposed ${name} on window for testing`);
  }
}
