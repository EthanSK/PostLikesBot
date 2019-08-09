import dotenv from "dotenv"
dotenv.config()
import getLikedPosts from "./getLikes"
import { createPage, createBrowser, page, login } from "./puppeteer"
import postLikes, { PostPostsPkg } from "./postLikes"
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
import { GetPostsPkg } from "./getLikes"

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
  sendToConsoleOutput("Started running at " + new Date(), "startstop")

  try {
    setWasLastRunStoppedForcefully(false)

    browser = await createBrowser()

    await createPage(browser)
    sendToConsoleOutput("Logging in", "loading")
    await login()
    sendToConsoleOutput("Getting liked/reacted posts", "loading")
    const gottenPosts = await getLikedPosts()
    if (!gottenPosts) {
      sendToConsoleOutput("Couldn't find any posts", "sadtimes")
      //CAN'T RETURN HERE OTHERWISE CLEANUP WON'T HAPPEN
    }
    sendToConsoleOutput(
      `Scanning ${gottenPosts!.length} most recent posts`,
      "loading"
    )

    console.log("app data store: ", app.getPath("userData"))
    for (const post of gottenPosts!) {
      saveStoreIfNew(post) //is sync
    }
    const unpostedPosts = gottenPosts!.filter(post => !checkIfPosted(post))
    sendToConsoleOutput(
      `Found ${unpostedPosts.length} new posts that need to be posted`,
      "info"
    )
    const imagesDir = app.getPath("temp")
    let postsToPost: PostPostsPkg[] = []

    for (const post of unpostedPosts) {
      const reactionText = post.reaction == "like" ? "liked" : "reacted to"
      sendToConsoleOutput(
        `Downloading ${reactionText} image in post at ${post.postUrl}`,
        "loading"
      )
      const imageUrl = await getImageUrl(post.postUrl)
      const file = path.join(imagesDir, postsToPost.length.toString() + ".png")
      if (imageUrl) {
        await downloadImage(imageUrl, file)
        postsToPost.push({
          postUrl: post.postUrl,
          file
        })
        sendToConsoleOutput("Downloaded image successfully", "info")
      } else {
        sendToConsoleOutput("Couldn't find the image URL", "sadtimes")
      }
    }
    if (postsToPost.length > 0) {
      sendToConsoleOutput("Preparing to post images to your page", "loading")
    }
    await postLikes(postsToPost)
    sendToConsoleOutput("Cleaning up", "loading")
    await cleanup()
    sendToConsoleOutput("Finished the batch at " + new Date(), "startstop")
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
  // await page.goto(postUrl)
  // await page.waitForSelector('img[class="spotlight"]')
  // const imageUrl = await page.$eval('img[class="spotlight"]', el =>
  //   el.getAttribute("src")
  // )
  // console.log("image url: ", imageUrl, "from this post: ", postUrl)
  //^^old

  await page.goto(postUrl)
  const parentSelector = ".permalinkPost"
  await page.waitForSelector(parentSelector)
  const permalinkPost = await page.$(parentSelector)

  await page.waitForXPath("//img[class='scaledImageFitWidth']")
  let imgURLs = await page.$x("//img[class='scaledImageFitWidth']")
  for (const img of imgURLs) {
    const src = await (await img.getProperty("src")).jsonValue()
    console.log("src of image: ", src)
  }
  // const childSelector = 'img[class="scaledImageFitWidth img"]'
  // await page.waitForSelector("uiScaledImageContainer")
  // const imageUrl = await permalinkPost!.$(childSelector, el =>
  //   el.getAttribute("src")
  // )
  console.log("image url: ", imageUrl, "from this post: ", postUrl)

  return imageUrl
}
