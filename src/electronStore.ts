import Store from "electron-store"
import { hashIntFromString } from "./utils"
const store = new Store()

export function saveStoreIfNew(postUrl: string) {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json

  const toSave = {
    postUrl,
    isPosted: false
  }
  if (!store.has(hashedKey)) {
    store.set(hashedKey, toSave)
  }
}

export function updateIsPosted(isPosted: boolean, postUrl: string) {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json

  store.set(hashedKey + ".isPosted", isPosted)
}

export function checkIfPosted(postUrl: string): boolean {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json
  const isPosted = store.get(hashedKey + ".isPosted") as boolean
  console.log("isPosted: ", isPosted)
  return isPosted
}
