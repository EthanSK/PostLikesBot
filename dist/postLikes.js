"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("./puppeteer");
const utils_1 = require("./utils");
const pageId = process.env.FACEBOOK_PAGE_ID;
async function postLikes() {
    try {
        await goToFBPage();
        await uploadImage();
    }
    catch (error) {
        console.error("error posting likes: ", error);
    }
}
exports.default = postLikes;
async function goToFBPage() {
    await puppeteer_1.page.goto(utils_1.fbPageURL(pageId));
    console.log("at facebook page");
}
async function uploadImage() {
    await puppeteer_1.page.waitForSelector('[data-testid="photo-video-button"]');
    await utils_1.delay(); //needed despite waitforselector hmmm
    await puppeteer_1.page.click('[data-testid="photo-video-button"]');
    await utils_1.delay();
    //works until here
    // await page.waitForSelector('input[type="file"]')
    // const input = await page.$('input[type="file"]')
    const [button] = await puppeteer_1.page.$x("//div[contains(text(), 'Upload Photos/Video')]");
    await button.click();
    await button.click();
    await button.click(); //because it seems like the first click just highlights the section
    // const fileChooser = await page.waitForFileChooser()
    // await delay()
    // fileChooser.accept(["./testImage.png"])
    // await input!.uploadFile("./testImage.png")
    // await page.click('[data-testid="react-composer-post-button"]')
    console.log("upload image done");
}
