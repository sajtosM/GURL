const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

let config;
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
} catch (e) {
    console.error('Create a config.json for sending of emails');
}

function sendEmail(content, title) {


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.auth.user,
            pass: config.auth.pass
        }
    });

    const mailOptions = {
        from: 'gorcsew.ivan@gmail.com',
        to: config.target,
        subject: title || 'Hírek',
        html: content
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

exports.sendEmail = sendEmail;