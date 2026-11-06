/**
 * This file mainly exists as a placeholder example, as I'm sure I will make use of it later.
 */
declare global {
  interface String {
    isBlank(): boolean;
  }
}

String.prototype.isBlank = function (this: string): boolean {
  return this.trim().length === 0;
};
