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
const mongoose_1 = __importDefault(require("mongoose"));
const electronStore_1 = require("./electronStore");
const electron_1 = require("electron");
const main_1 = require("./main");
async function stoppableRun() {
    const iter = run();
    let resumeValue;
    for (;;) {
        if (main_1.startButtonState === "stateNotRunning") {
            console.log("stopping run early");
            return;
        }
        const n = iter.next(resumeValue);
        if (n.done) {
            return n.value;
        }
        resumeValue = await n.value;
    }
}
exports.default = stoppableRun;
function* run() {
    try {
        const browser = yield puppeteer_1.createBrowser();
        yield puppeteer_1.createPage(browser);
        yield puppeteer_1.login();
        const urls = yield getLikes_1.default();
        // await mongooseConnect()
        if (!urls) {
            return;
        }
        console.log("app data store: ", electron_1.app.getPath("userData"));
        for (const url of urls) {
            electronStore_1.saveStoreIfNew(url); //is sync
            // updateIsPosted(true, url)
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
        yield mongoose_1.default.disconnect(); //otherwise node never ends
        yield browser.close();
        console.log("finished!");
        return;
    }
    catch (error) {
        console.error("error: ", error);
        return;
    }
}
