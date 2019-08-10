"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const constants_1 = __importDefault(require("../constants"));
const userDefaults_1 = require("../user/userDefaults");
const getLikes_1 = require("./getLikes");
function getChromiumExecPath() {
    return puppeteer_1.default.executablePath().replace("app.asar", "app.asar.unpacked");
}
async function createBrowser() {
    let headless = true;
    if (userDefaults_1.userDefaults.get("shouldShowPuppeteerHead")) {
        headless = false;
    }
    const browser = await puppeteer_1.default.launch({
        headless: headless,
        slowMo: constants_1.default.slowMo,
        defaultViewport: null,
        args: [
            "--no-sandbox",
            "--disable-notifications",
            `--window-size=${constants_1.default.chromiumWidth},${constants_1.default.chromiumHeight}`
        ],
        executablePath: getChromiumExecPath()
    });
    return browser;
}
exports.createBrowser = createBrowser;
async function createPage(browser) {
    const _page = await browser.newPage();
    await _page.setCacheEnabled(true);
    await _page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"); //so we don't look like a bot
    // await _page.setViewport({ width: 1200, height: 1500 })
    exports.page = _page;
}
exports.createPage = createPage;
async function login() {
    if (!userDefaults_1.userDefaults.get("facebookEmail") ||
        !userDefaults_1.userDefaults.get("facebookPassword") ||
        !userDefaults_1.userDefaults.get("facebookProfileId") ||
        !userDefaults_1.userDefaults.get("facebookPageId")) {
        throw new Error("Email, password, profile ID, or page ID can't be found");
    }
    await exports.page.goto(getLikes_1.likesPageURL(userDefaults_1.userDefaults.get("facebookProfileId")));
    await exports.page.waitForSelector("#email");
    await exports.page.type("#email", userDefaults_1.userDefaults.get("facebookEmail"));
    await exports.page.type("#pass", userDefaults_1.userDefaults.get("facebookPassword"));
    await exports.page.click("#loginbutton");
    await exports.page.waitForNavigation();
    if ((await exports.page.$("#login_form")) !== null) {
        //error logging in, prolly coz cookies thing
        await exports.page.type("#pass", userDefaults_1.userDefaults.get("facebookPassword"));
        await exports.page.click("#loginbutton");
    }
    //if the login form STILL shows, there must be some sort of error
    if ((await exports.page.$("#login_form")) !== null) {
        throw new Error("There was an error logging in to facebook. Please check your credentials and other inputs.");
    }
    console.log("login done");
}
exports.login = login;
//# sourceMappingURL=puppeteer.js.map