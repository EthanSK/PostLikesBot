"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const constants_1 = __importDefault(require("./constants"));
const utils_1 = require("./utils");
const email = process.env.FACEBOOK_EMAIL;
const password = process.env.FACEBOOK_PASSWORD;
const profileId = process.env.FACEBOOK_PROFILE_ID;
const shouldShowHead = process.env.SHOW_PUPPETEER_HEAD === "true" ? true : false;
const pageId = process.env.FACEBOOK_PAGE_ID;
async function createBrowser() {
    const browser = await puppeteer_1.default.launch({
        headless: !shouldShowHead,
        slowMo: constants_1.default.slowMo,
        args: ["--no-sandbox", "--disable-notifications"] //chromium notifs get in the way when in non headless mode
    });
    return browser;
}
exports.createBrowser = createBrowser;
async function createPage(browser) {
    const _page = await browser.newPage();
    await _page.setCacheEnabled(true);
    _page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"); //so we don't look like a bot
    _page.setViewport({ width: 1500, height: 1500 });
    exports.page = _page;
}
exports.createPage = createPage;
async function login() {
    if (!email || !password || !profileId || !pageId) {
        throw new Error("email or password or profileId or pageId env vars not set");
    }
    await exports.page.goto(utils_1.likesPageURL(profileId));
    await exports.page.waitForSelector("#email");
    await exports.page.type("#email", email);
    await exports.page.type("#pass", password);
    await exports.page.click("#loginbutton");
    await exports.page.waitForNavigation();
    if ((await exports.page.$("#login_form")) !== null) {
        //error logging in, prolly coz cookies thing
        await exports.page.type("#pass", password);
        await exports.page.click("#loginbutton");
    }
    console.log("login done");
}
exports.login = login;
