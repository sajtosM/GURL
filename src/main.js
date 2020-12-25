const readline = require('readline');
const path = require('path');
const fs = require('fs');

const { RssFeedHandler } = require('./RssFeedHandler');

function main(cli) {
    if (cli.flags.init) {
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
    } else if (cli.input[0]) {
        const URL = cli.input[0];
        const bSendMail = !cli.flags.noMail;
        const bNoLimit = cli.flags.showAll;
        const nLimit = cli.flags.limit;
        const bNoSaveFile = cli.flags.noSave;

        const rssFeed = new RssFeedHandler(URL, nLimit, bNoLimit);
        rssFeed.getFeed(bSendMail, bNoSaveFile);
    } else {
        cli.showHelp();
    }
}

exports.main = main;