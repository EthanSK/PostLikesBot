"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
let db;
async function openDb(dbFile) {
    return new Promise((resolve, reject) => {
        db = new sqlite3_1.default.Database(dbFile, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.openDb = openDb;
async function createTable() { }
exports.createTable = createTable;
async function closeDb() {
    return new Promise((resolve, reject) => {
        db.close(err => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.closeDb = closeDb;
//using electron-store since this doesnt' work
