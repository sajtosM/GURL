const { addArticle } = require("./addArticle");

if (process.argv[2]) {
    var URL = process.argv[2];
    addArticle(URL);
} else {
    console.error('Enter an URL');
    addArticle('https://www.barrons.com/articles/facebook-stock-slides-as-analysts-realize-just-how-tough-ad-business-is-51587492585?siteid=yhoof2');
       
}

