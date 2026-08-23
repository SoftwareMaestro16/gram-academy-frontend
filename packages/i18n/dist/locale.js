export const LOCALES = ["en", "ru", "zh"];
export const DEFAULT_LOCALE = "en";
function isLocale(value) {
    return LOCALES.includes(value);
}
/**
 * Resolves an arbitrary language tag (Telegram `language_code`, a user's
 * stored `locale`, an `Accept-Language`-style tag, etc.) to one of the three
 * locales the project supports. Unknown/missing input falls back to
 * `DEFAULT_LOCALE`, per the master spec (§3, "Fallback-язык: en").
 */
export function resolveLocale(input) {
    if (!input) {
        return DEFAULT_LOCALE;
    }
    const primary = input.trim().toLowerCase().split(/[_-]/)[0] ?? "";
    return isLocale(primary) ? primary : DEFAULT_LOCALE;
}
