import dotenv from "dotenv"
dotenv.config()
import getLikedPosts from "./getLikes"
import { createPage, createBrowser, page, login } from "./puppeteer"
import postLikes, { postMemePkg } from "./postLikes"
import { getImageUrl, createNewDir, downloadImage } from "./utils"
import path from "path"
import mongoose from "mongoose"
import constants from "./constants"
import {
  saveStoreIfNew,
  checkIfPosted,
  updateIsPosted,
  saveUserDefault
} from "./electronStore"
import { app } from "electron"
import { startButtonState } from "./main"

export default async function stoppableRun() {
  const iter = run()
  let resumeValue
  for (;;) {
    if (startButtonState === "stateNotRunning") {
      console.log("stopping run early")
      return
    }
    const n = iter.next(resumeValue)
    if (n.done) {
      return n.value
    }
    resumeValue = await n.value
  }
}

function* run() {
  try {
    const browser = yield createBrowser()

    yield createPage(browser)

    yield login()

    const urls: string[] = yield getLikedPosts()
    // await mongooseConnect()
    if (!urls) {
      return
    }
    console.log("app data store: ", app.getPath("userData"))
    for (const url of urls) {
      saveStoreIfNew(url) //is sync
      // updateIsPosted(true, url)
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
    yield mongoose.disconnect() //otherwise node never ends
    yield browser.close()
    console.log("finished!")
    return
  } catch (error) {
    console.error("error: ", error)
    return
  }
}
