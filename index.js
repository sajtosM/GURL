const { getFeed } = require('./getRssFeed');

if (process.argv[2]) {
    console.log(process.argv);
    let URL = process.argv[2];
    let nLimit = process.argv[3] ? process.argv[3] : undefined;
    let bSendMail = process.argv.some((argv) => argv === '--sendMail');
    getFeed(URL, nLimit, bSendMail);
} else {
    console.warn('Call the function with an RSS url.');
    console.warn('Like: node index.js "https://reddit.com/r/wallstreetbets/top/.rss?sort=top&t=day"');
    console.warn('--sendMail if you like to send an email');
}
