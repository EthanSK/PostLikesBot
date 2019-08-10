import { ipcRenderer as ipc } from "electron"
import { UserDefaultsKey } from "./userDefaults"
import constants from "../constants"

export const UIElems: UserDefaultsKey[] = [
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
]

//REMEMBER - all console.log goes to app window

function listenToElementChanges(id: UserDefaultsKey) {
  document.getElementById(id)!.onchange = function() {
    console.log("element changed", id)
    const elem = document.getElementById(id)
    let value: any
    const type = elem!.tagName.toLowerCase()

    if (type === "input") {
      const inputElemType = elem!.getAttribute("type")
      if (inputElemType === "text" || inputElemType === "password") {
        value = (elem as HTMLInputElement).value
      } else if (inputElemType === "checkbox") {
        value = (elem as HTMLInputElement).checked
      }
    } else if (type === "select") {
      value = (elem as HTMLSelectElement).value
      if (id === "postPreference") {
        if (value === "bothToDiffPages") {
          shouldShowBothPageIdBoxes(true)
        } else {
          shouldShowBothPageIdBoxes(false)
        }
      }
    }
    console.log("new value: ", value, "type: ", type)
    const data = {
      id,
      value
    }
    ipc.send("ui-elem-changed", data)
  }
}

function shouldShowBothPageIdBoxes(value: boolean) {
  // const boxContainer1 = document.getElementById("pageIdBoxContainer1")!
  console.log("shouldShowBothPageIdBoxes()", value)
  const boxContainer2 = document.getElementById("pageIdBoxContainer2")!
  const label1 = document.getElementById("textBoxLabelPageId1")!
  const label2 = document.getElementById("textBoxLabelPageId2")!

  if (value) {
    boxContainer2.style.display = "flex"
    label1.innerText = "facebook page ID (likes)"
    label2.innerText = "facebook page ID (reacts)"
  } else {
    boxContainer2.style.display = "none"
    label1.innerText = "facebook page ID"
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
  data: { id: UserDefaultsKey; value?: any }
) {
  console.log("ui data response: ", data)
  if (!data.value) {
    console.log("no value stored for user default so not setting")
    return
  }
  const elem = document.getElementById(data.id)
  const type = elem!.tagName.toLowerCase()
  if (type === "input") {
    const inputElemeType = elem!.getAttribute("type")
    if (inputElemeType === "text" || inputElemeType === "password") {
      ;(elem as HTMLInputElement).value = data.value
    } else if (inputElemeType === "checkbox") {
      ;(elem as HTMLInputElement).checked = data.value
    }
  } else if (type === "select") {
    ;(elem as HTMLSelectElement).value = data.value
    if (data.id === "postPreference") {
      if (data.value === "bothToDiffPages") {
        shouldShowBothPageIdBoxes(true)
      } else {
        shouldShowBothPageIdBoxes(false)
      }
    }
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
      elem.innerText = "Stop"
      elem.classList.remove("stateNotRunning")
      elem.classList.add("stateRunning")
      break
    case "stateNotRunning":
      elem.innerText = "Start"
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
