const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const ora = require('ora');

const { sendEmail } = require('./sendEmail');
const { addArticle } = require('./addArticle');

const parser = new Parser();

/**
 *
 * @class RssFeedHandler
 */
class RssFeedHandler {
    /**
    * Creates an instance of RssFeedHandler.
    * @param {string} sUrl url to a string
    * @param {integer} nLimit maximum amount of articles to get
    * @memberof RssFeedHandler
    */
    constructor(sUrl, nLimit, noLimit) {
        this.sUrl = sUrl;
        this.bIsReddit = /reddit/.test(sUrl);

        this.nLimit = nLimit < 0 || nLimit == undefined ? 100 : nLimit;
        this.noLimit = noLimit == true;

        this.sTitle = sUrl;
        this.spinner = ora();

        this.mPromises = [];

        this.emailContent = '';
        this.mFeedContent = [];
    }

    /**
     * Sets the title of the Feed
     *
     * @param {string} sTitle title of the parsed feed
     * @memberof RssFeedHandler
     */
    setTile(sTitle) {
        this.sTitle = sTitle;
    }

    /**
     * Load an RSS feed
     *
     * @param {boolean} bSendMail send the mail to the email defined in the config or not
     * @returns {Promise} promise of getting the feed
     * @memberof RssFeedHandler
     * @private
     */
    async getFeed(bSendMail) {

        /**
         * @type {RssFeedHandler}
         */
        let that = this;
        return new Promise(async function (getFeedResolver) {

            that.spinner = ora(`Getting feed ${that.sUrl}`).start();
            let mFeed = await that.parseFeed();
            that.setTile(mFeed.title);
            that.emailContent = that.getEmailStyle();
            that.mPromises = [];
            that.mFeedContent = [];

            let mFeedItems = that.getFeedItems(mFeed.items);
            that.spinner.succeed(`Getting feed ${that.sUrl} | ${mFeed.title}`);



            that.addAllFeedItems(mFeedItems);

            Promise.all(that.getPromises()).then(function () {
                that.resolePromises(bSendMail, getFeedResolver);
                getFeedResolver(that.getHTMLFeedContent());
            });
        });

    }

    /**
     * fires after all promises are resolved
     *
     * @param {*} bSendMail
     * @param {*} getFeedResolver
     * @memberof RssFeedHandler
     */
    resolePromises(bSendMail) {
        if (bSendMail) {
            this.spinner.text = 'Sending Email';
            this.sendEmail(this.getHTMLFeedContent());
        } else {
            this.writeToThePath(this.getHTMLFeedContent());
        }
    }

    /**
     * writes the content to the articles folder
     *
     * @param {string} emailContent
     * @memberof RssFeedHandler
     */
    writeToThePath(emailContent) {
        const sDirectory = path.join(__dirname, 'articles/');
        let fullPath = path.join(sDirectory, this.sTitle.replace(/ /gi, '_') + '.html');

        if (!fs.existsSync(sDirectory)) {
            fs.mkdirSync(sDirectory);
        }

        fs.writeFileSync(fullPath, emailContent);
    }

    /**
     * returns all of the promises defined by addAllFeedItems
     *
     * @returns
     * @memberof RssFeedHandler
     */
    getPromises() {
        return this.mPromises;
    }

    /**
     * get the article of all the items from the list
     *
     * @param {*} mFeedItems
     * @returns
     * @memberof RssFeedHandler
     */
    addAllFeedItems(mFeedItems) {
        let that = this;
        this.mPromises = mFeedItems.map(function (oFeedItem) {
            return addArticle(oFeedItem.sLink, oFeedItem, that.noLimit, that.spinner).then(function (oPage) {
                that.addToFeedContent(oPage);
            });
        });
        return this.mPromises;
    }

    /**
     * add a string to the feed item list
     *
     * @param {string} oPage
     * @memberof RssFeedHandler
     */
    addToFeedContent(oPage) {
        this.mFeedContent.push(oPage);
    }

    /**
     * gets feed items
     *
     * @returns {object[]} list of feed items
     * @memberof RssFeedHandler
     */
    getFeedContent() {
        return this.mFeedContent;
    }

    /**
     * Formats the feed items
     *
     * @returns
     * @memberof RssFeedHandler
     */
    getHTMLFeedContent() {
        let sEmailContent = this.emailContent;

        sEmailContent += this.getFeedContent().join('\n<hr>');

        return sEmailContent;
    }

    /**
     * Get the url from the item
     *
     * @param {object} oItem
     * @returns {object}
     * @memberof RssFeedHandler
     */
    getLinkFromItem(oItem) {
        let sLinkUrl = oItem.link;
        if (this.bIsReddit) {
            sLinkUrl = /<a href="(((?!<).)*)">\[link\]<\/a>/gi.exec(oItem.content)[1];
            sLinkUrl = sLinkUrl ? sLinkUrl : oItem.link;
        }
        return sLinkUrl;
    }

    /**
     * Formats the raw feed to the right format
     *
     * @param {object[]} mItems
     * @returns {object[]} mItems
     * @memberof RssFeedHandler
     */
    getFeedItems(mItems) {
        return mItems
            // filter elements over the defined limit
            .filter((oItem, nIndex) => nIndex < this.nLimit)
            .map((oItem) => {
                oItem.sLink = this.getLinkFromItem(oItem);
                return oItem;
            })
            .filter(oItem => oItem.sLink);
    }

    /**
     * Uses sendEmail.js to send a mail
     *
     * @param {string} emailContent body of the email
     * @returns {object} result of the email
     * @memberof RssFeedHandler
     */
    sendEmail(emailContent, sTile) {
        sTile = sTile ? sTile : `Rss feed - ${this.sTitle}`;
        return sendEmail(emailContent, sTile);
    }

    /**
     * Uses Rss Parser to get the feed of
     *
     * @returns {Parser.Output} output of the RSS parser
     * @memberof RssFeedHandler
     */
    async parseFeed() {
        return await parser.parseURL(this.sUrl);
    }

    /**
     * Creates the header for the email
     *
     * @returns {string} email as html
     * @memberof RssFeedHandler
     */
    getEmailStyle() {
        let css = fs.readFileSync(path.join(__dirname, 'css/aboutReader.css'));
        let emailContent = `
        <div class="container content-width3" style="--font-size:22px;">
            <h1>Rss feed - ${this.sTitle}</h1>
            <h5>${this.sUrl}</h5>
            <style>${css}</style>
        </div>
        `;


        return emailContent;
    }
}


exports.RssFeedHandler = RssFeedHandler;