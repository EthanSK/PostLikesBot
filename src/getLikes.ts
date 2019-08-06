import puppeteer from "puppeteer"
import { delay, likesPageURL } from "./utils"
import constants from "./constants"
import { createPage, createBrowser, page } from "./puppeteer"

const profileId = process.env.FACEBOOK_PROFILE_ID

export default async function getLikes() {
  try {
    await goToLikesPage()
    const photoURLs = await getRecentLikes()
    return photoURLs
  } catch (error) {
    console.error("error getting likes: ", error)
  }
}

async function goToLikesPage() {
  await page.goto(likesPageURL(profileId!))
  await page.waitForSelector("#facebook")
  console.log("at likes page")
}

async function getRecentLikes(): Promise<string[]> {
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
  console.log("valid photo urls: ", validPhotoURLs)
  return validPhotoURLs
}
