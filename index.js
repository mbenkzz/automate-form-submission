import express from "express";
import puppeteer from "puppeteer";
const app = express();
const port = 3000;

app.use(express.static("storage"));

app.get("/", async (req, res) => {
  //1. Execute function to get lead_story
  const { lead_story, timestamp } = await crawlSite();

  //2. Show lead_story
  res.send(`
    <html>
      <body>
        <h1>${lead_story}</h1>
        <img src="/images/${timestamp}.png" />
      </body>
    </html>`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

async function crawlSite() {
  console.log("Function Crawl Site executed");

  //1. Set time and date for screenshot
  const time = new Date();
  const timestamp = time.getTime();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("https://www.indokoding.com/");

  //2. Take a screenshot
  await page.screenshot({
    path: `storage/images/${timestamp}.png`,
  });

  const lead_story = await page.$eval(
    "#comp-ifmduswg > p:nth-child(1) > span > span",
    (el) => el.innerHTML
  );

  return { lead_story, timestamp };
}
