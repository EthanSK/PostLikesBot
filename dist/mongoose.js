"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
async function mongooseConnect() {
    console.log("mongo username: ", mongoUsername);
    if (!mongoUsername || !mongoPassword) {
        throw new Error("mongo username or password not set in env vars");
    }
    mongoose_1.default.connect(`mongodb+srv://${mongoUsername}:${mongoPassword}@postlikesbot-28rjt.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true });
    var db = mongoose_1.default.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
        console.log("connected to mongo");
    });
}
mongooseConnect();
