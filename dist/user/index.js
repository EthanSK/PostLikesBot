"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const constants_1 = __importDefault(require("../constants"));
exports.UIElems = [
    //must be same as html id
    "facebookPageId",
    "facebookPageId2",
    "facebookProfileId",
    "facebookEmail",
    "facebookPassword",
    "shouldShowPuppeteerHead",
    "shouldStartRunningWhenAppOpens",
    "shouldSkipCurrentlyLikedPosts",
    "shouldOpenAtLogin",
    "postPreference",
    "scheduleRuns",
    "botSlowMo"
];
//REMEMBER - all console.log goes to app window
function listenToElementChanges(id) {
    document.getElementById(id).onchange = function () {
        console.log("element changed", id);
        const elem = document.getElementById(id);
        let value;
        const type = elem.tagName.toLowerCase();
        if (type === "input") {
            const inputElemType = elem.getAttribute("type");
            if (inputElemType === "text" || inputElemType === "password") {
                value = elem.value;
            }
            else if (inputElemType === "checkbox") {
                value = elem.checked;
            }
        }
        else if (type === "select") {
            value = elem.value;
            if (id === "postPreference") {
                if (value === "bothToDiffPages") {
                    shouldShowBothPageIdBoxes(true);
                }
                else {
                    shouldShowBothPageIdBoxes(false);
                }
            }
        }
        console.log("new value: ", value, "type: ", type);
        const data = {
            id,
            value
        };
        electron_1.ipcRenderer.send("ui-elem-changed", data);
    };
}
function shouldShowBothPageIdBoxes(value) {
    // const boxContainer1 = document.getElementById("pageIdBoxContainer1")!
    console.log("shouldShowBothPageIdBoxes()", value);
    const boxContainer2 = document.getElementById("pageIdBoxContainer2");
    const label1 = document.getElementById("textBoxLabelPageId1");
    const label2 = document.getElementById("textBoxLabelPageId2");
    if (value) {
        boxContainer2.style.display = "flex";
        label1.innerText = "facebook page ID (likes)";
        label2.innerText = "facebook page ID (reacts)";
    }
    else {
        boxContainer2.style.display = "none";
        label1.innerText = "facebook page ID";
    }
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
    if (!data.value) {
        console.log("no value stored for user default so not setting");
        return;
    }
    const elem = document.getElementById(data.id);
    const type = elem.tagName.toLowerCase();
    if (type === "input") {
        const inputElemeType = elem.getAttribute("type");
        if (inputElemeType === "text" || inputElemeType === "password") {
            ;
            elem.value = data.value;
        }
        else if (inputElemeType === "checkbox") {
            ;
            elem.checked = data.value;
        }
    }
    else if (type === "select") {
        ;
        elem.value = data.value;
        if (data.id === "postPreference") {
            if (data.value === "bothToDiffPages") {
                shouldShowBothPageIdBoxes(true);
            }
            else {
                shouldShowBothPageIdBoxes(false);
            }
        }
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
            elem.innerText = "Stop";
            elem.classList.remove("stateNotRunning");
            elem.classList.add("stateRunning");
            break;
        case "stateNotRunning":
            elem.innerText = "Start";
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