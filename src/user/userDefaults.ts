import { getUserDefault, saveUserDefault } from "./electronStore"

export type UserDefaultsKey =
  | "facebookPageId"
  | "facebookProfileId"
  | "facebookEmail"
  | "facebookPassword"
  | "shouldShowPuppeteerHead"
  | "shouldStartRunningWhenAppOpens"
  | "shouldSkipCurrentlyLikedPosts"
  | "shouldOpenAtLogin"

class UserDefaults {
  public set(key: UserDefaultsKey, value: any) {
    saveUserDefault(key, value)
  }
  public get(key: UserDefaultsKey) {
    return getUserDefault(key)
  }
}

export let userDefaults = new UserDefaults()
