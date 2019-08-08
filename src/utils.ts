import constants from "./constants"
import fs from "fs"
import path, { dirname } from "path"
import request from "request"
import { rejects } from "assert"

export function delay(ms: number = constants.defaultDelayMillis) {
  return new Promise(resolve => setTimeout(resolve, ms))
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
