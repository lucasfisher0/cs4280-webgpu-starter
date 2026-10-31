
/** This class written by AI. */
export class ArgumentError extends Error {
  constructor(public argumentName: string, message?: string) {
    // Provide a default message if none is supplied
    const finalMessage = message || `Invalid argument provided for '${argumentName}'.`;
    super(finalMessage);

    // Set the error name explicitly
    this.name = "ArgumentError";

    // Restores the correct prototype chain (necessary in TS when extending built-in classes)
    Object.setPrototypeOf(this, ArgumentError.prototype);
  }
}
