import type { Locale } from "./locale.js";
/**
 * UI chrome strings for the TMA client. This covers app-shell copy only —
 * course/lesson/quiz CONTENT is stored in Postgres (`translations` Json
 * fields) and served pre-localized by the API, not through this package.
 */
export interface AppMessages {
    common: {
        loading: string;
        error: string;
        retry: string;
        back: string;
    };
    nav: {
        home: string;
        profile: string;
    };
    wallet: {
        connect: string;
        disconnect: string;
        connected: string;
    };
}
export declare const appMessages: Record<Locale, AppMessages>;
