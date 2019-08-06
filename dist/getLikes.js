"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const puppeteer_1 = require("./puppeteer");
const profileId = process.env.FACEBOOK_PROFILE_ID;
async function getLikes() {
    try {
        await goToLikesPage();
        const photoURLs = await getRecentLikes();
        return photoURLs;
    }
    catch (error) {
        console.error("error getting likes: ", error);
    }
}
exports.default = getLikes;
async function goToLikesPage() {
    await puppeteer_1.page.goto(utils_1.likesPageURL(profileId));
    await puppeteer_1.page.waitForSelector("#facebook");
    console.log("at likes page");
}
async function getRecentLikes() {
    const profileLinks = await puppeteer_1.page.$$(".profileLink");
    let validPhotoURLs = [];
    for (const profileLink of profileLinks) {
        const hrefHandle = await profileLink.getProperty("href");
        const innerTextHandle = await profileLink.getProperty("innerHTML");
        const href = await hrefHandle.jsonValue();
        const innerHTML = await innerTextHandle.jsonValue();
        if (innerHTML === "photo" && !href.includes("photo.php")) {
            //photo.php is only present in profile photo urls, not page photo urls, by inspection
            validPhotoURLs.push(href);
        }
    }
    console.log("valid photo urls: ", validPhotoURLs);
    return validPhotoURLs;
}
