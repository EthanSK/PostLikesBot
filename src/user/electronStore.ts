import Store from "electron-store"
import { hashIntFromString } from "../utils"
const store = new Store()
import { UserDefaultsKey } from "./userDefaults"
import { GetPostsPkg } from "../scraper/getLikes"
import constants from "../constants"

export interface SavePostPkg extends GetPostsPkg {
  isPosted: boolean
  timePosted?: number
}

export function saveStoreIfNew(post: GetPostsPkg) {
  const hashedKey = hashIntFromString(post.postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `${constants.postsSaveKey}.${hashedKey}`
  let toSave: SavePostPkg = Object.assign(post)
  toSave.isPosted = false

  if (!store.has(fullKeyPath)) {
    store.set(fullKeyPath, toSave)
  }
}

export function updateIsPosted(isPosted: boolean, postUrl: string) {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `${constants.postsSaveKey}.${hashedKey}.isPosted`

  store.set(fullKeyPath, isPosted)
}

export function checkIfPosted(post: GetPostsPkg): boolean {
  const hashedKey = hashIntFromString(post.postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `${constants.postsSaveKey}.${hashedKey}.isPosted`

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
