export class CsvValidationError extends Error {
  constructor(
    public readonly fileName: string,
    message: string,
  ) {
    super(message);
    this.name = 'CsvValidationError';
  }
}
