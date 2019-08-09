"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("./puppeteer");
const userDefaults_1 = require("../user/userDefaults");
const main_1 = require("../user/main");
const runner_1 = require("./runner");
async function getLikedPosts() {
    try {
        await goToLikesPage();
        const postUrls = await getRecentImages();
        return postUrls;
    }
    catch (error) {
        if (!runner_1.wasLastRunStoppedForcefully) {
            main_1.sendToConsoleOutput("Error getting liked posts:" + error.message, "error");
        }
        else {
            console.log("not logging error as it was stopped forcefully");
        }
    }
}
exports.default = getLikedPosts;
async function goToLikesPage() {
    const url = likesPageURL(userDefaults_1.userDefaults.get("facebookProfileId"));
    // await page.waitForSelector("#facebook")
    await Promise.all([puppeteer_1.page.goto(url), puppeteer_1.page.waitForNavigation()]); //extra layer of certainty
    await puppeteer_1.page.waitForXPath("//div[contains(text(), 'Posts and Comments')]");
    console.log("at likes page");
}
async function getRecentImages() {
    await puppeteer_1.page.waitForSelector(".fbTimelineLogStream"); //just because when loading the page manually i see a slightly delay between the "post and comments" title and the list of posts
    const posts = await puppeteer_1.page.$x("//a[contains(text(), 'photo') or contains(text(), 'post')]"); //get links named photo or post
    let result = [];
    for (const post of posts) {
        let type = "neither"; //even tho we query by things containing either photo or post, they query will return things with href that contain the word 'photo', so we need to validate it properly here
        const innerText = await (await post.getProperty("innerText")).jsonValue();
        if (innerText === "photo") {
            type = "photo";
        }
        else if (innerText === "post") {
            type = "post";
        }
        else {
            continue; //we are not looking at a valid post
        }
        //see if post was liked or reacted to
        const parent = (await post.$x(".."))[0];
        const childTextNodes = await parent.$x("child::text()");
        let reaction = "neither";
        for (const textNode of childTextNodes) {
            const text = await (await textNode.getProperty("textContent")).jsonValue();
            if (text.includes("like")) {
                reaction = "like";
                break;
            }
            else if (text.includes("react")) {
                reaction = "react";
                break;
            }
        }
        if (reaction !== "neither") {
            const postUrl = await (await post.getProperty("href")).jsonValue();
            // console.log("type: ", type, "href: ", postUrl, "\n\n")
            result.push({
                postUrl,
                reaction: reaction,
                type: type === "photo" ? "photo" : "post"
            });
        }
    }
    console.log("result: ", result);
    return result;
}
function likesPageURL(userProfileId) {
    return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`;
}
exports.likesPageURL = likesPageURL;
//# sourceMappingURL=getLikes.js.map