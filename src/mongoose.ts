import mongoose, { Schema, Document } from "mongoose"
import dotenv from "dotenv"
import constants from "./constants"
dotenv.config()

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD

let memeSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  isPosted: { type: Boolean, required: true, unique: true },
  timePosted: Number
})

interface IMeme extends Document {
  url: string
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

export async function saveNewDocToMongo(url: string) {
  let meme = new memeModel({
    url,
    isPosted: false
  })
  await meme.save()
}

export async function updateIsPosted(isPosted: boolean, url: string) {
  let obj = {
    timePosted: Date.now(),
    isPosted: isPosted
  }
  await memeModel.updateOne({ url }, { $set: obj }).exec()
}

export async function checkIfDocExists(url: string): Promise<boolean> {
  let meme = await memeModel.findOne({ url }).exec()
  if (meme) {
    return true
  }
  return false
}
export async function checkIfPosted(url: string): Promise<boolean> {
  let meme = await memeModel.findOne({ url }).exec()
  if (meme && meme.isPosted) {
    return true
  }
  return false
}
