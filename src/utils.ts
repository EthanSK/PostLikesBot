import constants from "./constants"
import fs from "fs"
import path, { dirname } from "path"
import { page } from "./puppeteer"
import request from "request"
import { rejects } from "assert"

export function delay(ms: number = constants.defaultDelayMillis) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function likesPageURL(userProfileId: string): string {
  return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`
}

export function fbPageURL(pageId: string): string {
  return `https://www.facebook.com/${pageId}`
}

export async function getImageUrl(postUrl: string): Promise<string | null> {
  await page.goto(postUrl)
  await page.waitForSelector('img[class="spotlight"]')
  const imageUrl = await page.$eval('img[class="spotlight"]', el =>
    el.getAttribute("src")
  )
  console.log("image url: ", imageUrl, "from this post: ", postUrl)
  return imageUrl
}

var deleteFolderRecursive = function(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      var curPath = path + "/" + file
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

export function createNewDir(dir: string) {
  if (fs.existsSync(dir)) {
    deleteFolderRecursive(dir)
  }
  fs.mkdirSync(dir)
}

export function downloadImage(uri: string, file: string): Promise<any> {
  return new Promise((resolve, reject) => {
    request.head(uri, function(err, res, body) {
      request(uri)
        .pipe(fs.createWriteStream(file))
        .on("close", () => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
    })
  })
}

export function hashIntFromString(str: string): number {
  var hash = 0,
    i,
    chr
  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}
