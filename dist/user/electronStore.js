"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_store_1 = __importDefault(require("electron-store"));
const utils_1 = require("../utils");
const store = new electron_store_1.default();
const constants_1 = __importDefault(require("../constants"));
function saveStoreIfNew(post) {
    const hashedKey = utils_1.hashIntFromString(post.postUrl).toString(); //so the key is guaranteed valid json
    const fullKeyPath = `${constants_1.default.postsSaveKey}.${hashedKey}`;
    let toSave = Object.assign(post);
    toSave.isPosted = false;
    if (!store.has(fullKeyPath)) {
        store.set(fullKeyPath, toSave);
    }
}
exports.saveStoreIfNew = saveStoreIfNew;
function updateBoolProp(prop, postUrl, value) {
    const hashedKey = utils_1.hashIntFromString(postUrl).toString(); //so the key is guaranteed valid json
    const fullKeyPath = `${constants_1.default.postsSaveKey}.${hashedKey}.${prop}`;
    store.set(fullKeyPath, value);
}
exports.updateBoolProp = updateBoolProp;
function updateIsPosted(isPosted, postUrl) {
    updateBoolProp("isPosted", postUrl, isPosted);
}
exports.updateIsPosted = updateIsPosted;
function updateIsSkipped(isSkipped, postUrl) {
    //if the user clicks don't post currently liked/reacted posts
    updateBoolProp("isSkipped", postUrl, isSkipped);
}
exports.updateIsSkipped = updateIsSkipped;
//set if couldn't find image url so we don't try again.
function updateIsInvalidImageURL(isInvalidImageURL, postUrl) {
    updateBoolProp("isInvalidImageURL", postUrl, isInvalidImageURL);
}
exports.updateIsInvalidImageURL = updateIsInvalidImageURL;
function checkIfNeedsPosting(post) {
    const hashedKey = utils_1.hashIntFromString(post.postUrl).toString(); //so the key is guaranteed valid json
    const fullKeyPathIsPosted = `${constants_1.default.postsSaveKey}.${hashedKey}.isPosted`;
    const fullKeyPathIsInvalidImageURL = `${constants_1.default.postsSaveKey}.${hashedKey}.isInvalidImageURL`;
    const fullKeyPathIsSkipped = `${constants_1.default.postsSaveKey}.${hashedKey}.isSkipped`;
    const isPosted = store.get(fullKeyPathIsPosted);
    const isInvalidImageURL = store.get(fullKeyPathIsInvalidImageURL);
    const isSkipped = store.get(fullKeyPathIsSkipped);
    console.log("isPosted: ", isPosted, "isInvalidImageURL: ", isInvalidImageURL);
    return !isPosted && !isInvalidImageURL && !isSkipped;
}
exports.checkIfNeedsPosting = checkIfNeedsPosting;
function saveUserDefault(key, value) {
    // return store.clear()
    console.log("saving user default: ", key, value);
    store.set(key, value);
}
exports.saveUserDefault = saveUserDefault;
function getUserDefault(key) {
    // store.clear()
    console.log("getting user default: ", key);
    const res = store.get(key);
    // console.log("it has value: ", res)
    return res;
}
exports.getUserDefault = getUserDefault;
//# sourceMappingURL=electronStore.js.map