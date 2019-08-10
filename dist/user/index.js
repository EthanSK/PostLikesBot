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
    "messageToPost",
    "messageToPost2",
    "facebookProfileId",
    "facebookEmail",
    "facebookPassword",
    "shouldShowPuppeteerHead",
    "shouldAddMessageToPosts",
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
        }
        showUIElemsIfNeeded(id); //this needs to be done after the value changes so we have the new value
        console.log("new value: ", value, "type: ", type);
        const data = {
            id,
            value
        };
        electron_1.ipcRenderer.send("ui-elem-changed", data);
    };
}
function showUIElemsIfNeeded(idOfElem) {
    const elemsOfInterest = [
        "postPreference",
        "shouldAddMessageToPosts"
    ];
    if (elemsOfInterest.includes(idOfElem)) {
        //this is just for efficiency, so we don't update every time, but it shouldn't affect the logic if it is called infinitely
        console.log("idOfElem", idOfElem);
        updateDueToPostPreference();
        updateDueToAddMessage();
    }
    function updateDueToPostPreference() {
        const boxContainer2 = document.getElementById("pageIdBoxContainer2");
        const label1 = document.getElementById("textBoxLabelPageId1");
        if (document.getElementById("postPreference").value ===
            "bothToDiffPages") {
            boxContainer2.style.display = "flex";
            label1.innerText = "facebook page ID (likes)";
        }
        else {
            boxContainer2.style.display = "none";
            label1.innerText = "facebook page ID";
        }
    }
    function updateDueToAddMessage() {
        const boxContainer1 = document.getElementById("messageToPostContainer1");
        const boxContainer2 = document.getElementById("messageToPostContainer2");
        const label1 = document.getElementById("textBoxLabelAddMessage1");
        if (document.getElementById("shouldAddMessageToPosts")
            .checked === true) {
            boxContainer1.style.display = "flex";
            if (document.getElementById("postPreference")
                .value === "bothToDiffPages") {
                boxContainer2.style.display = "flex";
                label1.innerText = "message to post (likes)";
            }
            else {
                label1.innerText = "message to post";
                boxContainer2.style.display = "none";
            }
        }
        else {
            boxContainer2.style.display = "none";
            boxContainer1.style.display = "none";
        }
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
    if (data.value === null || data.value === undefined) {
        //false is fine
        console.log("no value stored for user default so not setting", data.id);
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
    }
    showUIElemsIfNeeded(data.id);
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