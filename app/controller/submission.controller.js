const submissionController = {};

submissionController.crawlSite = async (req, res, next) => {
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

  res.send(`
    <html>
      <body>
        <h1>${lead_story}</h1>
        <img src="/images/${timestamp}.png" />
      </body>
    </html>`);
};

export default submissionController;