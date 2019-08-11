import { getUserDefault, saveUserDefault } from "./electronStore"

export type UserDefaultsKey =
  | "facebookPageId"
  | "facebookPageId2" //for reacts box
  | "messageToPost"
  | "messageToPost2"
  | "facebookProfileId"
  | "facebookEmail"
  | "facebookPassword"
  | "shouldShowPuppeteerHead"
  | "shouldAddMessageToPosts"
  | "shouldStartRunningWhenAppOpens"
  | "shouldSkipCurrentlyLikedPosts"
  | "shouldOpenAtLogin"
  | "postPreference"
  | "scheduleRuns"
  | "botSlowMo"

class UserDefaults {
  public set(key: UserDefaultsKey, value: any) {
    saveUserDefault(key, value)
  }
  public get(key: UserDefaultsKey) {
    return getUserDefault(key)
  }
}

export let userDefaults = new UserDefaults()
