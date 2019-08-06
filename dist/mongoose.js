"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = __importDefault(require("./constants"));
dotenv_1.default.config();
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const maxNumToPostAtATime = process.env.MAX_NUMBER_TO_POST_AT_A_TIME;
let memeSchema = new mongoose_1.default.Schema({
    postUrl: { type: String, required: true, unique: true },
    isPosted: { type: Boolean, required: true },
    timePosted: Number
});
let memeModel = mongoose_1.default.model("Meme", memeSchema);
async function mongooseConnect() {
    console.log("mongo username: ", mongoUsername);
    if (!mongoUsername || !mongoPassword) {
        throw new Error("mongo username or password not set in env vars");
    }
    var db = mongoose_1.default.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
        console.log("connected to mongo");
    });
    return mongoose_1.default.connect(`mongodb+srv://${mongoUsername}:${mongoPassword}@postlikesbot-28rjt.mongodb.net/${constants_1.default.mongoDatabaseName}?retryWrites=true&w=majority`, { useNewUrlParser: true });
}
exports.mongooseConnect = mongooseConnect;
async function saveNewDocToMongo(postUrl) {
    let meme = new memeModel({
        postUrl,
        isPosted: false
    });
    await meme.save();
}
exports.saveNewDocToMongo = saveNewDocToMongo;
async function updateIsPosted(isPosted, postUrl) {
    let obj = {
        timePosted: Date.now(),
        isPosted: isPosted
    };
    await memeModel.updateOne({ postUrl }, { $set: obj }).exec();
}
exports.updateIsPosted = updateIsPosted;
async function checkIfDocExists(postUrl) {
    let meme = await memeModel.findOne({ postUrl }).exec();
    if (meme) {
        return true;
    }
    return false;
}
exports.checkIfDocExists = checkIfDocExists;
async function checkIfPosted(postUrl) {
    let meme = await memeModel.findOne({ postUrl }).exec();
    if (meme && meme.isPosted) {
        return true;
    }
    return false;
}
exports.checkIfPosted = checkIfPosted;
async function getUnpostedPostUrls() {
    const memes = await memeModel.find({ isPosted: false }).exec();
    return memes.map(meme => meme.postUrl);
}
exports.getUnpostedPostUrls = getUnpostedPostUrls;
