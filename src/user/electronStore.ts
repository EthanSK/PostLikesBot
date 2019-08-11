import Store from "electron-store"
import { hashIntFromString } from "../utils"
const store = new Store()
import { UserDefaultsKey } from "./userDefaults"
import { GetPostsPkg } from "../scraper/getLikes"
import constants from "../constants"

export interface SavePostPkg extends GetPostsPkg {
  isPosted: boolean
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

export function updateBoolProp(prop: string, postUrl: string, value: boolean) {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `${constants.postsSaveKey}.${hashedKey}.${prop}`
  store.set(fullKeyPath, value)
}

export function updateIsPosted(isPosted: boolean, postUrl: string) {
  updateBoolProp("isPosted", postUrl, isPosted)
}

export function updateIsSkipped(isSkipped: boolean, postUrl: string) {
  //if the user clicks don't post currently liked/reacted posts
  updateBoolProp("isSkipped", postUrl, isSkipped)
}
//set if couldn't find image url so we don't try again.
export function updateIsInvalidImageURL(
  isInvalidImageURL: boolean,
  postUrl: string
) {
  updateBoolProp("isInvalidImageURL", postUrl, isInvalidImageURL)
}

export function checkIfNeedsPosting(post: GetPostsPkg): boolean {
  const hashedKey = hashIntFromString(post.postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPathIsPosted = `${constants.postsSaveKey}.${hashedKey}.isPosted`
  const fullKeyPathIsInvalidImageURL = `${
    constants.postsSaveKey
  }.${hashedKey}.isInvalidImageURL`
  const fullKeyPathIsSkipped = `${
    constants.postsSaveKey
  }.${hashedKey}.isSkipped`

  const isPosted = store.get(fullKeyPathIsPosted) as boolean
  const isInvalidImageURL = store.get(fullKeyPathIsInvalidImageURL) as boolean
  const isSkipped = store.get(fullKeyPathIsSkipped) as boolean

  console.log(
    "isPosted: ",
    isPosted,
    "isInvalidImageURL: ",
    isInvalidImageURL,
    "isSkipped: ",
    isSkipped
  )
  return !isPosted && !isInvalidImageURL && !isSkipped
}

export function saveUserDefault(key: UserDefaultsKey, value: string) {
  // return store.clear()
  console.log("saving user default: ", key, value)
  store.set(key, value)
}

export function getUserDefault(key: UserDefaultsKey): any {
  // store.clear()
  console.log("getting user default: ", key)
  const res = store.get(key)
  // console.log("it has value: ", res)
  return res
}
