import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import puppeteer from "puppeteer-extra";
import fetch from "node-fetch";

// require executablePath from puppeteer
import { executablePath } from "puppeteer";
const submissionController = {};

submissionController.crawlSite = async (req, res, next) => {

  console.log("Function Crawl Site executed");

  //1. Set time and date for screenshot
  const time = new Date();
  const timestamp = time.getTime();

  const browser = await puppeteer.launch({
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("https://www.indokoding.com/");

  // check storage/images folder and create if not exist
  await fs.promises.mkdir("storage/images", { recursive: true });

  //2. Take a screenshot
  await page.screenshot({
    path: `storage/images/${timestamp}.png`,
  });

  const lead_story = await page.$eval(
    "#comp-ifmduswg > p:nth-child(1) > span > span",
    (el) => el.innerHTML
  );

  res.send(`
    <html>
      <body>
        <h1>${lead_story}</h1>
        <img src="/images/${timestamp}.png" />
      </body>
    </html>`);
};

export default submissionController;