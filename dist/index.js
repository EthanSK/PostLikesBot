"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const puppeteer_1 = require("./puppeteer");
const postLikes_1 = __importDefault(require("./postLikes"));
async function main() {
    try {
        const browser = await puppeteer_1.createBrowser();
        await puppeteer_1.createPage(browser);
        await puppeteer_1.login();
        return await postLikes_1.default();
        // const urls = await getLikes()
        // await mongooseConnect()
        // if (!urls) {
        //   return
        // }
        // for (const url of urls) {
        //   const exists = await checkIfDocExists(url)
        //   if (!exists) {
        //     //so we don't overwrite the isposted data
        //     await saveNewDocToMongo(url)
        //   }
        //   //   await updateIsPosted(false, url)
        // }
        await browser.close();
    }
    catch (error) {
        console.error("error: ", error);
    }
}
main();
