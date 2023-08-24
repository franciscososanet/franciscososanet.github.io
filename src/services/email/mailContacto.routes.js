import express from 'express';
import nodemailer from 'nodemailer';
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } from "../../config.js";

const router = express.Router();

router.post('/sendEmail', async (req, res) => {

    const { name, email, title, message } = req.body;

    const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: true,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS
        }
    });

    const formattedMeesage = message.replace(/\n/g, '<br>'); //Para que a la casilla de correo se respeten los saltos de linea

    const mailOptions = {
        from: `${name} <${email}>`,
        to: 'contacto@franciscososa.net',
        subject: title,
        html: `
            <body>
                <h2>Datos del contacto:</h2>
                <li>
                    <ul>Email: ${email}</ul>
                    <ul>Nombre: ${name}</ul>
                </li>
                <hr />
                <h2>${title}</h2>
                <p>${formattedMeesage}</p>
                <hr />
            </body>
        `
    };

    try{
        const info = await transporter.sendMail(mailOptions);
        console.log('EMAIL CORRECTAMENTE ENVIADO:', info.response);
        res.status(200).send({ message: 'Correo enviado con éxito.' });
    }catch (error) {
        console.error('ERROR AL ENVIAR EL EMAIL:', error);
        res.status(500).send({ message: 'Error al enviar el correo.' });
    }
});

export default router;
