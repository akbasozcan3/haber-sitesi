/**
 * Next.js Server Instrumentation Hook
 * Safely wraps performance.measure to prevent Next.js 16 Turbopack negative timestamp exceptions
 */
export async function register() {
  if (typeof globalThis !== "undefined" && globalThis.performance && typeof globalThis.performance.measure === "function") {
    const origMeasure = globalThis.performance.measure.bind(globalThis.performance);
    const perfObj = globalThis.performance as unknown as Record<string, unknown>;
    if (!perfObj.__patched_for_negative_timestamp) {
      perfObj.__patched_for_negative_timestamp = true;
      globalThis.performance.measure = function (name: string, startOrOptions?: unknown, endMark?: string) {
        try {
          if (typeof startOrOptions === "object" && startOrOptions !== null) {
            const opts = { ...(startOrOptions as Record<string, unknown>) };
            if (typeof opts.start === "number" && opts.start < 0) opts.start = 0;
            if (typeof opts.end === "number" && opts.end < 0) opts.end = 0;
            if (typeof opts.start === "number" && typeof opts.end === "number" && (opts.end as number) < (opts.start as number)) {
              opts.end = opts.start;
            }
            return origMeasure(name, opts as unknown as PerformanceMeasureOptions, endMark);
          }
          return origMeasure(name, startOrOptions as PerformanceMeasureOptions, endMark);
        } catch {
          return undefined as unknown as PerformanceMeasure;
        }
      };
    }
  }
}
