"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("./constants"));
const fs_1 = __importDefault(require("fs"));
function delay(ms = constants_1.default.defaultDelayMillis) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
function likesPageURL(userProfileId) {
    return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`;
}
exports.likesPageURL = likesPageURL;
function fbPageURL(pageId) {
    return `https://www.facebook.com/${pageId}`;
}
exports.fbPageURL = fbPageURL;
async function saveImageUrlToDir(url) {
    const dir = "./dir";
    fs_1.default.unlinkSync(dir);
    fs_1.default.mkdirSync(dir);
}
exports.saveImageUrlToDir = saveImageUrlToDir;
