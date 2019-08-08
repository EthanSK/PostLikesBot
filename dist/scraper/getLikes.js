"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("./puppeteer");
const userDefaults_1 = require("../user/userDefaults");
async function getLikedPosts() {
    try {
        await goToLikesPage();
        const postUrls = await getRecentImages();
        return postUrls;
    }
    catch (error) {
        console.error("error getting likes: ", error);
    }
}
exports.default = getLikedPosts;
async function goToLikesPage() {
    await puppeteer_1.page.goto(likesPageURL(userDefaults_1.userDefaults.get("facebookProfileId")));
    await puppeteer_1.page.waitForSelector("#facebook");
    console.log("at likes page");
}
async function getRecentImages() {
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
    console.log("valid photo post urls: ", validPhotoURLs);
    return validPhotoURLs;
}
function likesPageURL(userProfileId) {
    return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`;
}
exports.likesPageURL = likesPageURL;
