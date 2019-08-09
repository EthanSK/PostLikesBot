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
let browser;
exports.wasLastRunStoppedForcefully = false;
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
    main_1.sendToConsoleOutput("Started running at " + new Date(), "startstop");
    try {
        setWasLastRunStoppedForcefully(false);
        browser = await puppeteer_1.createBrowser();
        await puppeteer_1.createPage(browser);
        main_1.sendToConsoleOutput("Logging in", "loading");
        await puppeteer_1.login();
        main_1.sendToConsoleOutput("Getting liked/reacted posts", "loading");
        const urls = await getLikes_1.default();
        if (!urls) {
            main_1.sendToConsoleOutput("Couldn't find any post", "sadtimes");
            return;
        }
        main_1.sendToConsoleOutput(`Scanning ${urls.length} most recent posts`, "loading");
        console.log("app data store: ", electron_1.app.getPath("userData"));
        for (const url of urls) {
            electronStore_1.saveStoreIfNew(url); //is sync
        }
        const unpostedUrls = urls.filter(url => !electronStore_1.checkIfPosted(url));
        main_1.sendToConsoleOutput(`Found ${unpostedUrls.length} posts that need to be posted`, "info");
        const imagesDir = electron_1.app.getPath("temp");
        let memes = [];
        for (const postUrl of unpostedUrls) {
            main_1.sendToConsoleOutput(`Downloading image in post at ${postUrl}`, "loading");
            const imageUrl = await getImageUrl(postUrl);
            const file = path_1.default.join(imagesDir, memes.length.toString() + ".png");
            if (imageUrl) {
                await utils_1.downloadImage(imageUrl, file);
                memes.push({
                    postUrl,
                    file
                });
                main_1.sendToConsoleOutput("Downloaded image successfully", "info");
            }
            else {
                main_1.sendToConsoleOutput("Couldn't find the image URL", "sadtimes");
            }
        }
        main_1.sendToConsoleOutput("Preparing to post images to your page", "loading");
        await postLikes_1.default(memes);
        main_1.sendToConsoleOutput("Cleaning up", "loading");
        await cleanup();
        main_1.sendToConsoleOutput("Finished the batch at " + new Date(), "startstop");
        return;
    }
    catch (error) {
        if (!exports.wasLastRunStoppedForcefully) {
            //otherwise it's not an actual
            main_1.sendToConsoleOutput("Error: " + error.message, "error");
        }
        else {
            console.log("not logging error as it was stopped forcefully");
        }
        return;
    }
}
exports.run = run;
function setWasLastRunStoppedForcefully(value) {
    exports.wasLastRunStoppedForcefully = value;
}
exports.setWasLastRunStoppedForcefully = setWasLastRunStoppedForcefully;
async function getImageUrl(postUrl) {
    await puppeteer_1.page.goto(postUrl);
    await puppeteer_1.page.waitForSelector('img[class="spotlight"]');
    const imageUrl = await puppeteer_1.page.$eval('img[class="spotlight"]', el => el.getAttribute("src"));
    console.log("image url: ", imageUrl, "from this post: ", postUrl);
    return imageUrl;
}
