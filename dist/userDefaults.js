"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electronStore_1 = require("./electronStore");
class UserDefaults {
    set(key, value) {
        electronStore_1.saveUserDefault(key, value);
    }
    get(key) {
        return electronStore_1.getUserDefault(key);
    }
}
exports.userDefaults = new UserDefaults();
