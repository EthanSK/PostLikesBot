import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD

async function mongooseConnect() {
  console.log("mongo username: ", mongoUsername)
  if (!mongoUsername || !mongoPassword) {
    throw new Error("mongo username or password not set in env vars")
  }

  mongoose.connect(
    `mongodb+srv://${mongoUsername}:${mongoPassword}@postlikesbot-28rjt.mongodb.net/test?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )

  var db = mongoose.connection
  db.on("error", console.error.bind(console, "connection error:"))
  db.once("open", function() {
    console.log("connected to mongo")
  })
}

mongooseConnect()
