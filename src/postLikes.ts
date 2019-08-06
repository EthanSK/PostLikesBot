import puppeteer from "puppeteer"
import { createPage, createBrowser, page } from "./puppeteer"
import { fbPageURL, delay } from "./utils"

const pageId = process.env.FACEBOOK_PAGE_ID

export default async function postLikes() {
  try {
    await goToFBPage()
    await uploadImage()
  } catch (error) {
    console.error("error posting likes: ", error)
  }
}

async function goToFBPage() {
  await page.goto(fbPageURL(pageId!))
  console.log("at facebook page")
}

async function uploadImage() {
  await page.waitForSelector('[data-testid="photo-video-button"]')
  await delay() //needed despite waitforselector hmmm
  await page.click('[data-testid="photo-video-button"]')
  await delay()

  //works until here
  // await page.waitForSelector('input[type="file"]')
  // const input = await page.$('input[type="file"]')
  const [button] = await page.$x(
    "//div[contains(text(), 'Upload Photos/Video')]"
  )
  await button.click()
  await button.click()
  await button.click() //because it seems like the first click just highlights the section

  // const fileChooser = await page.waitForFileChooser()

  // await delay()
  // fileChooser.accept(["./testImage.png"])

  // await input!.uploadFile("./testImage.png")
  // await page.click('[data-testid="react-composer-post-button"]')
  console.log("upload image done")
}
