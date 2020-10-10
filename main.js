const puppeteer = require('puppeteer');
const readline = require('readline');

function waitForUserInput(text) {
    const interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => interface.question(text, userInput => {
        interface.close();
        resolve(userInput);
    }))
}

function delay(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080},
        args: [
            '--start-fullscreen'
        ]
        });

    const timeout = 3000;
    const googleBooksmarksPath = 'file://path/to/GoogleBookmarks.html';
    
    // Log in with your Google account
    var page = await browser.newPage();
    await page.goto('https://accounts.google.com');
    await waitForUserInput('Log in to your Google account and then press any button to continue');

    // Go to Google Bookmarks page exported from Google Takeout
    await page.goto(googleBooksmarksPath);
    let links = await page.$$eval('a', (list) => list.map((elm) => elm.href));

    var i = 0
    for (let link of links) {
        // Go to next page in list
        await page.goto(link);
        await delay(timeout);

        // Click 'Save'
        let elementHandle = await page.waitForSelector('#pane > div > div.widget-pane-content.scrollable-y > div > div > div:nth-child(5) > div:nth-child(2) > div > button')
        await page.click('#pane > div > div.widget-pane-content.scrollable-y > div > div > div:nth-child(5) > div:nth-child(2) > div > button')

        // Click 'Starred places'
        let boundingBox = await elementHandle.boundingBox()
        page.mouse.click(boundingBox.x + 105, boundingBox.y + 60);
        await delay(timeout);

        // Save screenshot for manual checking
        await page.screenshot({path: i++ + '.png'});
        await delay(timeout);
    }

    await browser.close();
  })();
