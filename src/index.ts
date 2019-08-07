import dotenv from "dotenv"
dotenv.config()
import getLikedPosts from "./getLikes"
import { createPage, createBrowser, page, login } from "./puppeteer"
import postLikes, { postMemePkg } from "./postLikes"
import { getImageUrl, createNewDir, downloadImage } from "./utils"
import path from "path"
import mongoose from "mongoose"
import constants from "./constants"
import { saveStoreIfNew, checkIfPosted } from "./electronStore"
import { app } from "electron"

export default async function run() {
  try {
    const browser = await createBrowser()

    await createPage(browser)

    await login()

    const urls = await getLikedPosts()
    // await mongooseConnect()
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
    await mongoose.disconnect() //otherwise node never ends
    await browser.close()
    console.log("finished!")
  } catch (error) {
    console.error("error: ", error)
  }
}

// run()
