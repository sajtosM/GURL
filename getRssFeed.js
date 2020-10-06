const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const { addArticle } = require('./addArticle');

const parser = new Parser();

async function getFeed(sUrl, nLimit) {

    let mFeed = await parser.parseURL(sUrl);
    console.log(mFeed.title);
    let emailContent = `<h1>Rss feed - ${sUrl}</h1>`;
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
                mPromises.push(addArticle(sLinkUrl, oItem).then(function (oPage) {
                    emailContent += oPage;
                }));
            }
        } catch (e) {// do not add
        }
    });
    Promise.all(mPromises).then(function () {
        let fullPath = path.join(__dirname, 'articles/', mFeed.title.replace(/ /gi, '_') + '.html');
        fs.writeFileSync(fullPath, emailContent);
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