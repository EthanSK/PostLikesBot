"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
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
function setupUIElem(id) {
    electron_1.ipcRenderer.send("ui-elem-data-req", id);
}
exports.UIElems.forEach(el => {
    setupUIElem(el);
    listenToElementChanges(el);
});
