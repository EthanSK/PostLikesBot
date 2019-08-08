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
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const electronStore_1 = require("./electronStore");
const electron_1 = require("electron");
const main_1 = require("./main");
let browser;
async function closeBrowser() {
    try {
        await browser.close();
        main_1.setIsStopping(false);
    }
    catch (error) {
        console.error("error closing browser: ", error);
    }
}
exports.closeBrowser = closeBrowser;
async function stoppableRun() {
    main_1.sendToConsoleOutput("Started running at " + new Date());
    const iter = run();
    let resumeValue;
    try {
        for (;;) {
            if (main_1.startButtonState === "stateNotRunning") {
                console.log("stopping run early");
                main_1.sendToConsoleOutput("Stopped running early.");
                await cleanup();
                main_1.setIsStopping(false);
                return;
            }
            const n = iter.next(resumeValue);
            if (n.done) {
                main_1.sendToConsoleOutput("Finished a run through!");
                return n.value;
            }
            resumeValue = await n.value;
        }
    }
    catch (error) {
        console.error("error stoppableRun: ", error);
    }
}
exports.default = stoppableRun;
async function cleanup() {
    if (browser) {
        await browser.close();
    }
}
function* run() {
    //is a generator, the yield is like pause points that allow us to, to a good degree, stop the function before the next yield
    try {
        browser = yield puppeteer_1.createBrowser();
        yield puppeteer_1.createPage(browser);
        yield puppeteer_1.login();
        const urls = yield getLikes_1.default();
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
            const imageUrl = yield utils_1.getImageUrl(postUrl);
            const file = path_1.default.join(imagesDir, memes.length.toString() + ".png");
            if (imageUrl) {
                yield utils_1.downloadImage(imageUrl, file);
                memes.push({
                    postUrl,
                    file
                });
            }
        }
        yield postLikes_1.default(memes);
        yield cleanup();
        console.log("finished!");
        return;
    }
    catch (error) {
        console.error("error: ", error);
        return;
    }
}
