import nodemailer from "nodemailer";
import { MAIL_PASS, MAIL_USER } from "../../../config/config.service.js";



/* han use nodemailer de library bn use it 34an n send emails w kda 
firstt bn7aded eh el service elli han send mnha el mail , gmail wala outlook wala eh bzbt 
b3denn bta5ood brdo el mail elli gebna beh el app password
*/ 



const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:MAIL_USER,
            pass:MAIL_PASS
        }
    });

export async function sendEmail ({ to , subject , text , html , attachments }) {
    const info = await transporter.sendMail({
        from: `<${MAIL_USER}>`,
        to,
        subject,
        text,
        html,
        attachments,
    });

    console.log('Email Sent : ' , info.messageId);
};