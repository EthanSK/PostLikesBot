"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const constants_1 = __importDefault(require("./constants"));
const electronStore_1 = require("./electronStore");
let mainWindow;
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        height: 700,
        width: 950,
        minWidth: 650,
        minHeight: 400,
        titleBarStyle: "hiddenInset",
        title: constants_1.default.appName,
        webPreferences: {
            nodeIntegration: true //otherwise require dosen't work in html
        }
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../public/index.html"));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // run()
    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
electron_1.app.setName(constants_1.default.appName);
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", createWindow);
// Quit when all windows are closed.
electron_1.app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
electron_1.ipcMain.on(`ui-elem-changed`, function (event, data) {
    console.log("ipc UIElemChanged triggered on data: ", data);
    electronStore_1.saveUserDefault(data.id, data.value);
});
electron_1.ipcMain.on("ui-elem-data-req", function (event, id) {
    const res = {
        id,
        value: electronStore_1.getUserDefault(id)
    };
    console.log("res: ", res);
    mainWindow.webContents.once("did-finish-load", function () {
        console.log("did finish load");
        event.sender.send("ui-elem-data-res", res);
    });
});
