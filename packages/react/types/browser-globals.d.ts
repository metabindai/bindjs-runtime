/**
 * Type definitions for MetabindUI running in a pure JSContext.
 * This includes only the globals that can be safely injected or polyfilled.
 */

interface Console {
  log(...data: unknown[]): void;
  error(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  info(...data: unknown[]): void;
  debug(...data: unknown[]): void;
}
declare const console: Console;