"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = require("./mongoose");
const puppeteer_1 = require("./puppeteer");
const postLikes_1 = __importDefault(require("./postLikes"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
async function main() {
    try {
        const browser = await puppeteer_1.createBrowser();
        await puppeteer_1.createPage(browser);
        await puppeteer_1.login();
        // const urls = await getLikedPosts()
        await mongoose_1.mongooseConnect();
        // if (!urls) {
        //   return
        // }
        // for (const url of urls) {
        //   const exists = await checkIfDocExists(url)
        //   if (!exists) {
        //     //so we don't overwrite the isposted data
        //     // console.log("saving url to mongo: ", url)
        //     await saveNewDocToMongo(url)
        //   }
        // }
        const unpostedUrls = await mongoose_1.getUnpostedPostUrls();
        const imagesDir = "./tmp";
        utils_1.createNewDir(imagesDir);
        let downloadTasks = [];
        let counter = 0;
        for (const postUrl of unpostedUrls) {
            const imageUrl = await utils_1.getImageUrl(postUrl);
            if (imageUrl) {
                downloadTasks.push(utils_1.downloadImage(imageUrl, path_1.default.join(imagesDir, counter.toString() + ".png")));
            }
            counter += 1;
        }
        // await Promise.all(downloadTasks)
        return;
        await postLikes_1.default();
        await browser.close();
    }
    catch (error) {
        console.error("error: ", error);
    }
}
main();
