const meow = require('meow');

const { main } = require('./main');

const cli = meow(`
	Usage
	  $ node gurl <RSS_URL_input>

	Options
	  --init, -i  Initialize the config.json
	  --noMail, -m  Initialize the config.json
	  --showAll, -a  Initialize the config.json
	  --limit, -l  Limit for the 

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
    }
});


main(cli);