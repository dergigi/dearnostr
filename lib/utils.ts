/**
 * Strips emojis from a string
 * Uses Unicode emoji ranges to remove emoji characters and emoji-related symbols
 */
export function stripEmojis(text: string): string {
  if (!text) return text;
  
  // Comprehensive emoji regex pattern covering:
  // - Emoticons (1F600-1F64F)
  // - Miscellaneous Symbols and Pictographs (1F300-1F5FF)
  // - Transport and Map Symbols (1F680-1F6FF)
  // - Flags (1F1E0-1F1FF)
  // - Miscellaneous Symbols (2600-26FF)
  // - Dingbats (2700-27BF)
  // - Supplemental Symbols and Pictographs (1F900-1F9FF)
  // - Chess Symbols (1FA00-1FA6F)
  // - Symbols and Pictographs Extended-A (1FA70-1FAFF)
  // - Variation selectors (FE00-FE0F)
  // - Zero-width joiner (200D)
  // - Combining enclosing keycap (20E3)
  // - Zero-width characters (200B, FEFF)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{24C2}-\u{1F251}\u{2B00}-\u{2BFF}\u{2C60}-\u{2C7F}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{FEFF}\u{200B}]/gu;
  
  return text.replace(emojiRegex, '').trim();
}

/**
 * Detects if the current device is running Android
 * @returns true if Android, false otherwise (or if SSR)
 */
export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /android/i.test(window.navigator.userAgent);
}

/**
 * Detects if the current device is running iOS
 * @returns true if iOS, false otherwise (or if SSR)
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

