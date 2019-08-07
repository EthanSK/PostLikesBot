import dotenv from "dotenv"
dotenv.config()
import getLikedPosts from "./getLikes"
import {
  mongooseConnect,
  saveNewDocToMongo,
  checkIfPosted,
  checkIfDocExists,
  updateIsPosted,
  getUnpostedPostUrls
} from "./mongoose"
import { createPage, createBrowser, page, login } from "./puppeteer"
import postLikes, { postMemePkg } from "./postLikes"
import { getImageUrl, createNewDir, downloadImage } from "./utils"
import path from "path"
import mongoose from "mongoose"
async function main() {
  try {
    const browser = await createBrowser()

    await createPage(browser)

    await login()

    const urls = await getLikedPosts()
    await mongooseConnect()
    if (!urls) {
      return
    }
    for (const url of urls) {
      const exists = await checkIfDocExists(url)
      if (!exists) {
        //so we don't overwrite the isposted data
        // console.log("saving url to mongo: ", url)
        await saveNewDocToMongo(url)
      }
    }
    const unpostedUrls = await getUnpostedPostUrls()
    const imagesDir = "./tmp"
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
    console.log("finished!")
    return await browser.close()
  } catch (error) {
    console.error("error: ", error)
  }
}

main()
