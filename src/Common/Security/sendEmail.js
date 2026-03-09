import nodemailer from "nodemailer";

export async function sendEmail ({to,subject,text}) {

    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"nadinfarid09@gmail.com",
            pass:'cwfssqfvnmtdqtqf'
        }
    });

    await transporter.sendMail({
        from:"yourprojectemail@gmail.com",
        to,
        subject,
        text
    });

};