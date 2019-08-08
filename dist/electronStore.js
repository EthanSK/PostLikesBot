"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_store_1 = __importDefault(require("electron-store"));
const utils_1 = require("./utils");
const store = new electron_store_1.default();
function saveStoreIfNew(postUrl) {
    const hashedKey = utils_1.hashIntFromString(postUrl).toString(); //so the key is guaranteed valid json
    const fullKeyPath = `posts.${hashedKey}`;
    const toSave = {
        postUrl,
        isPosted: false
    };
    if (!store.has(fullKeyPath)) {
        store.set(fullKeyPath, toSave);
    }
}
exports.saveStoreIfNew = saveStoreIfNew;
function updateIsPosted(isPosted, postUrl) {
    const hashedKey = utils_1.hashIntFromString(postUrl).toString(); //so the key is guaranteed valid json
    const fullKeyPath = `posts.${hashedKey}.isPosted`;
    store.set(fullKeyPath, isPosted);
}
exports.updateIsPosted = updateIsPosted;
function checkIfPosted(postUrl) {
    const hashedKey = utils_1.hashIntFromString(postUrl).toString(); //so the key is guaranteed valid json
    const fullKeyPath = `posts.${hashedKey}.isPosted`;
    const isPosted = store.get(fullKeyPath);
    console.log("isPosted: ", isPosted);
    return isPosted;
}
exports.checkIfPosted = checkIfPosted;
function saveUserDefault(key, value) {
    console.log("saving user default: ", key, value);
    store.set(key, value);
}
exports.saveUserDefault = saveUserDefault;
function getUserDefault(key) {
    console.log("getting user default: ", key);
    return store.get(key);
}
exports.getUserDefault = getUserDefault;
