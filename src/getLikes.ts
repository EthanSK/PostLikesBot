import puppeteer from "puppeteer"
import { delay, likesPageURL } from "./utils"
import constants from "./constants"

const email = process.env.FACEBOOK_EMAIL
const password = process.env.FACEBOOK_PASSWORD
const profileId = process.env.FACEBOOK_PROFILE_ID
const shouldShowHead = process.env.SHOW_PUPPETEER_HEAD

let page: puppeteer.Page

export default async function getLikes() {
  if (!email || !password || !profileId) {
    throw new Error("email or password or profileId env vars not set")
  }
  try {
    const browser = await createBrowser()
    await createPage(browser)
    await login()
    await goToLikesPage()
    await getRecentLikes()
    await browser.close()
  } catch (error) {
    console.error("error getting likes: ", error)
  }

  console.log("finished")
}

async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: !shouldShowHead,
    slowMo: constants.slowMo,
    args: ["--no-sandbox"]
  })
  return browser
}

async function createPage(browser: puppeteer.Browser) {
  const _page = await browser.newPage()
  await _page.setCacheEnabled(true)
  _page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"
  ) //so we don't look like a bot
  page = _page
}

async function login() {
  await page.goto(likesPageURL(profileId!))
  await page.waitForSelector("#email")
  await page.type("#email", email!)
  await page.type("#pass", password!)
  await page.click("#loginbutton")
  await page.waitForNavigation()
  if ((await page.$("#login_form")) !== null) {
    //error logging in, prolly coz cookies thing
    await page.type("#pass", password!)
    await page.click("#loginbutton")
  }
  await page.screenshot({ path: `${constants.screenshotsDir}/login.png` })
  console.log("login done")
}

async function goToLikesPage() {
  await page.goto(likesPageURL(profileId!))
  await page.waitForSelector("#facebook")
  await page.screenshot({
    path: `${constants.screenshotsDir}/activityLogLikes.png`
  })
  console.log("at likes page")
}

async function getRecentLikes() {
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
}
