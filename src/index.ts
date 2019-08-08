import { ipcRenderer as ipc } from "electron"
import { UserDefaultsKey } from "./electronStore"

export const UIElems: UserDefaultsKey[] = [
  "facebookPageId",
  "facebookProfileId",
  "facebookEmail",
  "facebookPassword"
]

//REMEMBER - all console.log goes to app window

function listenToElementChanges(id: UserDefaultsKey) {
  document.getElementById(id)!.onchange = function() {
    console.log("element changed", id)
    const data = {
      id,
      value: (document.getElementById(id) as HTMLInputElement)!.value
    }
    ipc.send("ui-elem-changed", data)
  }
}

ipc.on("ui-elem-data-res", function(
  event,
  data: { id: UserDefaultsKey; value: any }
) {
  console.log("ui data response: ", data)
  const elem = document.getElementById(data.id)
  const elemAttr = elem!.getAttribute("type")
  if (elemAttr === "text" || elemAttr === "password") {
    ;(elem as HTMLInputElement).value = data.value
  }
})

function setupUIElem(id: UserDefaultsKey) {
  ipc.send("ui-elem-data-req", id)
}

UIElems.forEach(el => {
  setupUIElem(el)
  listenToElementChanges(el)
})
