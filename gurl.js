const meow = require('meow');

const { main } = require('./src/main');

const cli = meow(`
	Usage
	  $ node gurl <RSS_URL_input>

	Options
	  --init, -i        Initialize the config.json
	  --noMail, -m      Does not send an email
	  --showAll, -a     Does not cut the article text
      --limit, -l       Limit for the read articles
      --noSave, -n      Do not save the the html file

	Examples
	  $ node gurl --init
	  $ node gurl "https://reddit.com/r/wallstreetbets/.rss" -l 5 --showAll
`, {
    flags: {
        init: {
            type: 'boolean',
            default: false,
            alias: 'i'
        },
        noMail: {
            type: 'boolean',
            default: false,
            alias: 'm'
        },
        showAll: {
            type: 'boolean',
            default: false,
            alias: 'a'
        },
        limit: {
            type: 'number',
            alias: 'l'
        },
        noSave: {
            type: 'boolean',
            alias: 'n'
        },
    }
});


main(cli);