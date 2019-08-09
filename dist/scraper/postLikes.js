"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("./puppeteer");
const utils_1 = require("../utils");
const electronStore_1 = require("../user/electronStore");
const userDefaults_1 = require("../user/userDefaults");
const main_1 = require("../user/main");
const runner_1 = require("./runner");
async function postLikes(memes) {
    try {
        await goToFBPage();
        for (const meme of memes) {
            main_1.sendToConsoleOutput(`Posting image with URL ${meme.postUrl}`, "loading");
            await uploadImage(meme.file);
            await electronStore_1.updateIsPosted(true, meme.postUrl);
            main_1.sendToConsoleOutput("Successfully posted image", "success");
        }
    }
    catch (error) {
        if (!runner_1.wasLastRunStoppedForcefully) {
            main_1.sendToConsoleOutput("Error posting to page: " + error.message, "error");
        }
        else {
            console.log("not logging error as it was stopped forcefully");
        }
    }
}
exports.default = postLikes;
async function goToFBPage() {
    await puppeteer_1.page.goto(fbPageURL(userDefaults_1.userDefaults.get("facebookPageId")));
    const [brokenPageElem] = await puppeteer_1.page.$x("//title[contains(text(), 'Page Not Found')]");
    if (brokenPageElem) {
        throw new Error("There was an error going to your facebook page. Please check your page ID was input correctly.");
    }
    console.log("at facebook page");
}
async function uploadImage(file) {
    // await delay() //needed despite waitforselector hmmm
    const selector = '[data-testid="photo-video-button"]';
    await puppeteer_1.page.waitForSelector(selector);
    await puppeteer_1.page.click(selector);
    // await delay()
    //works until here
    // await page.waitForSelector('input[type="file"]')
    // const input = await page.$('input[type="file"]')
    const xPath = "//div[contains(text(), 'Upload Photos/Video')]"; //needs to be text(), full stop does't work
    await puppeteer_1.page.waitForXPath(xPath);
    const [button] = await puppeteer_1.page.$x(xPath);
    async function triggerFileSelect() {
        await button.click();
        await utils_1.delay(1000); //because rapid succession can fucc up
        await button.click(); //because it seems like the first click just highlights the section
    }
    const [fileChooser] = await Promise.all([
        puppeteer_1.page.waitForFileChooser(),
        triggerFileSelect()
    ]);
    console.log("choosing image...");
    await fileChooser.accept([file]); //rel to project root
    await utils_1.delay();
    // await page.screenshot({ path: "logs/screenshots/imagess.png" })
    console.log("sharing image...");
    await puppeteer_1.page.click('[data-testid="react-composer-post-button"]');
    await utils_1.delay(5000); //give it a good long delay so it can post the pic
    console.log("upload image done");
}
function fbPageURL(pageId) {
    return `https://www.facebook.com/${pageId}`;
}
exports.fbPageURL = fbPageURL;
//# sourceMappingURL=postLikes.js.map