"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("./constants"));
const fs_1 = __importDefault(require("fs"));
const request_1 = __importDefault(require("request"));
function delay(ms = constants_1.default.defaultDelayMillis) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
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
//# sourceMappingURL=utils.js.map