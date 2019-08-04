"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const email = process.env.FACEBOOK_EMAIL;
const password = process.env.FACEBOOK_PASSWORD;
const profileId = process.env.FACEBOOK_PROFILE_ID;
async function getLikes() {
    if (!email || !password || !profileId) {
        throw new Error("email or password or profileId env vars not set");
    }
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    await page.setCacheEnabled(true);
    await page.goto(likesPageURL(profileId));
    await page.screenshot({ path: "1.png" });
    await page.waitForSelector("#email");
    await page.type("#email", email);
    await page.type("#pass", password);
    await delay(5000);
    await page.click("#loginbutton");
    console.log("login done");
    await delay(5000);
    await page.goto(likesPageURL(profileId));
    await delay(5000);
    await page.screenshot({ path: "2.png" });
    console.log("at likes page");
    await browser.close();
    console.log("finished");
}
exports.default = getLikes;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function likesPageURL(userProfileId) {
    return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`;
}
