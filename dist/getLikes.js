"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const utils_1 = require("./utils");
const constants_1 = __importDefault(require("./constants"));
const email = process.env.FACEBOOK_EMAIL;
const password = process.env.FACEBOOK_PASSWORD;
const profileId = process.env.FACEBOOK_PROFILE_ID;
const shouldShowHead = process.env.SHOW_PUPPETEER_HEAD;
let page;
async function getLikes() {
    if (!email || !password || !profileId) {
        throw new Error("email or password or profileId env vars not set");
    }
    const browser = await createBrowser();
    await createPage(browser);
    await login(page);
    await goToLikesPage(page);
    await browser.close();
    console.log("finished");
}
exports.default = getLikes;
async function createBrowser() {
    const browser = await puppeteer_1.default.launch({
        headless: !shouldShowHead,
        slowMo: constants_1.default.slowMo
    });
    return browser;
}
async function createPage(browser) {
    const _page = await browser.newPage();
    await _page.setCacheEnabled(true);
    _page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"); //so we don't look like a bot
    page = _page;
}
async function login(page) {
    await page.goto(utils_1.likesPageURL(profileId));
    await page.waitForSelector("#email");
    await page.type("#email", email);
    await page.type("#pass", password);
    await page.click("#loginbutton");
    await page.waitForNavigation();
    if ((await page.$("#login_form")) !== null) {
        //error logging in, prolly coz cookies thing
        await page.type("#pass", password);
        await page.click("#loginbutton");
    }
    await page.screenshot({ path: `${constants_1.default.screenshotsDir}/login.png` });
    console.log("login done");
}
async function goToLikesPage(page) {
    await page.goto(utils_1.likesPageURL(profileId));
    await page.waitForSelector("#facebook");
    await page.screenshot({
        path: `${constants_1.default.screenshotsDir}/activityLogLikes.png`
    });
    console.log("at likes page");
}
async function getRecentLikes() { }
