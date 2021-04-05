"use strict";

const puppeteer = require("puppeteer");
const fs = require("fs");

const { email, password } = JSON.parse(
    fs.readFileSync("secret/authDetail.json")
);
const { codes } = require("./codes");

const browserPromise = puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
});

let gtab;
browserPromise
    .then(function (browserInstance) {
        const newTabPromise = browserInstance.newPage();
        return newTabPromise;
    })
    .then(function (newTab) {
        gtab = newTab;
        const loginPagePromise = newTab.goto(
            "https://www.hackerrank.com/auth/login"
        );
        return loginPagePromise;
    })
    .then(function () {
        const typeEmailPromise = gtab.type("#input-1", email, { delay: 200 });
        return typeEmailPromise;
    })
    .then(function () {
        const typePasswordPromise = gtab.type("#input-2", password, {
            delay: 200,
        });
        return typePasswordPromise;
    })
    .then(function () {
        const pressEnterPromise = gtab.keyboard.press("Enter");
        return pressEnterPromise;
    })
    .then(function () {
        const ipKitClick = waitAndClick(
            ".card-content h3[title='Interview Preparation Kit']"
        );
        return ipKitClick;
    })
    .then(function () {
        const warmupClick = waitAndClick("a[data-attr1='warmup']");
        return warmupClick;
    })
    .then(function () {
        const url = gtab.url();
        const questionObj = codes[0];
        questionSolver(url, questionObj.soln, questionObj.qName);
    })
    .catch(function (err) {
        console.log(err);
    });

function waitAndClick(selector) {
    return new Promise(function (resolve, reject) {
        const selectorWaitPromise = gtab.waitForSelector(selector, {
            visible: true,
        });
        selectorWaitPromise
            .then(function () {
                const selectorClickPromise = gtab.click(selector);
                return selectorClickPromise;
            })
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject(err);
            });
    });
}

function questionSolver(pageUrl, code, questionName) {
    return new Promise(function (resolve, reject) {
        const gotoPageUrlPromise = gtab.goto(pageUrl);
        gotoPageUrlPromise
            .then(function () {
                //function will run inside browser (not in node)
                function browserConsole(questionName) {
                    //getting all question Name from DOM and clicking on the questionName passed as argument
                    let allH4Elem = document.querySelectorAll("h4");
                    allH4Elem = [...allH4Elem];
                    const textArr = allH4Elem.map((elem) => {
                        const question = elem.innerText.split("\n")[0];
                        return question;
                    });
                    const idx = textArr.indexOf(questionName);
                    allH4Elem[idx].click();
                }

                // evaluate method given by puppeteer to make a callback run on browser
                const questionClickPromise = gtab.evaluate(
                    browserConsole,
                    questionName
                );
                return questionClickPromise;
            })
            .then(function () {
                resolve();
            });
    });
}
