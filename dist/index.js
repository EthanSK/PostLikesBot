"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getLikes_1 = __importDefault(require("./getLikes"));
const mongoose_1 = require("./mongoose");
const puppeteer_1 = require("./puppeteer");
const postLikes_1 = __importDefault(require("./postLikes"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const mongoose_2 = __importDefault(require("mongoose"));
async function main() {
    try {
        const browser = await puppeteer_1.createBrowser();
        await puppeteer_1.createPage(browser);
        await puppeteer_1.login();
        const urls = await getLikes_1.default();
        await mongoose_1.mongooseConnect();
        if (!urls) {
            return;
        }
        for (const url of urls) {
            const exists = await mongoose_1.checkIfDocExists(url);
            if (!exists) {
                //so we don't overwrite the isposted data
                // console.log("saving url to mongo: ", url)
                await mongoose_1.saveNewDocToMongo(url);
            }
        }
        const unpostedUrls = await mongoose_1.getUnpostedPostUrls();
        const imagesDir = "./tmp";
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
        await mongoose_2.default.disconnect(); //otherwise node never ends
        console.log("finished!");
        return await browser.close();
    }
    catch (error) {
        console.error("error: ", error);
    }
}
// main()
//# sourceMappingURL=index.js.map