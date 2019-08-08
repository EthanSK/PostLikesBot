"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getLikes_1 = __importDefault(require("./getLikes"));
const puppeteer_1 = require("./puppeteer");
const postLikes_1 = __importDefault(require("./postLikes"));
const utils_1 = require("../utils");
const path_1 = __importDefault(require("path"));
const electronStore_1 = require("../user/electronStore");
const electron_1 = require("electron");
const main_1 = require("../user/main");
const electron_log_1 = __importDefault(require("electron-log"));
let browser;
let wasLastRunStoppedForcefully = false;
async function cleanup() {
    try {
        if (browser) {
            await browser.close();
        }
        main_1.setIsStopping(false); //because now we are finished the stopping process
    }
    catch (error) {
        console.error("error closing browser: ", error);
    }
}
exports.cleanup = cleanup;
async function run() {
    //is a generator, the await is like pause points that allow us to, to a good degree, stop the function before the next await
    main_1.sendToConsoleOutput("Started running at " + new Date());
    try {
        setWasLastRunStoppedForcefully(false);
        browser = await puppeteer_1.createBrowser();
        await puppeteer_1.createPage(browser);
        await puppeteer_1.login();
        const urls = await getLikes_1.default();
        if (!urls) {
            return;
        }
        console.log("app data store: ", electron_1.app.getPath("userData"));
        for (const url of urls) {
            electronStore_1.saveStoreIfNew(url); //is sync
        }
        const unpostedUrls = urls.filter(url => !electronStore_1.checkIfPosted(url));
        const imagesDir = "./temp";
        utils_1.createNewDir(imagesDir);
        let memes = [];
        for (const postUrl of unpostedUrls) {
            const imageUrl = await getImageUrl(postUrl);
            const file = path_1.default.join(imagesDir, memes.length.toString() + ".png");
            if (imageUrl) {
                await utils_1.downloadImage(imageUrl, file);
                memes.push({
                    postUrl,
                    file
                });
            }
        }
        await postLikes_1.default(memes);
        await cleanup();
        console.log("finished!");
        return;
    }
    catch (error) {
        if (!wasLastRunStoppedForcefully) {
            //otherwise it's not an actual
            electron_log_1.default.error("run()", error);
        }
        else {
            console.log("not logging error as it was stopped forcefully");
        }
        return;
    }
}
exports.run = run;
function setWasLastRunStoppedForcefully(value) {
    wasLastRunStoppedForcefully = value;
}
exports.setWasLastRunStoppedForcefully = setWasLastRunStoppedForcefully;
async function getImageUrl(postUrl) {
    await puppeteer_1.page.goto(postUrl);
    await puppeteer_1.page.waitForSelector('img[class="spotlight"]');
    const imageUrl = await puppeteer_1.page.$eval('img[class="spotlight"]', el => el.getAttribute("src"));
    console.log("image url: ", imageUrl, "from this post: ", postUrl);
    return imageUrl;
}
