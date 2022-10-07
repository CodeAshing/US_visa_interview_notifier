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

const dt = new Date();
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

    async function RelaodPageOnce() {
        await page.evaluate(() => {
            location.reload(true)
        });
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

        let textToSend = 'Date is Available : ' + availableDate + " AT " + dt;

        let info = await transporter.sendMail({
            from: '"Visa Bot👻" <visabot@bot.com>',
            to: "georgiana.fadel@ethereal.email",
            subject: 'Date Available  ' + availableDate,
            text: textToSend,
        });
        console.log("Message sent: %s", info.messageId);
    }


    async function checkBBAval() {
        RelaodPageOnce();
        await page.waitForNavigation();

        let html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html)
        $('td', html).each(function () {

            var currentvalBB = $(this).text();
            var dateObj = new Date(currentvalBB)

            if (isNaN(dateObj) == false && currentvalBB.length >= 10) {

                console.log("Earliest date available is : " + currentvalBB + " AT " + dt);

                if (desireDateObj >= dateObj) {
                    console.log("**************************************\n");
                    console.log("Desire time slot is available : " + currentvalBB);
                    console.log("\n**************************************\n");
                    sendNotification(currentvalBB);
                }
            }
        });

    }
    async function startTracking() {
        let job = new CronJob('* * * * *', function () { //runs every 1 minutes in this config
            checkBBAval();
        }, null, true, null, null, true);
        job.start();
    }
    startTracking();
})();