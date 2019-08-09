"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const constants_1 = __importDefault(require("../constants"));
exports.UIElems = [
    "facebookPageId",
    "facebookProfileId",
    "facebookEmail",
    "facebookPassword",
    "shouldShowPuppeteerHead",
    "shouldStartRunningWhenAppOpens",
    "shouldSkipCurrentlyLikedPosts",
    "shouldOpenAtLogin"
];
//REMEMBER - all console.log goes to app window
function listenToElementChanges(id) {
    document.getElementById(id).onchange = function () {
        console.log("element changed", id);
        const elem = document.getElementById(id);
        const elemType = elem.getAttribute("type");
        let value;
        if (elemType === "text" || elemType === "password") {
            value = elem.value;
        }
        else if (elemType === "checkbox") {
            value = elem.checked;
            console.log("but the value is ", value);
        }
        const data = {
            id,
            value
        };
        electron_1.ipcRenderer.send("ui-elem-changed", data);
    };
}
//restore data to ui ---
function setupUIElem(id) {
    electron_1.ipcRenderer.send("ui-elem-data-req", id);
}
exports.UIElems.forEach(el => {
    setupUIElem(el);
    listenToElementChanges(el);
});
electron_1.ipcRenderer.on("ui-elem-data-res", function (event, data) {
    console.log("ui data response: ", data);
    const elem = document.getElementById(data.id);
    const elemType = elem.getAttribute("type");
    if (elemType === "text" || elemType === "password") {
        ;
        elem.value = data.value;
    }
    else if (elemType === "checkbox") {
        ;
        elem.checked = data.value;
    }
});
//----
function listenToStartButton() {
    const id = "startButton";
    document.getElementById(id).addEventListener("click", function () {
        const elem = document.getElementById(id);
        console.log("start button state: ", elem.className);
        switch (elem.className) {
            case "stateNotRunning":
                electron_1.ipcRenderer.send("start-running-req");
                break;
            case "stateRunning":
                electron_1.ipcRenderer.send("stop-running-req");
                break;
        }
    });
}
electron_1.ipcRenderer.on("start-state-res", function (event, state) {
    const id = "startButton";
    const elem = document.getElementById(id);
    switch (state) {
        case "stateRunning":
            elem.innerText = "Stop running";
            elem.classList.remove("stateNotRunning");
            elem.classList.add("stateRunning");
            break;
        case "stateNotRunning":
            elem.innerText = "Start running";
            elem.classList.remove("stateRunning");
            elem.classList.add("stateNotRunning");
            break;
    }
});
listenToStartButton();
electron_1.ipcRenderer.on("console-output", function (event, newText) {
    sendToConsole(newText);
});
function sendToConsole(newText) {
    const elem = document.getElementById("consoleOutput");
    elem.value += newText + "\n\n";
    if (elem.value.length > constants_1.default.maxConsoleOutputChars) {
        const split = elem.value.split("\n\n");
        console.log("split: ", split);
        split.shift();
        elem.value = split.join("\n\n");
    }
    elem.scrollTop = elem.scrollHeight;
    console.log("output to console");
}
//# sourceMappingURL=index.js.map