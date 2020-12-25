const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ora = require('ora');

class EmailHandler {
    /**
     *Creates an instance of EmailHandler.
     * @memberof EmailHandler
     */
    constructor() {
        this.config = {};
    }

    /**
     * Get the email config from the config.json
     *
     * @param {boolean} bDebug
     * @returns success
     * @memberof EmailHandler
     */
    setConfig(bNoDebug) {
        if (bNoDebug || process.env.JEST_WORKER_ID == undefined) {
            try {
                this.config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')));
                this.configureTransporter();
            } catch (e) {
                console.error('Create a config.json for sending of emails');
                return 1;
            }
        } else {
            this.bDebug = true;
            this.config = JSON.parse(fs.readFileSync(path.join(__dirname, '../test/config.json')));
            this.configureTransporter();
        }
    }

    /**
     * Gets the user email
     *
     * @returns {string} sender email as string
     * @memberof EmailHandler
     */
    getUser() {
        return this.config.auth.user;
    }
    /**
     * Gets the password of the sender account
     *
     * @returns {string} password as string
     * @memberof EmailHandler
     */
    getPass() {
        return this.config.auth.pass;
    }
    /**
     * Gets the email where the newsletter is going to be sent
     *
     * @returns {string} recipient email
     * @memberof EmailHandler
     */
    getTarget() {
        return this.config.target;
    }

    /**
     *
     *
     * @param {string} content content of the email as html
     * @param {string} title of the email
     * @returns {Promise} the promise of the email
     * @memberof EmailHandler
     */
    sendEmail(content, title) {
        this.setEmailContent(content, title);

        let that = this;
        return new Promise(function (handleEmailSent) { that.sendMailInner(handleEmailSent); });
    }

    /**
     * Sets the content of the email
     *
     * @param {string} content content of the email as html
     * @param {string} title of the email
     * @memberof EmailHandler
     */
    setEmailContent(content, title) {
        this.sContent = content;
        this.sTitle = title;
    }

    /**
     * Gets the title of the email
     *
     * @param {string} title of the email
     * @memberof EmailHandler
     */
    getTitle() {
        return this.sTitle || 'Hírek';
    }

    /**
     * gets the email content
     *
     * @param {string} content content of the email as html
     * @memberof EmailHandler
     */
    getContent() {
        return this.sContent;
    }
    /**
     * Configures the email options and sends the mail
     *
     * @param {Function} handleEmailSent function to execute after the mail is sent
     * @memberof EmailHandler
     */
    sendMailInner(handleEmailSent) {
        this.spinner = ora(`Sending mail to ${this.getTarget()}`).start();

        const mailOptions = {
            from: this.getUser(),
            to: this.getTarget(),
            subject: this.getTitle(),
            html: this.getContent()
        };

        let that = this;
        this.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                that.emailError(error, handleEmailSent);
            } else {
                that.emailSuccess(info, handleEmailSent);
            }
        });
    }

    emailSuccess(info, handleEmailSent) {
        this.spinner.succeed(`Sending mail to ${this.getTarget()} | Email sent: ${info.response}`);
        handleEmailSent(info);
    }

    emailError(error, handleEmailSent) {
        this.spinner.fail(`Sending mail to ${this.getTarget()} | Failed`);
        if (!this.bDebug) {
            // Fail expected
            console.error(error);
        }
        handleEmailSent(error);
    }

    configureTransporter() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.getUser(),
                pass: this.getPass()
            }
        });
    }
}


exports.EmailHandler = EmailHandler;