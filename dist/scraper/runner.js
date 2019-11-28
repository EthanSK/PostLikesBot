"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getLikes_1 = __importDefault(require("./getLikes"));
const puppeteer_1 = require("./puppeteer");
const postLikes_1 = __importDefault(require("./postLikes"));
const utils_1 = require("../utils");
const path_1 = __importDefault(require("path"));
const electronStore_1 = require("../user/electronStore");
const electron_1 = require("electron");
const main_1 = require("../user/main");
const userDefaults_1 = require("../user/userDefaults");
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
    //don't send console out about skipping posts, coz user can change value between now and when they are actually scanned
    try {
        setWasLastRunStoppedForcefully(false);
        browser = await puppeteer_1.createBrowser();
        await puppeteer_1.createPage(browser);
        main_1.sendToConsoleOutput("Logging in", "loading");
        await puppeteer_1.login();
        main_1.sendToConsoleOutput("Getting liked/reacted posts", "loading");
        const gottenPosts = await getLikes_1.default();
        //this shows when stopping manually, and we don't want that so just don't show it
        // if (!gottenPosts) {
        //   sendToConsoleOutput("Couldn't find any posts", "sadtimes")
        //   //CAN'T RETURN HERE OTHERWISE CLEANUP WON'T HAPPEN
        // }
        main_1.sendToConsoleOutput(`Scanning ${gottenPosts.length} most recent posts`, "loading");
        console.log("app data store: ", electron_1.app.getPath("userData"));
        for (const post of gottenPosts) {
            electronStore_1.saveStoreIfNew(post); //is sync
        }
        const filteredPosts = gottenPosts.filter(post => electronStore_1.checkIfNeedsPosting(post));
        main_1.sendToConsoleOutput(`Found ${filteredPosts.length} new posts that might need to be posted`, "info");
        const imagesDir = electron_1.app.getPath("temp");
        let postsToPost = [];
        for (const post of filteredPosts) {
            if (userDefaults_1.userDefaults.get("postPreference") === "onlyLikes" &&
                post.reaction !== "like") {
                continue;
            }
            if (userDefaults_1.userDefaults.get("postPreference") === "onlyReacts" &&
                post.reaction !== "react") {
                continue;
            } //then the other two still require both likes and reacts to be downloaded.
            if (userDefaults_1.userDefaults.get("shouldSkipCurrentlyLikedPosts") === true) {
                electronStore_1.updateIsSkipped(true, post.postUrl);
                main_1.sendToConsoleOutput(`Skipping post at ${post.postUrl} permanently because you checked the don't post currently liked/reacted posts box`, "info");
                continue;
            }
            const reactionText = post.reaction === "like" ? "liked" : "reacted to";
            const postTypeText = post.type === "photo" ? "photo" : "image in post";
            main_1.sendToConsoleOutput(`Downloading ${reactionText} ${postTypeText} at ${post.postUrl}`, "loading");
            const imageUrl = await getImageUrl(post.postUrl);
            const file = path_1.default.join(imagesDir, postsToPost.length.toString() + ".png");
            if (imageUrl) {
                await utils_1.downloadImage(imageUrl, file);
                postsToPost.push({
                    postUrl: post.postUrl,
                    reaction: post.reaction,
                    file
                });
                main_1.sendToConsoleOutput("Downloaded image successfully", "info");
            }
            else {
                electronStore_1.updateIsInvalidImageURL(true, post.postUrl);
                main_1.sendToConsoleOutput("Couldn't find the image URL (the post might not be an image, so it's safe to ignore this)", "sadtimes");
            }
        }
        if (postsToPost.length > 0) {
            main_1.sendToConsoleOutput("Preparing to post images", "loading");
            await postLikes_1.default(postsToPost);
        }
        else {
            main_1.sendToConsoleOutput("Nothing to post", "info");
        }
        main_1.sendToConsoleOutput("Cleaning up", "loading");
        await cleanup();
        main_1.sendToConsoleOutput("Finished the run at " + new Date(), "startstop");
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
        const attempt1Selector = ".permalinkPost img.scaledImageFitWidth.img, .permalinkPost img.scaledImageFitHeight.img"; //this doesn't work for group posts.
        // we could use .userContentWrapper  img.scaledImageFitWidth.img which works for everything, although there could be multiple on a page so we are relying that the first one returned is the correct one, which it should be anyway. or we query a second time if the first one didn't work. yeah i prefer that.
        const attempt2Selector = ".userContentWrapper img.scaledImageFitWidth.img, .permalinkPost img.scaledImageFitHeight.img"; //so far i've only seen this selector needed for posts liked from groups. if the group post is not an image, it won't match anything which is good
        const linkSelector = '.permalinkPost div[data-tooltip-content="Show more information about this link"]'; //we don't wanna post this since it's a link to an article or something
        const link = await puppeteer_1.page.$(linkSelector);
        if (link) {
            return null;
        }
        let image = await puppeteer_1.page.$(attempt1Selector);
        if (!image) {
            image = await puppeteer_1.page.$(attempt2Selector);
        }
        imageUrl = await (await image.getProperty("src")).jsonValue();
        console.log("image url: ", imageUrl, "from this post: ", postUrl);
    }
    catch (error) {
        console.log("error finding image, prolly coz it's a video or no permalinkPost", error.message);
    }
    return imageUrl;
}
//# sourceMappingURL=runner.js.map