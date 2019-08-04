import dotenv from "dotenv"
dotenv.config()
import getLikes from "./getlikes"

try {
  getLikes()
} catch (error) {
  console.error("error: ", error)
}
