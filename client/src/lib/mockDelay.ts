/**
 * Simulates network latency for mock service calls so loading states are
 * exercised the same way they will be once Phase 2 wires up real requests.
 */
export function mockDelay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
