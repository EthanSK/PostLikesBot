# Post Likes Bot

# WARNING: This project only works with the old facebook. Contributions to get it working with the new facebook will be greatly appreciated.

![Post Likes Bot](/postlikesbot.png)

## A scraper built in Typescript and Node.JS, using Puppeteer to automatically posts things you like from your facebook feed to your facebook page

I use it to auto post memes I like to my meme page, but you can like any type of post for any type of page

## How to use it

You need to create a .env file for environment variables. These are the ones required:

```
NODE_ENV=production
FACEBOOK_EMAIL=\<your facebook email address>
FACEBOOK_PASSWORD=\<your facebook password>
FACEBOOK_PROFILE_ID=\<your facebook profile id>
MONGO_USERNAME=\<mongodb atlas service account username from database access under security in atlas>
MONGO_PASSWORD=\<mongodb atlas service account password, same as above>
FACEBOOK_PAGE_ID=\<facebook page you want to get posted to>
SHOW_PUPPETEER_HEAD=\<set to true or false, if true then chromium gui shown during web scraping>
```

You can run this thing on Heroku, or locally, or wherever you want tbh. Enjoy!

Run it with `npm run start`
