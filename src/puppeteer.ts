import puppeteer from "puppeteer"
import constants from "./constants"
import { delay, likesPageURL } from "./utils"
import { userDefaults } from "./userDefaults"

export let page: puppeteer.Page

export async function createBrowser() {
  let headless = true
  if (userDefaults.get("shouldShowPuppeteerHead")) {
    headless = false
  }
  const browser = await puppeteer.launch({
    headless: headless,
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
  _page.setViewport({ width: 1200, height: 1500 })
  page = _page
}

export async function login() {
  if (
    !userDefaults.get("facebookEmail") ||
    !userDefaults.get("facebookPassword") ||
    !userDefaults.get("facebookProfileId") ||
    !userDefaults.get("facebookPageId")
  ) {
    throw new Error("email or password or profileId or pageId not set")
  }
  await page.goto(likesPageURL(userDefaults.get("facebookProfileId")))
  await page.waitForSelector("#email")
  await page.type("#email", userDefaults.get("facebookEmail"))
  await page.type("#pass", userDefaults.get("facebookPassword"))
  await page.click("#loginbutton")
  await page.waitForNavigation()
  if ((await page.$("#login_form")) !== null) {
    //error logging in, prolly coz cookies thing
    await page.type("#pass", userDefaults.get("facebookPassword"))
    await page.click("#loginbutton")
  }
  console.log("login done")
}
