const { getFeed } = require('./getRssFeed');

if (process.argv[2]) {
    let URL = process.argv[2];
    getFeed(URL);
} else {
    console.warn('Call the function with an RSS url.');
    console.warn('Like: node index.js "https://old.reddit.com/r/wallstreetbets/top/.rss?sort=top&t=day"');
}
