import nodemailer from 'nodemailer';
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } from '../../config.js';

async function sendContactEmail(data){

    const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: true,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS
        }
    });

    const mailOptions = {
        from: `${data.email} <${data.name}>`,
        to: 'ventas@franciscososa.net',
        subject: `${data.title}`,
        html: `
            <body>
                <h2>Datos del contacto:</h2>
                <li>
                    <ul>Email: ${data.email}</ul>
                    <ul>Nombre: ${data.name}</ul>
                </li>
                <hr />
                
                <p>${data.message}</p>
            </body>
        `
    };

    try{
        const info = await transporter.sendMail(mailOptions);
        console.log('EMAIL CORRECTAMENTE ENVIADO:', info.response);
    }catch(error){
        console.error('ERROR AL ENVIAR EL EMAIL:', error);
    }
}

export default sendContactEmail;
