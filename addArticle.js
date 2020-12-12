const https = require('https');
const http = require('http');
const { Readability } = require('readability');
const fs = require('fs');
const JSDOM = require('jsdom').JSDOM;
const readingTime = require('reading-time');
const Sentiment = require('sentiment');
const ora = require('ora');

let senti = '';

function buildPage(article, URL, noLimit) {
    //Load the css
    // let css = fs.readFileSync(path.join(__dirname, 'css/aboutReader.css'));
    if (/Disclaimer/.test(article.content)) {
        article.content = '';
    }

    if (article.readingTime.minutes > 2 && !noLimit) {
        article.readingTime.tooMuch = true;
    }
    // article.symbols = article.symbols ? JSON.stringify(article.symbols) : '';
    if (article.symbols && article.symbols.length > 0) {
        let flatSymbols = article.symbols.flat();
        if (flatSymbols.length !== 0) {
            let headers = Object.keys(flatSymbols[0]).map((key) => `<th>${key}</th>`).join('');
            let rows = flatSymbols.map(function (oSymbol) {
                return `<tr>${Object.keys(oSymbol).map((key) => `<td>${oSymbol[key]}</td>`).join('')}</tr>`;
            });
            article.symbolsTable = `                              
            <table>
                <tr>
                    ${headers}
                </tr>
                ${rows}
            </table>`;
        }
    }
    var page = `
    <html>
        <header>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${article.title}</title>
        </header>
        <body class="sepia serif loaded">
            <div class="container content-width3" style="--font-size:22px;">
                <div class="header reader-header reader-show-element">
                <div class="domain-border"></div>
                <h1 class="reader-title"> <a class="domain reader-domain" href="${URL}">${article.title}</a></h1>
                <!--<a class="domain reader-domain" href="\${URL}">LINK</a>-->
                <div class="credits reader-credits">${article.siteName} <!--TODO:--></div> 
                        <div class="meta-data">
                            <div class="reader-estimated-time">${article.readingTime.text}</div>
                            <div class="reader-estimated-time sentiment">Sentiment: ${article.sentiment ? ((article.sentiment.score > 0 ? '👍' : '👎') + article.sentiment.score) : ''}</div>
                            <div class="reader-estimated-time symbols">
                                <b>Symbols: </b>
                                <br/>
                                ${article.symbolsTable ? article.symbolsTable : ''}
                          </div>
                        </div>
                </div>
                <!-- <style>\${css}</style> -->

                <hr>

                <div class="content">
                    <div class="moz-reader-content line-height5 reader-show-element">
                        ${!article.readingTime.tooMuch ? article.content : article.excerpt}
                    </div>
                </div>

                <div>
                    <div class="reader-message"></div>
                </div>
            </div>
        </body>
    </html>
    `;
    return page;
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
    return new Promise(function (Resolve) {
        https.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=3X6NMLT8N0XLQJGB`, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                Resolve(JSON.parse(data).bestMatches.filter(b => b['9. matchScore'] > 0.6));
                // console.log(query);
                // console.table(JSON.parse(data).bestMatches.filter(b => b['9. matchScore'] > 0.6));
            });
        }).on('error', (err) => {
            console.log('Error: ' + err.message);
        });
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
    let promises = [];
    array.forEach(function (sSym) {
        if (/it|no|we|a|an|the/i.test(sSym) || sSym.length < 4) {
            return;
        }
        if (topSymbols.map(x => x[0]).filter(topSymbol => (new RegExp(sSym)).test(topSymbol)).length > 0) {
            if (first < 5) {
                first++;
                promises.push(symbolSearch(sSym));
            }
        }
    });
    return promises;
}


function handleArticleReceive(data, URL, oRss, resolve, noLimit, spinner) {
    spinner.text = `Loading ${oRss.title} | Parsing Readability`;
    let article = null;
    // filter PDF
    if (!/\.pdf|.\png|\.jpg/.test(URL)) {
        var doc = new JSDOM(data, {
            url: URL,
        });
        let reader = new Readability(doc.window.document);
        article = reader.parse();
    }
    let page = '';
    let mSymbolPromises = [];

    if (!article || article.excerpt == null || !article.excerpt) {
        if (oRss) {
            page = `
                    <div class="container content-width3" style="--font-size:22px;">
                        <div class="content">
                            <div class="moz-reader-content line-height5 reader-show-element">
                            ${oRss.content}
                            </div>
                        </div>
                    </div>`;
        } else {
            page = `<a href="${URL}">[Link]</a>`;
        }
        spinner.succeed(`Loading ${oRss.title} | Done`);
    } else {

        spinner.text = `Loading ${oRss.title} | Estimating Read time`;
        let timeToRead = readingTime(article.textContent);
        article.readingTime = timeToRead;

        spinner.text = `Loading ${oRss.title} | Building Page`;
        page = buildPage(article, URL, noLimit);

        spinner.text = `Loading ${oRss.title} | Finding Symbols`;
        mSymbolPromises = findSymbols(article);

        spinner.text = `Loading ${oRss.title} | Analyzing Sentiment`;
        let oSentiment = sentimentAN(article);
        senti = (oSentiment.score > 0 ? '👍' : '👎') + oSentiment.score;
        article.sentiment = oSentiment;
        spinner.succeed(`Loading ${oRss.title} | Done`);
        console.log(article.title + '\n' + article.excerpt);
        console.log(senti);
    }

    if (mSymbolPromises.length === 0) {
        resolve(page);
    } else {
        Promise.all(mSymbolPromises).then(function (mSymbols) {
            // debugger
            article.symbols = mSymbols;
            page = buildPage(article, URL, noLimit);
            // debugger
            resolve(page);
        });
    }
}


/**
 * Gets an article
 *
 * @param {string} URL url to articles
 * @param {object} oRss rss entry 
 * @param {boolean} resolve if the text should be concatenated
 * @returns {Promise}
 */
function addArticle(URL, oRss, noLimit, spinner) {
    return new Promise(function (resolve) {
        const handler = /http:\/\//.test(URL) ? http : https;
        if (!/http/.test(URL)) {
            resolve('');
        }
        handler.get(URL, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', async () => {
                spinner = ora(`Loading ${oRss.title}`).start();
                spinner.text = `Loading ${oRss.title} | Received article`;
                handleArticleReceive(data, URL, oRss, resolve, noLimit, spinner);
            });
            resp.on('error', (err) => {
                resolve('');
                console.log('Error: ' + err.message);
            });
        });
    });
}

exports.addArticle = addArticle;
