import { ipcRenderer as ipc } from "electron"
import { UserDefaultsKey } from "./userDefaults"
import constants from "../constants"

export const UIElems: UserDefaultsKey[] = [
  "facebookPageId",
  "facebookProfileId",
  "facebookEmail",
  "facebookPassword",
  "shouldShowPuppeteerHead",
  "shouldStartRunningWhenAppOpens",
  "shouldSkipCurrentlyLikedPosts",
  "shouldOpenAtLogin"
]

//REMEMBER - all console.log goes to app window

function listenToElementChanges(id: UserDefaultsKey) {
  document.getElementById(id)!.onchange = function() {
    console.log("element changed", id)
    const elem = document.getElementById(id)
    const elemType = elem!.getAttribute("type")
    let value: any
    if (elemType === "text" || elemType === "password") {
      value = (elem as HTMLInputElement).value
    } else if (elemType === "checkbox") {
      value = (elem as HTMLInputElement).checked
      console.log("but the value is ", value)
    }
    const data = {
      id,
      value
    }
    ipc.send("ui-elem-changed", data)
  }
}

//restore data to ui ---
function setupUIElem(id: UserDefaultsKey) {
  ipc.send("ui-elem-data-req", id)
}

UIElems.forEach(el => {
  setupUIElem(el)
  listenToElementChanges(el)
})
ipc.on("ui-elem-data-res", function(
  event,
  data: { id: UserDefaultsKey; value: any }
) {
  console.log("ui data response: ", data)
  const elem = document.getElementById(data.id)
  const elemType = elem!.getAttribute("type")
  if (elemType === "text" || elemType === "password") {
    ;(elem as HTMLInputElement).value = data.value
  } else if (elemType === "checkbox") {
    ;(elem as HTMLInputElement).checked = data.value
  }
})
//----

function listenToStartButton() {
  const id = "startButton"
  document.getElementById(id)!.addEventListener("click", function() {
    const elem = document.getElementById(id)!
    console.log("start button state: ", elem.className)
    switch (elem.className) {
      case "stateNotRunning":
        ipc.send("start-running-req")
        break
      case "stateRunning":
        ipc.send("stop-running-req")
        break
    }
  })
}

ipc.on("start-state-res", function(event, state) {
  const id = "startButton"
  const elem = document.getElementById(id)!
  switch (state) {
    case "stateRunning":
      elem.innerText = "Stop running"
      elem.classList.remove("stateNotRunning")
      elem.classList.add("stateRunning")
      break
    case "stateNotRunning":
      elem.innerText = "Start running"
      elem.classList.remove("stateRunning")
      elem.classList.add("stateNotRunning")
      break
  }
})

listenToStartButton()

ipc.on("console-output", function(event, newText: string) {
  sendToConsole(newText)
})

function sendToConsole(newText: string) {
  const elem = document.getElementById("consoleOutput") as HTMLTextAreaElement
  elem.value += newText + "\n\n"
  if (elem.value.length > constants.maxConsoleOutputChars) {
    const split = elem.value.split("\n\n")
    console.log("split: ", split)
    split.shift()
    elem.value = split.join("\n\n")
  }
  elem.scrollTop = elem.scrollHeight

  console.log("output to console")
}
