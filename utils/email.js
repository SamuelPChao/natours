const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Samuel P Chao <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    if (process.env.NODE_ENV === "production")
      mailOptions.from = process.env.SENDGRID_EMAIL_FROM;
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      "welcome",
      "Welcome To The Natour Family!"
    );
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your Password Reset Token Valid For 10 Minutes Only"
    );
  }
};

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: "Samuel P Chao <sampchao@test.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // Asynchronous returns Promise
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
