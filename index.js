const readline = require('readline');
const path = require('path');
const fs = require('fs');

const { RssFeedHandler } = require('./RssFeedHandler');

if (process.argv.some((argv) => argv === '--init')) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Email address do you want to send the mails? ', function (sToEmail) {
        rl.question('Email address do you want to use to send the mails? ', function (sFromEmail) {
            rl.question('Password for the Email address? ', function (sPass) {
                const configFile = {
                    target: sToEmail,
                    auth: {
                        user: sFromEmail,
                        pass: sPass
                    }
                };
                console.log(configFile);
                rl.question('Do you want to save the config?(y/n) ', function (sYesNo) {
                    if (sYesNo.toLocaleLowerCase() === 'y') {
                        fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(configFile));
                        process.exit(0);
                    }
                });
            });
        });
    });

} else if (process.argv[2]) {
    let URL = process.argv[2];
    let bSendMail = !process.argv.some((argv) => argv === '--noMail');
    let bNoLimit = !process.argv.some((argv) => argv === '--noLimit');
    let nLimit;
    if (!isNaN(process.argv[3])) {
        nLimit = process.argv[3];
    } else if (!isNaN(process.argv[4])) {
        nLimit = process.argv[4];
    }
    const rssFeed = new RssFeedHandler(URL, nLimit, bNoLimit);
    rssFeed.getFeed(bSendMail);
} else {
    console.warn('Call the function with an RSS url.');
    console.warn('Like: node index.js "https://reddit.com/r/wallstreetbets/top/.rss?sort=top&t=day"');
    console.warn('--sendMail if you like to send an email');
}
