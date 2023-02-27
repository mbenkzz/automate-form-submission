import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import fetch from "node-fetch";

import puppeteer from "puppeteer-extra";
import { executablePath } from "puppeteer";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";

const twocaptcha_api = process.env.TWOCAPTCHA_API_KEY;
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

submissionController.recaptcha = async (req, res, next) => {
  console.log("Function recaptcha executed");

  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: "2captcha",
        token: twocaptcha_api,
      },
      visualFeedback: true,
    })
  );

  puppeteer
    .launch({
      headless: false,
      executablePath: executablePath(),
    })
    .then(async (browser) => {
      const page = await browser.newPage();
      await page.goto("https://www.google.com/recaptcha/api2/demo");

      // That's it, a single line of code to solve reCAPTCHAs 🎉
      // Loop over all potential frames on that page

      await page.solveRecaptchas();

      console.log("Solving Recaptcha");

      await Promise.all([
        page.waitForNavigation(),
        page.click(`#recaptcha-demo-submit`),
      ]);

      //1. Set time and date for screenshot
      const time = new Date();
      const timestamp = time.getTime();

      // check storage/images folder and create if not exist
      await fs.promises.mkdir("storage/images", { recursive: true });

      //2. Take a screenshot
      await page.screenshot({
        path: `storage/images/recaptcha_${timestamp}.png`,
        fullPage: true,
      });

      await res.send(`
        <html>
          <body>
            <h1>Solving google recaptcha completed: </h1>
            <p>Screenshot: </p>
            <img src="/images/recaptcha_${timestamp}.png" style="border: 1px solid black" />
          </body>
        </html>`);

      await browser.close();
    });
};

submissionController.capycaptcha = async (req, res, next) => {
  console.log("Function capychaptcha executed");


  await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),

  }).then(async (browser) => {
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);
    await page.goto("https://www.capy.me/products/puzzle_captcha/");

    // Wait for the puzzle to load
    await page.waitForSelector(".capy-captcha");

    // get the key from parameter k inside url in script src
    const script = await page.$eval(
      "script[src*='puzzle/get_js']",
      (el) => el.src
    );
    const key = script.split("k=")[1].split("&")[0];

    var twocaptcha_id;

    const req_in = await fetch(`http://2captcha.com/in.php?key=${twocaptcha_api}&method=capy&captchakey=${key}&json=1&pageurl=https://www.capy.me/products/puzzle_captcha/`)
      .then((res) => res.json())

    twocaptcha_id = await req_in.request;

    setTimeout(async () => {
      const interval = setInterval(async () => {
        const req_res = await fetch(`http://2captcha.com/res.php?key=${twocaptcha_api}&action=get&id=${twocaptcha_id}&json=1`)
          .then((res) => res.json())

        if (req_res.status === 1) { // solved
          console.log("req_res", req_res);
          const solution = await req_res.request;
          // assign the solution to the input
          await page.evaluate((solution) => {
            for (i in solution) {
              document.getElementsByName(`capy_${i}`)[0].value = solution[i];
              document.querySelector('form.img-absolute').submit();
            }
            return true;
          }, solution);
          clearInterval(interval);
        }
      }, 5000);
    }, 15000);

    await Promise.all([
      page.waitForNavigation(),
    ]);

    //1. Set time and date for screenshot
    const time = new Date();
    const timestamp = time.getTime();

    // check storage/images folder and create if not exist
    await fs.promises.mkdir("storage/images", { recursive: true });

    //2. Take a screenshot
    await page.screenshot({
      path: `storage/images/capycaptcha_${timestamp}.png`,
      fullPage: true,
    });

    await res.send(`
      <html>
        <body>
          <h1>Solving capypuzzle captcha completed: </h1>
          <p>Screenshot: </p>
          <img src="/images/capycaptcha_${timestamp}.png" style="border: 1px solid black" />
        </body>
      </html>`);

    await browser.close();
  });
};

submissionController.captcha = async (req, res, next) => {
  console.log("Function normal captcha executed");

  const url = "https://www.phpzag.com/demo/build-captcha-script-php-demo/";
  const img_selector = "#captcha";

  // puppeteer usage as normal
  puppeteer.launch({ headless: false, executablePath: executablePath() })
    .then(async (browser) => {
      const page = await browser.newPage();

      await page.setDefaultNavigationTimeout(0);
      await page.goto(url);

      // Wait for the captcha to load
      // Wait for the puzzle to load
      await page.waitForSelector(img_selector);

      // capture generated random image using html2canvas
      const img = await page.$(img_selector);
      const img_b64 = await img.screenshot({ encoding: "base64" });

      // send image to 2captcha
      let twocaptcha_id;
      const req_in = await fetch(
        `http://2captcha.com/in.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: twocaptcha_api,
            method: "base64",
            body: img_b64,
            json: 1,
          }),
        }
      )
        .then((res) => res.json())
        .then((json) => {
          twocaptcha_id = json.request;
        });

      // wait for 2captcha to solve the captcha
      setTimeout(async () => {
        const interval = setInterval(async () => {
          const req_res = await fetch(`http://2captcha.com/res.php?key=${twocaptcha_api}&action=get&id=${twocaptcha_id}&json=1`)
            .then((res) => res.json())
            .then(async (json) => {
              console.log("req_res", json);
              if (json.status === 1) { // solved
                const solution = json.request;
                // assign the solution to the input
                await page.evaluate((solution) => {
                  document.querySelector("#securityCode").value = solution;
                  document.querySelector("form [type='submit']").click();
                  return true;
                }, solution);
                clearInterval(interval);
              }
            });
        }, 5000);
      }, 5000);

      await Promise.all([
        page.waitForNavigation(),
      ]);

      console.log("Solving captcha completed");

      //1. Set time and date for screenshot
      const time = new Date();
      const timestamp = time.getTime();

      // check storage/images folder and create if not exist
      await fs.promises.mkdir("storage/images", { recursive: true });

      //2. Take a screenshot
      await page.screenshot({
        path: `storage/images/captcha_${timestamp}.png`,
        fullPage: true,
      });

      await res.send(`
        <html>
          <body>
            <h1>Solving captcha completed: </h1>
            <p>Screenshot: </p>
            <img src="/images/captcha_${timestamp}.png" style="border: 1px solid black" />
          </body>
        </html>`);
      await browser.close();
    });
};


export default submissionController;