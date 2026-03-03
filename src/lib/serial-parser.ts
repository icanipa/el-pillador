// src/lib/serial-parser.ts
// Extracts a Bolivian bill serial number from raw OCR text.
//
// Bolivian bill format: exactly 9 digits + space + 1 uppercase letter
// Example: "020320870 B"
// The serial appears twice on the bill (top-right and bottom-left).

function fixDigitOcrErrors(digits: string): string {
  return digits
    .replace(/O/g, "0")
    .replace(/[Il]/g, "1")
    .replace(/S/g, "5")
    .replace(/B/g, "8");
}

// OCR confuses letters with similar-looking digits in the suffix position
function fixSuffixOcrErrors(char: string): string {
  const map: Record<string, string> = {
    "8": "B",
    "0": "O",
    "1": "I",
    "5": "S",
    "6": "G",
  };
  return map[char] ?? char;
}

/**
 * Returns the serial string (e.g. "020320870 B") if the OCR text contains
 * a valid Bolivian-format serial number, or null otherwise.
 *
 * Strict match only — no fallback to generic digit sequences.
 * This prevents false positives from random numbers on any surface.
 */
export function parseSerial(rawText: string): string | null {
  if (!rawText || rawText.trim().length === 0) return null;

  // Exactly 9 digit-like chars followed by whitespace and a single uppercase letter or digit-lookalike
  // No trailing \b — OCR often appends extra chars after the letter
  const pattern = /\b([0-9OIlSB]{9})\s+([A-Z0-9])/g;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(rawText)) !== null) {
    const fixedDigits = fixDigitOcrErrors(m[1]);
    const suffix = fixSuffixOcrErrors(m[2]);
    if (/^\d{9}$/.test(fixedDigits) && /^[A-Z]$/.test(suffix)) {
      return `${fixedDigits} ${suffix}`;
    }
  }

  return null;
}
