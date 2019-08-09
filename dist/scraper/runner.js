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
const utils_1 = require("../utils");
const path_1 = __importDefault(require("path"));
const electronStore_1 = require("../user/electronStore");
const electron_1 = require("electron");
const main_1 = require("../user/main");
let browser;
exports.wasLastRunStoppedForcefully = false;
async function cleanup() {
    try {
        if (browser) {
            await browser.close();
        }
        main_1.setIsStopping(false); //because now we are finished the stopping process
    }
    catch (error) {
        console.error("error closing browser: ", error);
    }
}
exports.cleanup = cleanup;
async function run() {
    //is a generator, the await is like pause points that allow us to, to a good degree, stop the function before the next await
    main_1.sendToConsoleOutput("Started running at " + new Date(), "startstop");
    try {
        setWasLastRunStoppedForcefully(false);
        browser = await puppeteer_1.createBrowser();
        await puppeteer_1.createPage(browser);
        main_1.sendToConsoleOutput("Logging in", "loading");
        await puppeteer_1.login();
        main_1.sendToConsoleOutput("Getting liked/reacted posts", "loading");
        const gottenPosts = await getLikes_1.default();
        if (!gottenPosts) {
            main_1.sendToConsoleOutput("Couldn't find any posts", "sadtimes");
            //CAN'T RETURN HERE OTHERWISE CLEANUP WON'T HAPPEN
        }
        main_1.sendToConsoleOutput(`Scanning ${gottenPosts.length} most recent posts`, "loading");
        console.log("app data store: ", electron_1.app.getPath("userData"));
        for (const post of gottenPosts) {
            electronStore_1.saveStoreIfNew(post); //is sync
        }
        const unpostedPosts = gottenPosts.filter(post => !electronStore_1.checkIfPosted(post));
        main_1.sendToConsoleOutput(`Found ${unpostedPosts.length} new posts that need to be posted`, "info");
        const imagesDir = electron_1.app.getPath("temp");
        let postsToPost = [];
        for (const post of unpostedPosts) {
            const reactionText = post.reaction === "like" ? "liked" : "reacted to";
            const postTypeText = post.type === "photo" ? "photo" : "image in post";
            main_1.sendToConsoleOutput(`Downloading ${reactionText} ${postTypeText} at ${post.postUrl}`, "loading");
            const imageUrl = await getImageUrl(post.postUrl);
            const file = path_1.default.join(imagesDir, postsToPost.length.toString() + ".png");
            if (imageUrl) {
                await utils_1.downloadImage(imageUrl, file);
                postsToPost.push({
                    postUrl: post.postUrl,
                    file
                });
                main_1.sendToConsoleOutput("Downloaded image successfully", "info");
            }
            else {
                main_1.sendToConsoleOutput("Couldn't find the image URL (it might be a video, so it's safe to ignore this)", "sadtimes");
            }
        }
        if (postsToPost.length > 0) {
            main_1.sendToConsoleOutput("Preparing to post images to your page", "loading");
        }
        await postLikes_1.default(postsToPost);
        main_1.sendToConsoleOutput("Cleaning up", "loading");
        await cleanup();
        main_1.sendToConsoleOutput("Finished the batch at " + new Date(), "startstop");
        return;
    }
    catch (error) {
        if (!exports.wasLastRunStoppedForcefully) {
            //otherwise it's not an actual
            main_1.sendToConsoleOutput("Error: " + error.message, "error");
        }
        else {
            console.log("not logging error as it was stopped forcefully");
        }
        return;
    }
}
exports.run = run;
function setWasLastRunStoppedForcefully(value) {
    exports.wasLastRunStoppedForcefully = value;
}
exports.setWasLastRunStoppedForcefully = setWasLastRunStoppedForcefully;
async function getImageUrl(postUrl) {
    let imageUrl;
    await Promise.all([puppeteer_1.page.goto(postUrl), puppeteer_1.page.waitForNavigation()]);
    try {
        const image = await puppeteer_1.page.$(".permalinkPost img.scaledImageFitWidth.img, .permalinkPost img.scaledImageFitHeight.img");
        imageUrl = await (await image.getProperty("src")).jsonValue();
        console.log("image url: ", imageUrl, "from this post: ", postUrl);
    }
    catch (error) {
        console.log("error finding image, prolly coz it's a video or no permalinkPost", error.message);
    }
    return imageUrl;
}
//# sourceMappingURL=runner.js.map