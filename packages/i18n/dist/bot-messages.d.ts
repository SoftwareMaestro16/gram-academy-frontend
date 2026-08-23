import type { Locale } from "./locale.js";
/** Descriptions registered via `bot.api.setMyCommands`, per locale. */
export interface BotCommandDescriptions {
    start: string;
    courses: string;
    profile: string;
    help: string;
}
export declare const botCommandDescriptions: Record<Locale, BotCommandDescriptions>;
/** Longer-form text the bot sends in chat (menu, help, etc.). */
export interface BotMessages {
    menu: {
        title: string;
        openApp: string;
    };
    help: {
        body: string;
    };
}
export declare const botMessages: Record<Locale, BotMessages>;
