const https = require('https');
const http = require('https');
const Readability = require('readability');
const JSDOM = require('jsdom').JSDOM;
const fs = require('fs');
const path = require('path');

var URL = 'https://index.hu/techtud/2019/12/20/tudomanyos_okosito_urkutatas_holdraszallas_klimavaltozas_mta_elkh_hiv_aids_rak_sma_sziami_ikrek/';

addArticle(URL);
function addArticle(URL) {
    https.get(URL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            // console.log(data);
            var doc = new JSDOM(data, {
                url: URL,
            });
            let reader = new Readability(doc.window.document);
            let article = reader.parse();
            let fullPath = path.join(__dirname, 'articles/', article.title.replace(/\ /gi, '_') + '.html');
            var page = buildPage(article, URL);
            page = downloadAllImages(page);
            fs.writeFileSync(fullPath, page);
        });
    }).on('error', (err) => {
        console.log('Error: ' + err.message);
    });
}

function buildPage(article, URL) {
    let css = fs.readFileSync(path.join(__dirname, 'css/aboutReader.css'));
    var page = `
    <body class="sepia serif loaded">
        <div class="container content-width3" style="--font-size:22px;">
            <div class="header reader-header reader-show-element">
                <a class="domain reader-domain" href="${URL}">LINK</a>
                <div class="domain-border"></div>
                <h1 class="reader-title">${article.title}/h1>
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
 * @param {Html} page
 */
async function downloadAllImages(page) {
    let images = page.match(/<img((?:[^<>])*)>/gi);
    images.map(async function (image, i) {
        let imgUrl = image.match(/src="(.+?)"/)[1];
        var baseImg = await getImage(imgUrl);
        function replacer(match, p1, p2, p3, offset, string) {
            // p1 is nondigits, p2 digits, and p3 non-alphanumerics
            baseImg
            var type = /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))/g.exec(match)[1];
            return `src="data:image/${type.replace('.', '')};base64, ${baseImg}"`;
        }
        image = image.replace(/src="(.+?)"/, replacer);
        return image;
    });
    debugger
    return page;
}

/**
 * Http gets an image
 *
 * @param {URL} URL
 */
function getImage(URL) {
    return new Promise(resolve => {

        https.get(URL, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                // console.log(data);
                var image = new Buffer(data.toString(), 'binary').toString('base64');
                resolve(image);

            });
        }).on('error', (err) => {
            console.log('Error: ' + err.message);
        });
    });

}
