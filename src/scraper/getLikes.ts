import puppeteer from "puppeteer"
import { delay } from "../utils"
import constants from "../constants"
import { createPage, createBrowser, page } from "./puppeteer"
import { userDefaults } from "../user/userDefaults"
import log from "electron-log"
import { sendToConsoleOutput } from "../user/main"
import { wasLastRunStoppedForcefully } from "./runner"

export interface GetPostsPkg {
  postUrl: string
  reaction: "like" | "react"
  type: "photo" | "post"
}

export default async function getLikedPosts() {
  try {
    await goToLikesPage()
    const postUrls = await getRecentImages()
    return postUrls
  } catch (error) {
    if (!wasLastRunStoppedForcefully) {
      sendToConsoleOutput("Error getting liked posts:" + error.message, "error")
    } else {
      console.log("not logging error as it was stopped forcefully")
    }
  }
}

async function goToLikesPage() {
  const url = likesPageURL(userDefaults.get("facebookProfileId"))
  await Promise.all([page.goto(url), page.waitForNavigation()]) //extra layer of certainty. don't change it without testing thoroughly. it works weirdly...

  await page.waitForXPath("//div[contains(text(), 'Posts and Comments')]")

  console.log("at likes page")
}

async function getRecentImages(): Promise<GetPostsPkg[]> {
  await page.waitForSelector(".fbTimelineLogStream") //just because when loading the page manually i see a slightly delay between the "post and comments" title and the list of posts

  const posts = await page.$x(
    "//a[contains(text(), 'photo') or contains(text(), 'post')]"
  ) //get links named photo or post

  // const posts = await page.$$("a.profileLink") //can't do this - posts don't have profile link class

  let result: GetPostsPkg[] = []
  for (const post of posts) {
    let type: "photo" | "post" | "neither" = "neither" //even tho we query by things containing either photo or post, they query will return things with href that contain the word 'photo', so we need to validate it properly here
    const innerText = await (await post.getProperty("innerText")).jsonValue()
    if (innerText === "photo") {
      type = "photo"
    } else if (innerText === "post") {
      type = "post"
    } else {
      continue //we are not looking at a valid post
    }
    // console.log("type: ", type)

    const postUrl = await (await post.getProperty("href")).jsonValue()
    if (postUrl.includes("photo.php")) {
      continue
    }

    //see if post was liked or reacted to
    const parent = (await post.$x(".."))[0]
    const childTextNodes = await parent.$x("child::text()")
    let reaction: "like" | "react" | "neither" = "neither"
    for (const textNode of childTextNodes) {
      const text: string = await (await textNode.getProperty(
        "textContent"
      )).jsonValue()

      if (text.includes("like")) {
        reaction = "like"
        break
      } else if (text.includes("react")) {
        reaction = "react"
        break
      }
    }

    if (reaction! !== "neither") {
      // console.log("type: ", type, "href: ", postUrl, "\n\n")
      result.push({
        postUrl,
        reaction: reaction!,
        type: type === "photo" ? "photo" : "post"
      })
    }
  }

  // console.log("result: ", result)
  return result
}

export function likesPageURL(userProfileId: string): string {
  return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`
}
