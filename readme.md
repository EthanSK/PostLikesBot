# Post Likes Bot

## A scraper built in Typescript and Node.JS, using Puppeteer to automatically posts things you like on your facebook feed to your facebook page

I use it to auto post memes I like to my meme page, but you can like any type of post for any type of page

## How to use it

You need to create a .env file for environment variables. These are the ones required:

NODE_ENV=production
FACEBOOK_EMAIL=\<your facebook email address>
FACEBOOK_PASSWORD=\<your facebook password>
FACEBOOK_PROFILE_ID=\<your facebook profile id>
MONGO_USERNAME=\<mongodb atlas service account username from database access under security in atlas>
MONGO_PASSWORD=\<mongodb atlas service account password, same as above>
FACEBOOK_PAGE_ID=\<facebook page you want to get posted to>
SHOW_PUPPETEER_HEAD=\<set to true or false, if true then chromium gui shown during web scraping>

You need to create a mongo database called PostLikesBotDB, and a mongo collection called memes, this can be changed in the mongoos script and contants file.

You can host this thing on Heroku, or locally, or wherever you want tbh. Enjoy!
