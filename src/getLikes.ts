import puppeteer from "puppeteer"
import { delay, likesPageURL } from "./utils"
import constants from "./constants"
import { createPage, createBrowser, page } from "./puppeteer"

const profileId = process.env.FACEBOOK_PROFILE_ID

export default async function getLikedPosts() {
  try {
    await goToLikesPage()
    const postUrls = await getRecentImages()
    return postUrls
  } catch (error) {
    console.error("error getting likes: ", error)
  }
}

async function goToLikesPage() {
  await page.goto(likesPageURL(profileId!))
  await page.waitForSelector("#facebook")
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

export async function getImageUrl(postUrl: string): Promise<string | null> {
  await page.goto(postUrl)
  await page.waitForSelector(".spotlight")
  await delay(200) //otherwise can bug out slightly and not get the correct element
  const imageUrl = await page.$eval(".spotlight", el => el.getAttribute("src"))
  console.log("image url: ", imageUrl, "from this post: ", postUrl)
  return imageUrl
}
