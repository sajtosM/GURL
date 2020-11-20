const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const { sendEmail } = require('./sendEmail');
const { addArticle } = require('./addArticle');

const parser = new Parser();

/**
 * Get an RSS feed
 *
 * @param {string} sUrl url to a string
 * @param {integer} nLimit maximum amount of articles to get
 * @param {boolean} bSendMail send the mail to the email defined in the config or not
 * @returns
 */
async function getFeed(sUrl, nLimit, bSendMail) {
    return new Promise(async function (getFeedResolver) {
        let mFeed = await parser.parseURL(sUrl);
        console.log(mFeed.title);
        let css = fs.readFileSync(path.join(__dirname, 'css/aboutReader.css'));
        let emailContent = `<h1>Rss feed - ${sUrl}</h1><style>${css}</style>`;
        let mPromises = [];

        // mFeed.items = [mFeed.items[1], mFeed.items[2]]; // FIXME:

        mFeed.items.forEach(function (oItem, index) {
            if (nLimit && index >= nLimit) {
                return;
            }
            console.log(oItem.title + ':' + oItem.link);
            var sLinkUrl = oItem.link;

            if (/reddit/.test(sUrl)) {
                sLinkUrl = /<a href="(((?!<).)*)">\[link\]<\/a>/gi.exec(oItem.content)[1];
                sLinkUrl = sLinkUrl ? sLinkUrl : oItem.link;
            }

            try {
                if (sLinkUrl) {
                    let noLimit = nLimit <= 2;
                    mPromises.push(addArticle(sLinkUrl, oItem, noLimit).then(function (oPage) {
                        emailContent += oPage + '<hr>';
                    }));
                }
            } catch (e) {// do not add
            }
        });
        Promise.all(mPromises).then(function () {
            if (bSendMail) {
                sendEmail(emailContent, `Rss feed - ${sUrl}`);
            } else {
                let fullPath = path.join(__dirname, 'articles/', mFeed.title.replace(/ /gi, '_') + '.html');
                fs.writeFileSync(fullPath, emailContent);
            }

            getFeedResolver(emailContent);
        });
    });

}


// if (process.argv[2]) {
//     let URL = process.argv[2];
//     getFeed(URL);
// } else {
//     console.warn('Call the function with an RSS url.');
//     console.warn('Like: node getRssFeed.js "https://old.reddit.com/r/wallstreetbets/top/.rss?sort=top&t=day"');
// }

exports.getFeed = getFeed;