/**
 * Utility to expose internal functions for BDD testing/debugging.
 */
export function exposeForTesting(name: string, fn: any) {
  if (typeof window !== 'undefined') {
    (window as any)[name] = fn;
    console.log(`Exposed ${name} on window for testing`);
  }
}
