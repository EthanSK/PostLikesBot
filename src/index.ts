import dotenv from "dotenv"
dotenv.config()
import getLikes from "./getLikes"
import {
  mongooseConnect,
  saveNewDocToMongo,
  checkIfPosted,
  checkIfDocExists,
  updateIsPosted
} from "./mongoose"
import { createPage, createBrowser, page, login } from "./puppeteer"
import postLikes from "./postLikes"
async function main() {
  try {
    const browser = await createBrowser()
    await createPage(browser)
    await login()
    return await postLikes()

    // const urls = await getLikes()
    // await mongooseConnect()
    // if (!urls) {
    //   return
    // }
    // for (const url of urls) {
    //   const exists = await checkIfDocExists(url)
    //   if (!exists) {
    //     //so we don't overwrite the isposted data
    //     await saveNewDocToMongo(url)
    //   }
    //   //   await updateIsPosted(false, url)
    // }

    await browser.close()
  } catch (error) {
    console.error("error: ", error)
  }
}

main()
