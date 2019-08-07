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
async function run() {
    try {
        const browser = await puppeteer_1.createBrowser();
        await puppeteer_1.createPage(browser);
        await puppeteer_1.login();
        const urls = await getLikes_1.default();
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
            const imageUrl = await utils_1.getImageUrl(postUrl);
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
        await mongoose_1.default.disconnect(); //otherwise node never ends
        await browser.close();
        console.log("finished!");
    }
    catch (error) {
        console.error("error: ", error);
    }
}
exports.default = run;
