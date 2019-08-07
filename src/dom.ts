import { ipcRenderer as ipc } from "electron"

function listenToTextBoxChanges(id: string) {
  document.getElementById(id)!.onchange = function() {
    console.log("text box changed", id)
    ipc.send(
      id + "Changed",
      (document.getElementById(id) as HTMLInputElement)!.value
    )
  }
}

listenToTextBoxChanges("facebokPageIdTextBox")
listenToTextBoxChanges("facebokProfileIdTextBox")
listenToTextBoxChanges("facebookEmailTextBox")
listenToTextBoxChanges("facebookPasswordTextBox")
