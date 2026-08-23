export declare const LOCALES: readonly ["en", "ru", "zh"];
export type Locale = (typeof LOCALES)[number];
export declare const DEFAULT_LOCALE: Locale;
/**
 * Resolves an arbitrary language tag (Telegram `language_code`, a user's
 * stored `locale`, an `Accept-Language`-style tag, etc.) to one of the three
 * locales the project supports. Unknown/missing input falls back to
 * `DEFAULT_LOCALE`, per the master spec (§3, "Fallback-язык: en").
 */
export declare function resolveLocale(input: string | null | undefined): Locale;
