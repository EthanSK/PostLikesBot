"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants = {
    defaultDelayMillis: 5000,
    slowMo: 10,
    screenshotsDir: "./logs/screenshots",
    databaseFile: "../db/postLikesBot.db",
    mongoDatabaseName: "PostLikesBotDB",
    appName: "Post Likes Bot",
    maxConsoleOutputChars: 1000
};
exports.default = constants;
// https://www.facebook.com//allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts
