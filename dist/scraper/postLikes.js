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
        if (userDefaults_1.userDefaults.get("postPreference") === "bothToDiffPages") {
            await prepareAndStart(memes.filter(el => el.reaction === "like"), userDefaults_1.userDefaults.get("facebookPageId"), userDefaults_1.userDefaults.get("messageToPost") //will check if should add message later
            );
            await prepareAndStart(memes.filter(el => el.reaction === "react"), userDefaults_1.userDefaults.get("facebookPageId2"), userDefaults_1.userDefaults.get("messageToPost2"));
        }
        else {
            await prepareAndStart(memes, userDefaults_1.userDefaults.get("facebookPageId"), userDefaults_1.userDefaults.get("messageToPost"));
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
async function prepareAndStart(memes, pageId, textToAdd) {
    await goToFBPage(pageId);
    for (const meme of memes) {
        const reactionText = meme.reaction === "like" ? "liked" : "reacted to";
        main_1.sendToConsoleOutput(`Posting ${reactionText} image with URL ${meme.postUrl} to page with ID ${pageId}`, "loading");
        if (userDefaults_1.userDefaults.get("shouldAddMessageToPosts")) {
            await createAndUpload(meme.file, textToAdd);
        }
        else {
            await createAndUpload(meme.file);
        }
        await electronStore_1.updateIsPosted(true, meme.postUrl);
        main_1.sendToConsoleOutput("Successfully posted image", "success");
    }
}
async function goToFBPage(pageId) {
    await puppeteer_1.page.goto(fbPageURL(pageId));
    const [brokenPageElem] = await puppeteer_1.page.$x("//title[contains(text(), 'Page Not Found')]");
    if (brokenPageElem) {
        throw new Error("There was an error going to your facebook page. Please check your page ID was input correctly.");
    }
    console.log("at facebook page");
}
async function createAndUpload(file, textToAddIfAny) {
    //FB CHANGED THEIR HTML! this is the old way. haven't fixed it yet TODO
    const selector = '[data-testid="photo-video-button"]';
    await puppeteer_1.page.waitForSelector(selector);
    await puppeteer_1.page.click(selector);
    const xPath = "//div[contains(text(), 'Upload Photos/Video')]"; //needs to be text(), full stop does't work
    await puppeteer_1.page.waitForXPath(xPath); //this seems to now throw exception because fb doesn't show the upload button unless the webpage is being viewed with non headless mode
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
    console.log("choosing image");
    await fileChooser.accept([file]); //rel to project root
    // const uploadHandle = await page.waitForSelector('input[type="file" i]')
    // uploadHandle.uploadFile(file)
    await utils_1.delay();
    console.log("sharing image");
    if (textToAddIfAny) {
        await addTextToPost(textToAddIfAny); //do it after coz if doing it before it changes spotlight focus
    }
    await puppeteer_1.page.waitForSelector('div[data-testid="media-attachment-photo"] img'); //wait for image to upload before clicking post
    console.log("uploaded image");
    await puppeteer_1.page.click('[data-testid="react-composer-post-button"]'); //doesn't seem to find this when headless mode
    await utils_1.delay(10000); //it needs time to upload, and i currently can't tell for sure when it's uploaded fully even with the waiting for selector img
}
async function addTextToPost(text) {
    console.log("adding text to post");
    const selector = 'div[aria-label="Write a post..."], div[aria-label="Say something about this photo..."]';
    await puppeteer_1.page.waitForSelector(selector);
    await puppeteer_1.page.type(selector, text);
}
function fbPageURL(pageId) {
    return `https://www.facebook.com/${pageId}`;
}
exports.fbPageURL = fbPageURL;
//# sourceMappingURL=postLikes.js.map