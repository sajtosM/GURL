const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ora = require('ora');

let config;
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
    exports.sendEmail = sendEmail;
} catch (e) {
    console.error('Create a config.json for sending of emails');
    exports.sendEmail = function () {
        console.error('Create a config.json for sending of emails');
        return 1;
    };
}

function sendEmail(content, title) {
    return new Promise(function (handleEmailSent) {
        let spinner = ora(`Sending mail to ${config.target}`).start();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.auth.user,
                pass: config.auth.pass
            }
        });

        const mailOptions = {
            from: config.auth.user,
            to: config.target,
            subject: title || 'Hírek',
            html: content
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                spinner.fail(`Sending mail to ${config.target} | Failed`);
                console.log(error);
                handleEmailSent(error);
            } else {
                spinner.succeed(`Sending mail to ${config.target} | Email sent: ${info.response}`);
                handleEmailSent(info);
            }
        });
    });



}