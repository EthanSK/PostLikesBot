import dotenv from "dotenv"
dotenv.config()
import getLikedPosts from "./getLikes"
import { createPage, createBrowser, page, login } from "./puppeteer"
import postLikes, { postMemePkg } from "./postLikes"
import { createNewDir, downloadImage } from "../utils"
import path from "path"
import constants from "../constants"
import {
  saveStoreIfNew,
  checkIfPosted,
  updateIsPosted,
  saveUserDefault
} from "../user/electronStore"
import { app } from "electron"
import {
  startButtonState,
  sendToConsoleOutput,
  setIsStopping
} from "../user/main"
import { Browser } from "puppeteer"
import log from "electron-log"

let browser: Browser
export let wasLastRunStoppedForcefully = false

export async function cleanup() {
  try {
    if (browser) {
      await browser.close()
    }
    setIsStopping(false) //because now we are finished the stopping process
  } catch (error) {
    console.error("error closing browser: ", error)
  }
}

export async function run() {
  //is a generator, the await is like pause points that allow us to, to a good degree, stop the function before the next await
  sendToConsoleOutput("Started running at " + new Date(), "info")

  try {
    setWasLastRunStoppedForcefully(false)

    browser = await createBrowser()

    await createPage(browser)
    sendToConsoleOutput("Logging in", "loading")
    await login()
    sendToConsoleOutput("Getting liked/reacted posts", "loading")
    const urls = await getLikedPosts()
    if (!urls) {
      sendToConsoleOutput("Couldn't find any post", "sadtimes")
      return
    }
    sendToConsoleOutput(`Scanning ${urls!.length} most recent posts`, "loading")

    console.log("app data store: ", app.getPath("userData"))
    for (const url of urls) {
      saveStoreIfNew(url) //is sync
    }
    const unpostedUrls = urls.filter(url => !checkIfPosted(url))
    sendToConsoleOutput(
      `Found ${unpostedUrls.length} posts that need to be posted`,
      "info"
    )
    const imagesDir = "./temp"
    createNewDir(imagesDir)
    let memes: postMemePkg[] = []
    for (const postUrl of unpostedUrls) {
      sendToConsoleOutput(`Downloading image in post at ${postUrl}`, "loading")
      const imageUrl = await getImageUrl(postUrl)
      const file = path.join(imagesDir, memes.length.toString() + ".png")
      if (imageUrl) {
        await downloadImage(imageUrl, file)
        memes.push({
          postUrl,
          file
        })
        sendToConsoleOutput("Downloaded image successfully", "info")
      } else {
        sendToConsoleOutput("Couldn't find the image URL", "sadtimes")
      }
    }
    sendToConsoleOutput("Preparing to post images to your page", "loading")
    await postLikes(memes)
    sendToConsoleOutput("Cleaning up", "loading")
    await cleanup()
    sendToConsoleOutput("Finished the batch", "success")
    return
  } catch (error) {
    if (!wasLastRunStoppedForcefully) {
      //otherwise it's not an actual
      sendToConsoleOutput("Error: " + error.message, "error")
    } else {
      console.log("not logging error as it was stopped forcefully")
    }
    return
  }
}

export function setWasLastRunStoppedForcefully(value: boolean) {
  wasLastRunStoppedForcefully = value
}

async function getImageUrl(postUrl: string): Promise<string | null> {
  await page.goto(postUrl)
  await page.waitForSelector('img[class="spotlight"]')
  const imageUrl = await page.$eval('img[class="spotlight"]', el =>
    el.getAttribute("src")
  )
  console.log("image url: ", imageUrl, "from this post: ", postUrl)
  return imageUrl
}
