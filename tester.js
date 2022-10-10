const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const chromeoptions = {
    executablepath: 'Enter your chrome.exe file path here',
    headless: false,
    slowMo: 8,
    defaultViewport: null
};
// Date in YYYY-MM-DD format
const desireDate = '2024-05-19';
const desireDateObj = new Date(desireDate)


async function startTracking(page) {
    let job = new CronJob('* * * * *', function () { //runs every 1 minutes in this config
        checkBBAval(page);
    }, null, true, null, null, true);
    job.start();
}

async function RelaodPageOnce(page) {
    // await page.evaluate(() => {
    //     location.reload(true)
    // });


    for (let i = 0; i < 9; i++) {
        await page.keyboard.press("Tab");
    }

    for (let i = 0; i < 2; i++) {
        await page.keyboard.press("Enter");
    }

    for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");
    }

    await page.keyboard.press("Enter");

    console.log('refresh')
}


async function sendNotification(availableDate) {

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'georgiana.fadel@ethereal.email',
            pass: 'KwxQ1yw2Vt5k8eXD7m'
        }
    });
    const dt = new Date();

    let textToSend = 'Date is Available : ' + availableDate + " AT " + dt;

    let info = await transporter.sendMail({
        from: '"Visa Bot👻" <visabot@bot.com>',
        to: "georgiana.fadel@ethereal.email",
        subject: 'Date Available  ' + availableDate,
        text: textToSend,
    });
    console.log("Message sent: %s", info.messageId);
}


async function checkBBAval(page) {
    await RelaodPageOnce(page);
    console.log('vali')

    // let html = await page.evaluate(() => document.body.innerHTML);
    // const $ = cheerio.load(html)
    // $('td', html).each(function () {

    //     var currentvalBB = $(this).text();
    //     var dateObj = new Date(currentvalBB)

    //     if (isNaN(dateObj) == false && currentvalBB.length >= 10) {

    //         const dt = new Date();

    //         console.log("Earliest date available is : " + currentvalBB + " AT " + dt);

    //         if (desireDateObj >= dateObj) {
    //             console.log("**************************************\n");
    //             console.log("Desire time slot is available : " + currentvalBB);
    //             console.log("\n**************************************\n");
    //             sendNotification(currentvalBB);
    //         }
    //     }
    // });


}

(async () => {

    const browser = await puppeteer.launch(chromeoptions);
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    await page.goto('https://cgifederal.secure.force.com/');

    await page.type('.stylizedInput1', 'email');// Username Email Account
    await page.type('[id*=password]', 'password'); // Password for account
    await page.$$eval("input[type='checkbox']", checks => checks.forEach(c => c.checked = true));
    await page.waitForTimeout(9000);

    await Promise.all([
        page.waitForNavigation(), page.click('[id*=loginButton]')
    ]).catch(() => { console.error("Error Occured.") });

    await page.waitForTimeout(20000);

    console.log('startTracking')

    startTracking(page);
})();