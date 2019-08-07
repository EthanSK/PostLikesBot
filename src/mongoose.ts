import mongoose, { Schema, Document } from "mongoose"
import dotenv from "dotenv"
import constants from "./constants"
import fs from "fs"

dotenv.config()

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
let memeSchema = new mongoose.Schema({
  postUrl: { type: String, required: true, unique: true },
  isPosted: { type: Boolean, required: true },
  timePosted: Number
})

interface IMeme extends Document {
  postUrl: string
  isPosted: boolean
  timePosted?: number
}

let memeModel = mongoose.model<IMeme>("Meme", memeSchema)

export async function mongooseConnect() {
  console.log("mongo username: ", mongoUsername)
  if (!mongoUsername || !mongoPassword) {
    throw new Error("mongo username or password not set in env vars")
  }

  var db = mongoose.connection
  db.on("error", console.error.bind(console, "connection error:"))
  db.once("open", function() {
    console.log("connected to mongo")
  })

  return mongoose.connect(
    `mongodb+srv://${mongoUsername}:${mongoPassword}@postlikesbot-28rjt.mongodb.net/${
      constants.mongoDatabaseName
    }?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
}

export async function saveNewDocToMongo(postUrl: string) {
  let meme = new memeModel({
    postUrl,
    isPosted: false
  })
  await meme.save()
}

export async function updateIsPosted(isPosted: boolean, postUrl: string) {
  let obj = {
    timePosted: Date.now(),
    isPosted: isPosted
  }
  await memeModel.updateOne({ postUrl }, { $set: obj }).exec()
  console.log("updated isPosted in mongo")
}

export async function checkIfDocExists(postUrl: string): Promise<boolean> {
  let meme = await memeModel.findOne({ postUrl }).exec()
  if (meme) {
    return true
  }
  return false
}
export async function checkIfPosted(postUrl: string): Promise<boolean> {
  let meme = await memeModel.findOne({ postUrl }).exec()
  if (meme && meme.isPosted) {
    return true
  }
  return false
}

export async function getUnpostedPostUrls(): Promise<string[]> {
  const memes = await memeModel.find({ isPosted: false }).exec()
  return memes.map(meme => meme.postUrl)
}
