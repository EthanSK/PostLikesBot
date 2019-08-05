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
let memeSchema = new mongoose_1.default.Schema({
    url: String,
    isPosted: Boolean,
    timePosted: Number
});
let Meme = mongoose_1.default.model("Meme", memeSchema);
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
mongooseConnect();
// async function saveToMongo(_url: string) {
//   let meme = new Meme({
//     url: "test"
//   })
// }
async function checkIfPosted(url) { }
