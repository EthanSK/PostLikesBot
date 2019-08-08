"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
exports.UIElems = [
    "facebookPageId",
    "facebookProfileId",
    "facebookEmail",
    "facebookPassword"
];
//REMEMBER - all console.log goes to app window
function listenToElementChanges(id) {
    document.getElementById(id).onchange = function () {
        console.log("element changed", id);
        const data = {
            id,
            value: document.getElementById(id).value
        };
        electron_1.ipcRenderer.send("ui-elem-changed", data);
    };
}
electron_1.ipcRenderer.on("ui-elem-data-res", function (event, data) {
    console.log("ui data response: ", data);
    const elem = document.getElementById(data.id);
    const elemAttr = elem.getAttribute("type");
    if (elemAttr === "text" || elemAttr === "password") {
        ;
        elem.value = data.value;
    }
});
function setupUIElem(id) {
    electron_1.ipcRenderer.send("ui-elem-data-req", id);
}
exports.UIElems.forEach(el => {
    setupUIElem(el);
    listenToElementChanges(el);
});
