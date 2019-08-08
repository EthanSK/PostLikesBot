import { app, BrowserWindow, ipcMain as ipc, dialog } from "electron"
import * as path from "path"
import constants from "./constants"
import { userDefaults, UserDefaultsKey } from "./userDefaults"
import { cleanup, run } from "./app"
let mainWindow: Electron.BrowserWindow | null
export let startButtonState: "stateRunning" | "stateNotRunning"
let isStopping: boolean = false
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 675,
    width: 675,
    minHeight: 675,
    minWidth: 675,
    titleBarStyle: "hiddenInset",
    title: constants.appName,
    webPreferences: {
      nodeIntegration: true //otherwise require dosen't work in html
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../public/index.html"))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  mainWindow!.webContents.once("did-finish-load", function() {
    // run() //need a start button.
  })
  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.setName(constants.appName)
app.setLoginItemSettings({
  openAtLogin: userDefaults.get("shouldOpenAtLogin"),
  path: app.getPath("exe") //option only applies on windows
})
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

ipc.on(`ui-elem-changed`, function(
  event,
  data: { id: UserDefaultsKey; value: any }
) {
  console.log("ipc UIElemChanged triggered on data: ", data)
  userDefaults.set(data.id, data.value)
})

ipc.on("ui-elem-data-req", function(event, id: UserDefaultsKey) {
  const res = {
    id,
    value: userDefaults.get(id)
  }

  console.log("res: ", res)
  mainWindow!.webContents.once("did-finish-load", function() {
    event.sender.send("ui-elem-data-res", res)
  })
})

ipc.on("start-running-req", async function(event, data) {
  console.log("orders to start running boss, isStopping: ", isStopping)
  if (!isStopping) {
    startButtonState = "stateRunning"
    event.sender.send("start-state-res", startButtonState)
    await run()
  } else {
    sendToConsoleOutput("Cannot start, still stopping")
  }
})

ipc.on("stop-running-req", async function(event, data) {
  console.log("orders to stop running")
  setIsStopping(true)
  sendToConsoleOutput("Stopping...")
  await cleanup()
  startButtonState = "stateNotRunning"
  event.sender.send("start-state-res", startButtonState)
  sendToConsoleOutput("Stopped running early.")
})

export function sendToConsoleOutput(text: string) {
  mainWindow!.webContents.send("console-output", text)
}

export function setIsStopping(to: boolean) {
  isStopping = to
}
