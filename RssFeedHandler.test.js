/* eslint-disable no-undef */
const { RssFeedHandler } = require('./RssFeedHandler');


const WIKI_TEST_FEED = JSON.parse('[{"title":"A(z) Wikipédia december 2-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201202000000/hu","pubDate":"2020-12-02T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201202000000/hu","isoDate":"2020-12-02T00:00:00.000Z"},{"title":"A(z) Wikipédia december 3-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201203000000/hu","pubDate":"2020-12-03T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201203000000/hu","isoDate":"2020-12-03T00:00:00.000Z"},{"title":"A(z) Wikipédia december 4-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201204000000/hu","pubDate":"2020-12-04T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201204000000/hu","isoDate":"2020-12-04T00:00:00.000Z"},{"title":"A(z) Wikipédia december 5-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201205000000/hu","pubDate":"2020-12-05T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201205000000/hu","isoDate":"2020-12-05T00:00:00.000Z"},{"title":"A(z) Wikipédia december 6-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201206000000/hu","pubDate":"2020-12-06T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201206000000/hu","isoDate":"2020-12-06T00:00:00.000Z"},{"title":"A(z) Wikipédia december 7-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201207000000/hu","pubDate":"2020-12-07T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201207000000/hu","isoDate":"2020-12-07T00:00:00.000Z"},{"title":"A(z) Wikipédia december 8-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201208000000/hu","pubDate":"2020-12-08T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201208000000/hu","isoDate":"2020-12-08T00:00:00.000Z"},{"title":"A(z) Wikipédia december 9-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201209000000/hu","pubDate":"2020-12-09T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201209000000/hu","isoDate":"2020-12-09T00:00:00.000Z"},{"title":"A(z) Wikipédia december 10-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201210000000/hu","pubDate":"2020-12-10T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201210000000/hu","isoDate":"2020-12-10T00:00:00.000Z"},{"title":"A(z) Wikipédia december 11-i kiemelt cikke","link":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201211000000/hu","pubDate":"2020-12-11T00:00:00.000Z","author":"","id":"https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201211000000/hu","isoDate":"2020-12-11T00:00:00.000Z"}]');

