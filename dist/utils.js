"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("./constants"));
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = require("./puppeteer");
const request_1 = __importDefault(require("request"));
function delay(ms = constants_1.default.defaultDelayMillis) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
function likesPageURL(userProfileId) {
    return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`;
}
exports.likesPageURL = likesPageURL;
function fbPageURL(pageId) {
    return `https://www.facebook.com/${pageId}`;
}
exports.fbPageURL = fbPageURL;
async function getImageUrl(postUrl) {
    await puppeteer_1.page.goto(postUrl);
    await puppeteer_1.page.waitForSelector('img[class="spotlight"]');
    const imageUrl = await puppeteer_1.page.$eval('img[class="spotlight"]', el => el.getAttribute("src"));
    console.log("image url: ", imageUrl, "from this post: ", postUrl);
    return imageUrl;
}
exports.getImageUrl = getImageUrl;
var deleteFolderRecursive = function (path) {
    if (fs_1.default.existsSync(path)) {
        fs_1.default.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs_1.default.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            }
            else {
                // delete file
                fs_1.default.unlinkSync(curPath);
            }
        });
        fs_1.default.rmdirSync(path);
    }
};
function createNewDir(dir) {
    if (fs_1.default.existsSync(dir)) {
        deleteFolderRecursive(dir);
    }
    fs_1.default.mkdirSync(dir);
}
exports.createNewDir = createNewDir;
function downloadImage(uri, file) {
    return new Promise((resolve, reject) => {
        request_1.default.head(uri, function (err, res, body) {
            request_1.default(uri)
                .pipe(fs_1.default.createWriteStream(file))
                .on("close", () => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
exports.downloadImage = downloadImage;
function hashIntFromString(str) {
    var hash = 0, i, chr;
    if (str.length === 0)
        return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
exports.hashIntFromString = hashIntFromString;
