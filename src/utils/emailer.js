import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASS,
    },
});

export const emailer = async (email,content) => {

    const mailOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: "Confirmation Email",
        html: content, //Html "content" with token inbuilt
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return false
        } else {
            console.log("Email Sent" + info.response);
            return true
        }
    }); 
};