it('Test creating an instance of RssFeedHandler.', function () {
    const rssFeed = new RssFeedHandler('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 1);
    expect(rssFeed).toBeDefined();
});

it('Test setTile', function () {
    const testerRssFeed = new RssFeedHandler('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 1);
    expect(testerRssFeed).toBeDefined();
    testerRssFeed.setTile('Title Test');
    expect(testerRssFeed.sTitle).toBe('Title Test');
});

it('Test reddit link', function () {
    const oRssHandler = new RssFeedHandler('https://reddit.com/r/wallstreetbets/top/.rss?sort=top&t=day', 1);
    expect(oRssHandler.bIsReddit).toBe(true);

    const sLink = oRssHandler.getLinkFromItem({
        link: 'ohNo',
        content: '<a href="http://testtest">[link]</a>'

    });
    expect(sLink).toBe('http://testtest');
});

it('Test get test no defined maximum', function () {
    const oRssHandler = new RssFeedHandler('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom');

    expect(oRssHandler.noLimit).toBe(false);
    expect(oRssHandler.nLimit).toBe(100);

    const mFeed = oRssHandler.getFeedItems(WIKI_TEST_FEED);
    expect(mFeed.length).toBe(10);
    expect(mFeed[0].sLink).toBe('https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201202000000/hu');
});

it('Test get feed items', function () {
    const oRssHandler = new RssFeedHandler('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 5);

    expect(oRssHandler.noLimit).toBe(false);
    const mFeed = oRssHandler.getFeedItems(WIKI_TEST_FEED);
    expect(mFeed.length).toBe(5);
    expect(mFeed[0].sLink).toBe('https://hu.wikipedia.org/wiki/Speci%C3%A1lis:FeedItem/featured/20201202000000/hu');
});

it('Test setting noLimit', function () {
    const oRssHandler = new RssFeedHandler('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 5,true);

    expect(oRssHandler.noLimit).toBe(true);
});


it('Test send email get', async () => {
    expect.assertions(1);
    const rssFeed = new RssFeedHandler('', 1);
    const res = await rssFeed.sendEmail(`Egg and bacon
    Egg, sausage and bacon
    Egg and Spam
    Egg, bacon and Spam
    Egg, bacon, sausage and Spam
    Spam, bacon, sausage and Spam
    Spam, egg, Spam, Spam, bacon and Spam
    Spam, Spam, Spam, egg and Spam, SPAM! SPAM`, 'THIS IS SPAM BUY SPAM SPAM');
    expect(res.accepted.length).toBeGreaterThanOrEqual(1);
});

it('Test test Feed parser ', async () => {
    expect.assertions(3);
    const oRssHandler = new RssFeedHandler('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 1);
    const res = await oRssHandler.parseFeed();

    expect(res.items.length).toBeGreaterThanOrEqual(1);
    expect(res.title).toBeDefined();
    expect(res).toBeDefined();
});

it('Test RSS get Email Style', async () => {
    expect.assertions(1);
    const rssFeed = new RssFeedHandler('', 1);
    const emailContent = rssFeed.getEmailStyle();
    expect(emailContent).toBeDefined();
});

it('Test wikipedia link', function () {
    const oRssHandler = new RssFeedHandler('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 1);
    expect(oRssHandler.bIsReddit).toBe(false);

    const sLink = oRssHandler.getLinkFromItem({
        link: 'http://wiki',
        content: '<a href="http://testtest">[link]</a>'

    });
    expect(sLink).toBe('http://wiki');
});

it('Test RSS get wikipedia', async () => {
    expect.assertions(1);
    const rssFeed = new RssFeedHandler('https://hu.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', 2);
    const res = await rssFeed.getFeed();
    expect(res).toBeDefined();
});

it('Test adding articles', async () => {
    expect.assertions(2);
    const rssFeed = new RssFeedHandler('', 1);

    const mFeed = [rssFeed.getFeedItems(WIKI_TEST_FEED)[0]];
    const mPromises = rssFeed.addAllFeedItems(mFeed);
    expect(mPromises.length).toBe(1);

    const mPromisesGeted = rssFeed.getPromises();
    expect(mPromises.length).toBe(mPromisesGeted.length);
});

it('Test adding articles with no limit', async () => {
    expect.assertions(2);
    const rssFeed = new RssFeedHandler('', 1, true);

    const mFeed = [rssFeed.getFeedItems(WIKI_TEST_FEED)[0]];
    const mPromises = rssFeed.addAllFeedItems(mFeed);
    expect(mPromises.length).toBe(1);

    const mPromisesGeted = rssFeed.getPromises();
    expect(mPromises.length).toBe(mPromisesGeted.length);
});

it('Test add content', function () {
    const oRssHandler = new RssFeedHandler('', 1);

    oRssHandler.addToFeedContent(`Egg and bacon
    //     Egg, sausage and bacon
    //     Egg and Spam
    //     Egg, bacon and Spam
    //     Egg, bacon, sausage and Spam
    //     Spam, bacon, sausage and Spam
    //     Spam, egg, Spam, Spam, bacon and Spam
    //     Spam, Spam, Spam, egg and Spam, SPAM! SPAM`);

    expect(oRssHandler.getFeedContent().length).toBe(1);
    expect(oRssHandler.getFeedContent()[0]).toBe(`Egg and bacon
    //     Egg, sausage and bacon
    //     Egg and Spam
    //     Egg, bacon and Spam
    //     Egg, bacon, sausage and Spam
    //     Spam, bacon, sausage and Spam
    //     Spam, egg, Spam, Spam, bacon and Spam
    //     Spam, Spam, Spam, egg and Spam, SPAM! SPAM`);
});

it('Test render html', function () {
    const oRssHandler = new RssFeedHandler('', 1);

    oRssHandler.addToFeedContent(`Egg and bacon
    //     Egg, sausage and bacon
    //     Egg and Spam
    //     Egg, bacon and Spam
    //     Egg, bacon, sausage and Spam
    //     Spam, bacon, sausage and Spam
    //     Spam, egg, Spam, Spam, bacon and Spam
    //     Spam, Spam, Spam, egg and Spam, SPAM! SPAM`);

    expect(oRssHandler.getHTMLFeedContent()).toMatch(/Egg, sausage and bacon/);
});

it('Test writing', function () {
    const oRssHandler = new RssFeedHandler('Test', 1);

    oRssHandler.writeToThePath(`Egg and bacon
    //     Egg, sausage and bacon
    //     Egg and Spam
    //     Egg, bacon and Spam
    //     Egg, bacon, sausage and Spam
    //     Spam, bacon, sausage and Spam
    //     Spam, egg, Spam, Spam, bacon and Spam
    //     Spam, Spam, Spam, egg and Spam, SPAM! SPAM`);


    expect(0).toBe(0);

});