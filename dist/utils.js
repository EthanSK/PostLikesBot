"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
function likesPageURL(userProfileId) {
    return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`;
}
exports.likesPageURL = likesPageURL;
