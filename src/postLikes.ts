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
  // await delay() //needed despite waitforselector hmmm
  await page.waitForSelector('[data-testid="photo-video-button"]')
  await page.click('[data-testid="photo-video-button"]')
  // await delay()

  //works until here
  // await page.waitForSelector('input[type="file"]')
  // const input = await page.$('input[type="file"]')
  await page.waitForXPath("//div[contains(text(), 'Upload Photos/Video')]")
  const [button] = await page.$x(
    "//div[contains(text(), 'Upload Photos/Video')]" //needs to be text(), full stop does't work
  )

  async function triggerFileSelect() {
    await button.click()
    await delay(1000) //because rapid succession can fucc up
    await button.click() //because it seems like the first click just highlights the section
  }
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    triggerFileSelect()
  ])
  console.log("choosing image...")
  await fileChooser.accept(["testImage.png"])
  await delay()
  // await page.screenshot({ path: "logs/screenshots/imagess.png" })
  console.log("sharing image...")
  await page.click('[data-testid="react-composer-post-button"]')
  await delay(10000) //give it a good long delay so it can post the pic
  console.log("upload image done")
}
