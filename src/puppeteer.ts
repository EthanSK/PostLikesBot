import puppeteer from "puppeteer"
import constants from "./constants"
import { delay, likesPageURL } from "./utils"

const email = process.env.FACEBOOK_EMAIL
const password = process.env.FACEBOOK_PASSWORD
const profileId = process.env.FACEBOOK_PROFILE_ID
const shouldShowHead: boolean =
  process.env.SHOW_PUPPETEER_HEAD === "true" ? true : false
const pageId = process.env.FACEBOOK_PAGE_ID

export let page: puppeteer.Page

export async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: !shouldShowHead,
    slowMo: constants.slowMo,
    args: ["--no-sandbox", "--disable-notifications"] //chromium notifs get in the way when in non headless mode
  })
  return browser
}

export async function createPage(browser: puppeteer.Browser) {
  const _page = await browser.newPage()
  await _page.setCacheEnabled(true)
  _page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"
  ) //so we don't look like a bot
  _page.setViewport({ width: 1500, height: 1500 })
  page = _page
}

export async function login() {
  if (!email || !password || !profileId || !pageId) {
    throw new Error("email or password or profileId or pageId env vars not set")
  }
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
  console.log("login done")
}
