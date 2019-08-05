import mongoose, { DeepPartial } from "mongoose"
import dotenv from "dotenv"
import constants from "./constants"
dotenv.config()

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD

let memeSchema = new mongoose.Schema({
  url: String,
  isPosted: Boolean,
  timePosted: Number
})

let Meme = mongoose.model("Meme", memeSchema)

async function mongooseConnect() {
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

mongooseConnect()

// async function saveToMongo(_url: string) {
//   let meme = new Meme({
//     url: "test"
//   })
// }

async function checkIfPosted(url: string) {}
