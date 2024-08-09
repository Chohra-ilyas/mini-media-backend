const nodemailer = require("nodemailer");

module.exports = async (userEmail, subject, HTMLTemplate) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL, //sender
        pass: process.env.APP_PASS,
      },
    });

    const mailOption = {
      from: process.env.APP_EMAIL, //sender
      to: userEmail,
      subject: subject,
      html: HTMLTemplate,
    };

    await transporter.sendMail(mailOption);
  } catch (error) {
    consol.log(error);
    throw new Error("Internal Server Error (nodemailer)");
  }
};
