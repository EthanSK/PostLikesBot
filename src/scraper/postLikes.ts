import { page } from "./puppeteer"
import { delay } from "../utils"
import { updateIsPosted } from "../user/electronStore"
import constants from "../constants"
import { userDefaults } from "../user/userDefaults"
import log from "electron-log"
import { sendToConsoleOutput } from "../user/main"
import { wasLastRunStoppedForcefully } from "./runner"

export interface PostPostsPkg {
  postUrl: string
  reaction: "like" | "react"
  file: string
}

export default async function postLikes(memes: PostPostsPkg[]) {
  try {
    if (userDefaults.get("postPreference") === "bothToDiffPages") {
      await prepareAndStart(
        memes.filter(el => el.reaction === "like"),
        userDefaults.get("facebookPageId")
      )
      await prepareAndStart(
        memes.filter(el => el.reaction === "react"),
        userDefaults.get("facebookPageId2")
      )
    } else {
      await prepareAndStart(memes, userDefaults.get("facebookPageId"))
    }
  } catch (error) {
    if (!wasLastRunStoppedForcefully) {
      sendToConsoleOutput("Error posting to page: " + error.message, "error")
    } else {
      console.log("not logging error as it was stopped forcefully")
    }
  }
}

async function prepareAndStart(memes: PostPostsPkg[], pageId: string) {
  await goToFBPage(pageId)
  for (const meme of memes) {
    const reactionText = meme.reaction === "like" ? "liked" : "reacted to"

    sendToConsoleOutput(
      `Posting ${reactionText} image with URL ${
        meme.postUrl
      } to page with ID ${pageId}`,
      "loading"
    )
    await uploadImage(meme.file)
    await updateIsPosted(true, meme.postUrl)
    sendToConsoleOutput("Successfully posted image", "success")
  }
}

async function goToFBPage(pageId: string) {
  await page.goto(fbPageURL(pageId))
  const [brokenPageElem] = await page.$x(
    "//title[contains(text(), 'Page Not Found')]"
  )
  if (brokenPageElem) {
    throw new Error(
      "There was an error going to your facebook page. Please check your page ID was input correctly."
    )
  }
  console.log("at facebook page")
}

async function uploadImage(file: string) {
  // await delay() //needed despite waitforselector hmmm
  const selector = '[data-testid="photo-video-button"]'
  await page.waitForSelector(selector)
  await page.click(selector)
  // await delay()

  //works until here
  // await page.waitForSelector('input[type="file"]')
  // const input = await page.$('input[type="file"]')
  const xPath = "//div[contains(text(), 'Upload Photos/Video')]" //needs to be text(), full stop does't work
  await page.waitForXPath(xPath)
  const [button] = await page.$x(xPath)

  async function triggerFileSelect() {
    await button.click()
    await delay(1000) //because rapid succession can fucc up
    await button.click() //because it seems like the first click just highlights the section
  }
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    triggerFileSelect()
  ])
  console.log("choosing image")
  await fileChooser.accept([file]) //rel to project root
  await delay()
  // await page.screenshot({ path: "logs/screenshots/imagess.png" })
  console.log("sharing image")
  await page.click('[data-testid="react-composer-post-button"]')
  await delay(5000) //give it a good long delay so it can post the pic
  console.log("upload image done")
}

export function fbPageURL(pageId: string): string {
  return `https://www.facebook.com/${pageId}`
}
