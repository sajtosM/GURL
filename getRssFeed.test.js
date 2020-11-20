/* eslint-disable no-undef */
const { getFeed } = require('./getRssFeed');

// test('rss get', () => {
// });

async function test () {
    await getFeed('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 1);
    
    await getFeed('https://old.reddit.com/search/.rss?q=author%3Abigbear0083+Ahead+for+the+trading+week+beginning&restrict_sr=&sort=relevance&t=week', 1, true);

}

test();
