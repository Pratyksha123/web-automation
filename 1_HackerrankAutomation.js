//node 1_HackerrankAutomation.js --url=https://www.hackerrank.com --config=config.json

let minimist = require("minimist");
let fs = require("fs");
let puppeteer = require('puppeteer');
const { runMain } = require("module");


let args = minimist(process.argv);

//console.log(args.url);
//console.log(args.config);


let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);
//console.log(configJSO);


/* IIFE == Immediately invoked function execution
(function(){


})();
*/


//This is using promise, but we will be writing this using

/*
let browserKaPromise = puppeteer.launch({headless:false})
browserKaPromise.then(function(browser){
    let pageKaPromise = browser.newPage();
    pageKaPromise.then(function(page){
        let urlOpenKaPromise = page.goto(args.url);
        urlOpenKaPromise.then(function(){
            let browserCloseKaPromise = browser.close();
            browserCloseKaPromise.then(function(){
                console.log("Browser closed");
            })
        })
    })
})

*/

run();

async function run(){
    //start the browser
    let browser = await puppeteer.launch({
    defaultViewport: null,
    args: [
        "--start-maximized"

    ],
    headless: false

});


//Now get a tab from browser
let pages = await browser.pages();
let page = pages[0];

// go to url
await page.goto(args.url);

//click on login 1
await page.waitForSelector("a[data-event-action='Login']");
await page.click("a[data-event-action='Login']");


//click on 2 login
await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
await page.click("a[href='https://www.hackerrank.com/login']");


//type username
await page.waitForSelector("input[name='username']");
await page.type("input[name='username']",configJSO.userid,{delay:200});


//type password
await page.waitForSelector("input[name ='password']");
await page.type("input[name ='password']",configJSO.password,{delay:200});


//click on log in 3
await page.waitForSelector("button[data-analytics='LoginPassword']");
await page.click("button[data-analytics='LoginPassword']");


//Click on compete
await page.waitForSelector("a[data-analytics='NavBarContests']");
await page.click("a[data-analytics='NavBarContests']");

//click on manage contest
await page.waitForSelector("a[href='/administration/contests/']");
await page.click("a[href='/administration/contests/']");


/* code for only one moderator => This thing is only for one contest


//click on first contest
await page.waitForSelector("p.mmT");
await page.click("p.mmT");

// wait because of pop up
await page.waitFor(3000);

//click on moderators tab
await page.waitForSelector("li[data-tab = 'moderators']");
await page.click("li[data-tab = 'moderators']")

//type in moderator
await page.waitForSelector("input#moderator");
await page.type("input#moderator",configJSO.moderators,{delay:50});

//await page.waitForSelector();
await page.keyboard.press("Enter");

*/

//now from onwards we will be adding moderators in multiple contests simultaneously

await page.waitForSelector("[data-attr1 = 'Last']")
    let numPages = await page.$eval("a[data-attr1 = 'Last']", function(atag){
    let np = parseInt(atag.getAttribute('data-page'));
    return np;
});
console.log(numPages);

for(let i=0; i<numPages; i++){
    await handlePage(browser,page);

}

async function handlePage(browser,page){       
    //do work on 1 page
    await page.waitForSelector("a.backbone.block-center");
    let cursl = await page.$$eval("a.backbone.block-center",function(atags){
            let urls = [];
            for(let i =0; i<atags.length; i++){
                let url = atags[i].getAttribute("href");
                urls.push(url);
            }
            return urls;
    });

    console.log(cursl);
   for(let i =0; i<cursl.length; i++){
       await handleContest(browser, page, cursl[i]);
   }

    //Move to next page and do  repeat the  above same code there
    await page.waitFor(1500);
    await page.waitForSelector("a[data-attr1 = 'Right']");
    await page.click("a[data-attr1 = 'Right']");


}

async function handleContest(browser, page, curl){
    let npage = await browser.newPage();
    await npage.goto(args.url + curl);  // here the problem is occuring
    await npage.waitFor(2000);
    await npage.waitForSelector("li[data-tab='moderators']");
    await npage.click("li[data-tab='moderators']");

    await npage.waitForSelector("input#moderator");
    await npage.type("input#moderator", configJSO.moderators, {delay:200});
    await npage.keyboard.press("Enter");
    await npage.waitFor(1000);



    await npage.close();
    await page.waitFor(2000);


}




}
