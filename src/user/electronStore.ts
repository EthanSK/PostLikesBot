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

export function updateIsPosted(isPosted: boolean, postUrl: string) {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `${constants.postsSaveKey}.${hashedKey}.isPosted`

  store.set(fullKeyPath, isPosted)
}

//set if couldn't find image url so we don't try again.
export function updateIsInvalidImageURL(
  isInvalidImageURL: boolean,
  postUrl: string
) {
  const hashedKey = hashIntFromString(postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPath = `${constants.postsSaveKey}.${hashedKey}.isInvalidImageURL`

  store.set(fullKeyPath, isInvalidImageURL)
}

export function checkIfNeedsPosting(post: GetPostsPkg): boolean {
  const hashedKey = hashIntFromString(post.postUrl).toString() //so the key is guaranteed valid json
  const fullKeyPathIsPosted = `${constants.postsSaveKey}.${hashedKey}.isPosted`
  const fullKeyPathIsInvalidImageURL = `${
    constants.postsSaveKey
  }.${hashedKey}.isInvalidImageURL`

  const isPosted = store.get(fullKeyPathIsPosted) as boolean
  const isInvalidImageURL = store.get(fullKeyPathIsInvalidImageURL) as boolean

  console.log("isPosted: ", isPosted, "isInvalidImageURL: ", isInvalidImageURL)
  return !isPosted && !isInvalidImageURL
}

export function saveUserDefault(key: UserDefaultsKey, value: string) {
  console.log("saving user default: ", key, value)
  store.set(key, value)
}

export function getUserDefault(key: UserDefaultsKey): any {
  console.log("getting user default: ", key)
  return store.get(key)
}
