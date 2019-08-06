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
                await mongoose_1.saveNewDocToMongo(url);
            }
            //   await updateIsPosted(false, url)
        }
        await postLikes_1.default();
        await browser.close();
    }
    catch (error) {
        console.error("error: ", error);
    }
}
main();
