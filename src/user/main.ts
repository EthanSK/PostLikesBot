import { app, BrowserWindow, ipcMain as ipc, dialog } from "electron"
import * as path from "path"
import constants from "../constants"
import { userDefaults, UserDefaultsKey } from "./userDefaults"
import { cleanup, run, setWasLastRunStoppedForcefully } from "../scraper/runner"
import log from "electron-log"
import { delay } from "../utils"

let mainWindow: BrowserWindow | null
export let startButtonState: "stateRunning" | "stateNotRunning"
let isStopping: boolean = false

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 675,
    width: 700,
    minHeight: 675,
    minWidth: 700,
    titleBarStyle: "hiddenInset",
    title: constants.appName,
    webPreferences: {
      nodeIntegration: true //otherwise require dosen't work in html
    },
    show: false // so we show when everything loaded
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../../public/index.html"))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  mainWindow!.webContents.once("did-finish-load", async function() {
    // run() //need a start button.
    await delay(500) //so there is no glitch when loadidng in user defaults
    mainWindow!.show()
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
  handleUIElemChangeConsoleOutput(data.id, data.value)
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
    sendToConsoleOutput("Cannot start, process is still stopping", "info")
  }
})

ipc.on("stop-running-req", async function(event, data) {
  console.log("orders to stop running")
  setIsStopping(true)
  setWasLastRunStoppedForcefully(true)
  sendToConsoleOutput("Stopping", "loading")
  await cleanup()
  startButtonState = "stateNotRunning"
  event.sender.send("start-state-res", startButtonState)
  sendToConsoleOutput("Stopped running", "info") //don't say before it could complete because when we add the timer it won't make sense to say that.
})

export function setIsStopping(to: boolean) {
  isStopping = to
}

function handleUIElemChangeConsoleOutput(id: UserDefaultsKey, value: any) {
  if (id === "facebookPageId") {
    sendToConsoleOutput(`Changed facebook page ID to ${value}`, "settings")
  }
  if (id === "facebookPageId2") {
    sendToConsoleOutput(
      `Changed facebook page ID (reacts) to ${value}`,
      "settings"
    )
  }

  if (id === "facebookProfileId") {
    sendToConsoleOutput(`Changed facebook profile ID to ${value}`, "settings")
  }

  if (id === "facebookEmail") {
    sendToConsoleOutput(`Changed facebook email to ${value}`, "settings")
  }

  if (id === "facebookPassword") {
    sendToConsoleOutput(`Changed facebook password`, "settings")
  }

  if (id === "shouldShowPuppeteerHead") {
    if (value === true) {
      sendToConsoleOutput(
        "Will show behind-the-scenes on next run.",
        "settings"
      )
    } else {
      sendToConsoleOutput(
        "Will hide behind-the-scenes on next run.",
        "settings"
      )
    }
  }

  if (id === "shouldSkipCurrentlyLikedPosts") {
    if (value === true) {
      sendToConsoleOutput(
        "Will not post currently liked/reacted posts on any future runs, starting from the next run",
        "settings"
      )
    } else {
      sendToConsoleOutput(
        "Will post currently liked/reacted posts on next run, and behave as normal.",
        "settings"
      )
    }
  }

  if (id === "shouldStartRunningWhenAppOpens") {
    if (value === true) {
      sendToConsoleOutput(
        "Will start running when app opens next time it opens",
        "settings"
      )
    } else {
      sendToConsoleOutput(
        "Will wait for you to click 'Start running' next time the app opens",
        "settings"
      )
    }
  }

  if (id === "shouldOpenAtLogin") {
    if (value === true) {
      sendToConsoleOutput("Will open app at login", "settings")
    } else {
      sendToConsoleOutput("Will not open app at login", "settings")
    }
  }

  if (id === "postPreference") {
    sendToConsoleOutput(`Changed post preference`, "settings") //too much effort to get human readable value
  }
  if (id === "scheduleRuns") {
    sendToConsoleOutput(`Changed schedule runs`, "settings")
  }

  if (id === "botSlowMo") {
    sendToConsoleOutput(`Changed bot slow-mo`, "settings")
  }
}

export function sendToConsoleOutput(
  text: string,
  type:
    | "info"
    | "error"
    | "loading"
    | "success"
    | "settings"
    | "sadtimes"
    | "startstop"
) {
  let emojiPrefix: string = ""
  switch (type) {
    case "info":
      emojiPrefix = "ℹ️"
      break
    case "error":
      emojiPrefix = "🛑"
      break
    case "loading":
      emojiPrefix = "⏳"
      break
    case "success":
      emojiPrefix = "✅"
      break
    case "settings":
      emojiPrefix = "⚙️"
      break
    case "sadtimes":
      emojiPrefix = "😭"
      break
    case "startstop":
      emojiPrefix = "🏁"
      break
  }
  const output = emojiPrefix + " " + text
  mainWindow!.webContents.send("console-output", output)
  if (type === "error") {
    log.error(output)
  } else {
    log.info(output)
  }
}
