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
        userDefaults.get("facebookPageId"),
        userDefaults.get("messageToPost") //will check if should add message later
      )
      await prepareAndStart(
        memes.filter(el => el.reaction === "react"),
        userDefaults.get("facebookPageId2"),
        userDefaults.get("messageToPost2")
      )
    } else {
      await prepareAndStart(
        memes,
        userDefaults.get("facebookPageId"),
        userDefaults.get("messageToPost")
      )
    }
  } catch (error) {
    if (!wasLastRunStoppedForcefully) {
      sendToConsoleOutput("Error posting to page: " + error.message, "error")
    } else {
      console.log("not logging error as it was stopped forcefully")
    }
  }
}

async function prepareAndStart(
  memes: PostPostsPkg[],
  pageId: string,
  textToAdd: string
) {
  await goToFBPage(pageId)
  for (const meme of memes) {
    const reactionText = meme.reaction === "like" ? "liked" : "reacted to"

    sendToConsoleOutput(
      `Posting ${reactionText} image with URL ${
        meme.postUrl
      } to page with ID ${pageId}`,
      "loading"
    )
    if (userDefaults.get("shouldAddMessageToPosts")) {
      await createAndUpload(meme.file, textToAdd)
    } else {
      await createAndUpload(meme.file)
    }
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

async function createAndUpload(file: string, textToAddIfAny?: string) {
  const selector = '[data-testid="photo-video-button"]'
  await page.waitForSelector(selector)

  await page.click(selector)

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
  console.log("sharing image")
  if (textToAddIfAny) {
    await addTextToPost(textToAddIfAny) //do it after coz if doing it before it changes spotlight focus
  }
  await page.click('[data-testid="react-composer-post-button"]')
  await delay(5000) //give it a good long delay so it can post the pic
  // await page.waitForXPath("//span[contains(text(), 'Uploading...')]") //there is no way to wait for it to disappear

  console.log("upload image done")
}

async function addTextToPost(text: string) {
  const selector =
    'div[aria-label="Write a post..."], div[aria-label="Say something about this photo..."]'
  await page.waitForSelector(selector)
  await page.type(selector, text)
}

export function fbPageURL(pageId: string): string {
  return `https://www.facebook.com/${pageId}`
}
