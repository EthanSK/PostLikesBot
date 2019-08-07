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
    const toSave = {
        postUrl,
        isPosted: false
    };
    if (!store.has(hashedKey)) {
        store.set(hashedKey, toSave);
    }
}
exports.saveStoreIfNew = saveStoreIfNew;
function updateIsPosted(isPosted, postUrl) {
    const hashedKey = utils_1.hashIntFromString(postUrl).toString(); //so the key is guaranteed valid json
    store.set(hashedKey + ".isPosted", isPosted);
}
exports.updateIsPosted = updateIsPosted;
function checkIfPosted(postUrl) {
    const hashedKey = utils_1.hashIntFromString(postUrl).toString(); //so the key is guaranteed valid json
    const isPosted = store.get(hashedKey + ".isPosted");
    console.log("isPosted: ", isPosted);
    return isPosted;
}
exports.checkIfPosted = checkIfPosted;
