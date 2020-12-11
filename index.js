const { RssFeedHandler } = require('./RssFeedHandler');

if (process.argv[2]) {
    let URL = process.argv[2];
    let bSendMail = process.argv.some((argv) => argv === '--sendMail');
    let nLimit;
    if (!isNaN(process.argv[3])) {
        nLimit = process.argv[3];
    } else if (!isNaN(process.argv[4])) {
        nLimit = process.argv[4];
    }
    const rssFeed = new RssFeedHandler(URL, nLimit);
    rssFeed.getFeed(bSendMail);
} else {
    console.warn('Call the function with an RSS url.');
    console.warn('Like: node index.js "https://reddit.com/r/wallstreetbets/top/.rss?sort=top&t=day"');
    console.warn('--sendMail if you like to send an email');
}
