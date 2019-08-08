import { page } from "./puppeteer"
import { fbPageURL, delay } from "./utils"
import { updateIsPosted } from "./electronStore"
import constants from "./constants"
import { userDefaults } from "./userDefaults"

export interface postMemePkg {
  postUrl: string
  file: string
}

export default async function postLikes(memes: postMemePkg[]) {
  try {
    await goToFBPage()
    for (const meme of memes) {
      await uploadImage(meme.file)
      await updateIsPosted(true, meme.postUrl)
    }
  } catch (error) {
    console.error("error posting likes: ", error)
  }
}

async function goToFBPage() {
  await page.goto(fbPageURL(userDefaults.get("facebookPageId")))
  console.log("at facebook page")
}

async function uploadImage(file: string) {
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
  await fileChooser.accept([file]) //rel to project root
  await delay()
  // await page.screenshot({ path: "logs/screenshots/imagess.png" })
  console.log("sharing image...")
  await page.click('[data-testid="react-composer-post-button"]')
  await delay(5000) //give it a good long delay so it can post the pic
  console.log("upload image done")
}
