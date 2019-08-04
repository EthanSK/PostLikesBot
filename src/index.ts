import dotenv from "dotenv"
dotenv.config()
import getLikes from "./getLikes"

try {
  getLikes()
} catch (error) {
  console.error("error: ", error)
}
