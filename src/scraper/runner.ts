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
      const reactionText = post.reaction === "like" ? "liked" : "reacted to"
      const postTypeText = post.type === "photo" ? "photo" : "image in post"
      sendToConsoleOutput(
        `Downloading ${reactionText} ${postTypeText} at ${post.postUrl}`,
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
        sendToConsoleOutput(
          "Couldn't find the image URL (the post might not be an image, so it's safe to ignore this)",
          "sadtimes"
        )
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
  let imageUrl: string
  await Promise.all([page.goto(postUrl), page.waitForNavigation()])
  try {
    const attempt1Selector =
      ".permalinkPost img.scaledImageFitWidth.img, .permalinkPost img.scaledImageFitHeight.img" //this doesn't work for group posts.
    // we could use .userContentWrapper  img.scaledImageFitWidth.img which works for everything, although there could be multiple on a page so we are relying that the first one returned is the correct one, which it should be anyway. or we query a second time if the first one didn't work. yeah i prefer that.
    const attempt2Selector =
      ".userContentWrapper img.scaledImageFitWidth.img, .permalinkPost img.scaledImageFitHeight.img" //so far i've only seen this selector needed for posts liked from groups. if the group post is not an image, it won't match anything which is good

    let image = await page.$(attempt1Selector)
    if (!image) {
      image = await page.$(attempt2Selector)
    }
    imageUrl = await (await image!.getProperty("src")).jsonValue()
    console.log("image url: ", imageUrl, "from this post: ", postUrl)
  } catch (error) {
    console.log(
      "error finding image, prolly coz it's a video or no permalinkPost",
      error.message
    )
  }

  return imageUrl!
}
