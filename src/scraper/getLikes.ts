import puppeteer from "puppeteer"
import { delay } from "../utils"
import constants from "../constants"
import { createPage, createBrowser, page } from "./puppeteer"
import { userDefaults } from "../user/userDefaults"
import log from "electron-log"
import { sendToConsoleOutput } from "../user/main"

export default async function getLikedPosts() {
  try {
    await goToLikesPage()
    const postUrls = await getRecentImages()
    return postUrls
  } catch (error) {
    console.error("error getting likes: ", error)
    sendToConsoleOutput("Error getting liked posts:" + error.message, "error")
  }
}

async function goToLikesPage() {
  await page.goto(likesPageURL(userDefaults.get("facebookProfileId")))
  // await page.waitForSelector("#facebook")
  await page.waitForXPath("//div[contains(text(), 'Posts and Comments')]")

  console.log("at likes page")
}

async function getRecentImages(): Promise<string[]> {
  const profileLinks = await page.$$(".profileLink")
  let validPhotoURLs: string[] = []

  for (const profileLink of profileLinks) {
    const hrefHandle = await profileLink.getProperty("href")
    const innerTextHandle = await profileLink.getProperty("innerHTML")
    const href: string = await hrefHandle.jsonValue()
    const innerHTML: string = await innerTextHandle.jsonValue()
    if (innerHTML === "photo" && !href.includes("photo.php")) {
      //photo.php is only present in profile photo urls, not page photo urls, by inspection
      validPhotoURLs.push(href)
    }
  }
  console.log("valid photo post urls: ", validPhotoURLs)
  return validPhotoURLs
}

export function likesPageURL(userProfileId: string): string {
  return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`
}
