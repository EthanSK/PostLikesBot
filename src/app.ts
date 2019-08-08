import dotenv from "dotenv"
dotenv.config()
import getLikedPosts from "./getLikes"
import { createPage, createBrowser, page, login } from "./puppeteer"
import postLikes, { postMemePkg } from "./postLikes"
import { getImageUrl, createNewDir, downloadImage } from "./utils"
import path from "path"
import constants from "./constants"
import {
  saveStoreIfNew,
  checkIfPosted,
  updateIsPosted,
  saveUserDefault
} from "./electronStore"
import { app } from "electron"
import { startButtonState, sendToConsoleOutput, setIsStopping } from "./main"
import { Browser } from "puppeteer"

let browser: Browser

export default async function stoppableRun() {
  sendToConsoleOutput("Started running at " + new Date())
  const iter = run()
  let resumeValue
  for (;;) {
    if (startButtonState === "stateNotRunning") {
      console.log("stopping run early")
      sendToConsoleOutput("Stopped running early.")
      await cleanup()
      setIsStopping(false)
      return
    }
    const n = iter.next(resumeValue)
    if (n.done) {
      sendToConsoleOutput("Finished a run through!")
      return n.value
    }
    resumeValue = await n.value
  }
}

async function cleanup() {
  if (browser) {
    browser.close()
  }
}

function* run() {
  //is a generator, the yield is like pause points that allow us to, to a good degree, stop the function before the next yield
  try {
    browser = yield createBrowser()

    yield createPage(browser)

    yield login()

    const urls: string[] = yield getLikedPosts()
    if (!urls) {
      return
    }
    console.log("app data store: ", app.getPath("userData"))
    for (const url of urls) {
      saveStoreIfNew(url) //is sync
    }
    const unpostedUrls = urls.filter(url => !checkIfPosted(url))
    const imagesDir = "./temp"
    createNewDir(imagesDir)
    let memes: postMemePkg[] = []
    for (const postUrl of unpostedUrls) {
      const imageUrl = yield getImageUrl(postUrl)
      const file = path.join(imagesDir, memes.length.toString() + ".png")
      if (imageUrl) {
        yield downloadImage(imageUrl, file)
        memes.push({
          postUrl,
          file
        })
      }
    }
    yield postLikes(memes)
    yield cleanup()
    console.log("finished!")
    return
  } catch (error) {
    console.error("error: ", error)
    return
  }
}
