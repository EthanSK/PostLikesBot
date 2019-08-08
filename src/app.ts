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
  sendToConsoleOutput("Started running at " + new Date())

  try {
    browser = await createBrowser()

    await createPage(browser)

    await login()

    const urls = await getLikedPosts()
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
      const imageUrl = await getImageUrl(postUrl)
      const file = path.join(imagesDir, memes.length.toString() + ".png")
      if (imageUrl) {
        await downloadImage(imageUrl, file)
        memes.push({
          postUrl,
          file
        })
      }
    }
    await postLikes(memes)
    await cleanup()
    console.log("finished!")
    return
  } catch (error) {
    console.error("error run(): ", error)
    return
  }
}
