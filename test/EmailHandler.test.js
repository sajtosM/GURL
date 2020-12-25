/* eslint-disable no-undef */
const { EmailHandler } = require('../src/EmailHandler');


it('Test creating an instance of EmailHandler.', function () {
    const emailHandler = new EmailHandler();
    expect(emailHandler).toBeDefined();
});

it('Test setting the config', function () {
    const emailHandler = new EmailHandler();
    emailHandler.setConfig(false);

    expect(emailHandler.getUser()).toBe('test@gmail.com');
    expect(emailHandler.getPass()).toBe('test-my-shiny-ass');
    expect(emailHandler.getTarget()).toBe('test@example.com');
});

it('Test sending an email.', function () {
    expect.assertions(2);
    const emailHandler = new EmailHandler();
    expect(emailHandler).toBeDefined();

    emailHandler.setConfig(true);

    let res = emailHandler.sendEmail('Testy testy test','MY best test');
    expect(res).toBeDefined();
});

it('Test the email content setting, getting', function () {
    const emailHandler = new EmailHandler();
    expect(emailHandler).toBeDefined();

    emailHandler.setEmailContent('test content', 'test title');

    expect(emailHandler.getContent()).toBe('test content');
    expect(emailHandler.getTitle()).toBe('test title');
});

it('Test title default', function () {
    const emailHandler = new EmailHandler();

    expect(emailHandler.getTitle()).toBe('Hírek');
});