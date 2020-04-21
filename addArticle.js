const https = require('https');
const Readability = require('readability');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const Sentiment = require('sentiment');

var senti = ''

function buildPage(article, URL) {
    //Load the css
    let css = fs.readFileSync(path.join(__dirname, 'css/aboutReader.css'));
    var page = `
    <body class="sepia serif loaded">
        <div class="container content-width3" style="--font-size:22px;">
            <div class="header reader-header reader-show-element">
                <a class="domain reader-domain" href="${URL}">LINK</a>
                <div class="domain-border"></div>
                <h1 class="reader-title">${article.title}</h1>
                    <!-- <div class="credits reader-credits">Bolcsó Dániel TODO:</div> -->
                    <div class="meta-data">
                        <!-- <div class="reader-estimated-time"></div> TODO: -->
                    </div>
            </div>
            <style>${css}</style>

            <hr>

            <div class="content">
                <div class="moz-reader-content line-height5 reader-show-element">
                    ${article.content}
                </div>
            </div>

            <div>
                <div class="reader-message"></div>
            </div>
        </div>
        

    </body>
    `;
    return page;
}
/**
 * Downloads all images of a HTML page
 *
 * @param {String} page html string of the page
 */
async function downloadAllImages(page) {
    var images = page.match(/<img((?:[^<>])*)>/gi);
    var base64ImagesList = [];
    await getAllImages(images).then(function (base64Images) {
        base64ImagesList = base64Images;
    }); // jshint ignore:line
    base64ImagesList.forEach(function (imageReplaceObj) {
        page = page.replace(imageReplaceObj.oldImage, imageReplaceObj.newImage);
    });
    return page;
}
/**
 * Gets all images
 *
 * @param {*} images
 * @returns
 */
async function getAllImages(images) {
    return Promise.all(images.map(async function (image, i) {
        var imageReplaceObj = { oldImage: image, index: i, newImage: image };
        let imgUrl = image.match(/src="(.+?)"/)[1];
        var baseImg = await getImage(imgUrl);
        function replacer(match) {
            var type = /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))/g.exec(match)[1];
            return `src="${baseImg}"`;
        }
        imageReplaceObj.newImage = image.replace(/src="(.+?)"/, replacer);
        return imageReplaceObj;
    }));
}
/**
 * Http gets an image
 *
 * @param {URL} URL
 */
function getImage(URL) {
    return new Promise(resolve => {

        https.get(URL, (resp) => {
            resp.setEncoding('base64');
            body = "data:" + resp.headers["content-type"] + ";base64,";
            resp.on('data', (data) => { body += data });
            resp.on('end', () => {
                resolve(body);
            });
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });



    });
}


/**
 * Gets the sentiment of the article
 *
 * @param {Article} article
 * @returns
 */
function sentimentAN(article) {
    let sentiment = new Sentiment();
    let result = sentiment.analyze(article.textContent);
    return result;
}


function symbolSearch(query) {
    // https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=BA&apikey=demo
    const https = require('https');
    return https.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=3X6NMLT8N0XLQJGB`, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            console.log(query);
            console.table(JSON.parse(data).bestMatches.filter(b => b['9. matchScore'] > 0.6));
        });
    }).on('error', (err) => {
        console.log('Error: ' + err.message);
    });
}

function findSymbols(article) {
    let regexp = /\b[A-Z][A-Z]+\b/g;
    let array = [...article.textContent.matchAll(regexp)].map(x => x[0]);

    let regexp2 = /([A-Z]{1,7})\w+/g;
    array = array.concat([...(article.title + '\n' + article.excerpt).matchAll(regexp2)].map(x => x[0]));
    array = [...new Set(array)];
    let topFile = fs.readFileSync('./data/top100.csv').toString();
    let topSymbols = [...topFile.matchAll(/.+\((.+)\)/g)];
    var first = 0;
    let mSymbols = array.map(function (sSym) {
        if (/it|no|we|a|an|the/i.test(sSym) || sSym.length < 4) {
            return;
        }
        if (topSymbols.map(x => x[0]).filter(topSymbol => (new RegExp(sSym)).test(topSymbol)).length > 0) {
            if (first < 5) {
                first++;
                return symbolSearch(sSym);
            }
        }
    })
}


function addArticle(URL) {
    https.get(URL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', async () => {
            // console.log(data);
            var doc = new JSDOM(data, {
                url: URL,
            });
            let reader = new Readability(doc.window.document);
            let article = reader.parse();
            let fullPath = path.join(__dirname, 'articles/', article.title.replace(/\ /gi, '_') + '.html');
            let page = buildPage(article, URL);
            let oSentiment = sentimentAN(article);
            senti = (oSentiment.score > 0 ? '👍' : '👎') + oSentiment.score;
            console.log(article.title + '\n' + article.excerpt);
            console.log(senti)
            let symbols = findSymbols(article);
            // page = await downloadAllImages(page); TODO:
            fs.writeFileSync(fullPath, page);
        });
    }).on('error', (err) => {
        console.log('Error: ' + err.message);
    });
}

exports.addArticle = addArticle;
