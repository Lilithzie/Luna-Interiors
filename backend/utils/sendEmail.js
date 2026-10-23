const nodemailer = require('nodemailer');

// options: { email, subject, message }                      -> simple text email (password reset)
//          { email, subject, html, attachments: [{...}] }   -> rich email, optionally with attachments (order receipt)
const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        // do not let a slow mail server hang the request for long
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html || `<p>${options.message}</p>`
    }
    if (options.attachments && options.attachments.length) {
        message.attachments = options.attachments
    }

    await transporter.sendMail(message)
}

module.exports = sendEmail;
