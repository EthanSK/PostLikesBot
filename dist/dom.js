"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function listenToTextBoxChanges(id) {
    document.getElementById(id).onchange = function () {
        console.log("text box changed", id);
        electron_1.ipcRenderer.send(id + "Changed", document.getElementById(id).value);
    };
}
listenToTextBoxChanges("facebokPageIdTextBox");
listenToTextBoxChanges("facebokProfileIdTextBox");
listenToTextBoxChanges("facebookEmailTextBox");
listenToTextBoxChanges("facebookPasswordTextBox");
