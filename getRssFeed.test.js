/* eslint-disable no-undef */
const { getFeed } = require('./getRssFeed');

// test('rss get', () => {
// });

getFeed('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 1);

getFeed('https://hang.hu/feed/', 2);