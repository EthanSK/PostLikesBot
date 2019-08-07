import { app, BrowserWindow, ipcMain as ipc, dialog } from "electron"
import * as path from "path"
import run from "./index"
import constants from "./constants"
let mainWindow: Electron.BrowserWindow | null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 700,
    width: 950,
    minWidth: 650,
    minHeight: 400,
    titleBarStyle: "hiddenInset",
    title: constants.appName,
    webPreferences: {
      nodeIntegration: true //otherwise require dosen't work in html
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../public/index.html"))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // run()

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.setName(constants.appName)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipc.on("facebokPageIdTextBoxChanged", function(event, data) {
  console.log("ipc event triggered: ", data)
  // saveUserDefault(
  //   "facebookPageId",
  //   document.getElementById("facebokPageIdTextBox")!.nodeValue!
  // )
})
