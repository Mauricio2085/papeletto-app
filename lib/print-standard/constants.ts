export const STANDARD_PRINT_MAX_BYTES = 15 * 1024 * 1024; // 15 MB

export const STANDARD_PRINT_ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
]);

export const STANDARD_PRINT_ALLOWED_EXTENSIONS = new Set([".pdf", ".txt"]);

/** Default price key for B&W A4 per page (seed). */
export const STANDARD_PRINT_PRICE_KEY = "print.bw.a4.page";

/** Text page estimate: ~3000 chars per A4 page at default font. */
export const TEXT_CHARS_PER_PAGE = 3000;

export const MIN_COPIES = 1;
export const MAX_COPIES = 99;
