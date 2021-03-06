import puppeteer from "puppeteer"
import constants from "../constants"
import { delay } from "../utils"
import { userDefaults } from "../user/userDefaults"
import { likesPageURL } from "./getLikes"
export let page: puppeteer.Page

function getChromiumExecPath() {
  return puppeteer.executablePath().replace("app.asar", "app.asar.unpacked")
}

export async function createBrowser() {
  let headless = true
  if (userDefaults.get("shouldShowPuppeteerHead")) {
    headless = false
  }
  const browser = await puppeteer.launch({
    headless: headless,
    devtools: true,
    slowMo: userDefaults.get("botSlowMo"),
    defaultViewport: null, //so the viewport changes with window size
    args: [
      "--no-sandbox",
      "--disable-notifications",
      `--window-size=${constants.chromiumWidth},${constants.chromiumHeight}`
    ], //chromium notifs get in the way when in non headless mode
    executablePath: getChromiumExecPath()
  })
  return browser
}

export async function createPage(browser: puppeteer.Browser) {
  const _page = await browser.newPage()

  await _page.setCacheEnabled(true)
  await _page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"
  ) //so we don't look like a bot
  _page.setDefaultNavigationTimeout(400000)
  // await _page.setViewport({ width: 1200, height: 1500 })

  //headless seems to not work any more coz fb doesn't show certain ui elements we need. so we should just do non headless and minimize chromium. wow this just unminimizes straight away...
  // const session = await _page.target().createCDPSession()
  // const windowId = ((await session.send("Browser.getWindowForTarget")) as any)
  //   .windowId
  // await session.send("Browser.setWindowBounds", {
  //   windowId,
  //   bounds: { windowState: "minimized" }
  // })
  page = _page
}

export async function login() {
  if (
    !userDefaults.get("facebookEmail") ||
    !userDefaults.get("facebookPassword") ||
    !userDefaults.get("facebookProfileId") ||
    !userDefaults.get("facebookPageId")
  ) {
    throw new Error("Email, password, profile ID, or page ID can't be found")
  }
  await page.goto(likesPageURL(userDefaults.get("facebookProfileId")))
  await page.waitForSelector("#email")
  await delay(1000) //sometimes it goes too fast even after waiting for email selector
  await page.type("#email", userDefaults.get("facebookEmail"))
  await page.type("#pass", userDefaults.get("facebookPassword"))
  await page.click("#loginbutton")
  await page.waitForNavigation()
  if ((await page.$("#login_form")) !== null) {
    //error logging in, prolly coz cookies thing
    await page.type("#pass", userDefaults.get("facebookPassword"))
    await page.click("#loginbutton")
  }
  //if the login form STILL shows, there must be some sort of error
  if ((await page.$("#login_form")) !== null) {
    throw new Error(
      "There was an error logging in to facebook. Please check your credentials and other inputs."
    )
  }
  console.log("login done")
}
