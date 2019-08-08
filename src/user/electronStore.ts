import Store from "electron-store"
import { hashIntFromString } from "../utils"
const store = new Store()
import { UserDefaultsKey } from "./userDefaults"

export function saveStoreIfNew(postUrl: string) {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `posts.${hashedKey}`
  const toSave = {
    postUrl,
    isPosted: false
  }
  if (!store.has(fullKeyPath)) {
    store.set(fullKeyPath, toSave)
  }
}

export function updateIsPosted(isPosted: boolean, postUrl: string) {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `posts.${hashedKey}.isPosted`

  store.set(fullKeyPath, isPosted)
}

export function checkIfPosted(postUrl: string): boolean {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `posts.${hashedKey}.isPosted`

  const isPosted = store.get(fullKeyPath) as boolean
  console.log("isPosted: ", isPosted)
  return isPosted
}

export function saveUserDefault(key: UserDefaultsKey, value: string) {
  console.log("saving user default: ", key, value)
  store.set(key, value)
}

export function getUserDefault(key: UserDefaultsKey): any {
  console.log("getting user default: ", key)
  return store.get(key)
}
