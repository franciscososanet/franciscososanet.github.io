import nodemailer from 'nodemailer'
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_NICKNAME, MAIL_PASS } from '../../config.js';

async function sendEmail(toEmail){

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

        from: `${MAIL_NICKNAME} <${MAIL_USER}>`,
        to: toEmail,
        subject: 'Confirmación de tu compra y detalles de la licencia',
        html: `

        <head>
            <style>
                .button {
                    background-color: #4CAF50; /* Color de fondo del botón */
                    border: none; /* Sin bordes */
                    color: white; /* Color del texto */
                    padding: 12px 24px; /* Espaciado interior del botón */
                    text-align: center; /* Alineación del texto */
                    text-decoration: none; /* Sin subrayado en el texto */
                    display: inline-block; /* Display como bloque en línea */
                    font-size: 16px; /* Tamaño de fuente */
                    margin: 4px 2px; /* Márgenes exteriores del botón */
                    cursor: pointer; /* Cambiar cursor a puntero al pasar por encima */
                    border-radius: 12px; /* Bordes redondeados */
                }
            </style>
        </head>
        <body>
            <div style="text-align: center;">
            <img src="https://i.imgur.com/bsxympw.png" alt="Encabezado" style="width: 1000px;"/>
            </div>
            <h1>¡Gracias por tu compra!</h1>
            <p>Hola NOMBRE,</p>
            <p>Es un placer informarte que tu compra se ha procesado exitosamente. ¡Te damos la bienvenida!</p>
            <p>Detalles de la transacción:</p>
            <ul>
                <li>Producto adquirido: PRODUCTO</li>
                <li>Monto: MONTO</li>
                <li>Fecha de compra: FECHA</li>
                <li>Medio de pago: MEDIO DE PAGO</li>
                <li>Destinatario: DESTINATARIO</li>
                <li>Número de comprobante: ID DE TRANSACCION</li>
            </ul>
            <p>Hemos generado este mail de manera automática. Si tienes alguna pregunta o necesitas asistencia, nuestro equipo de atención al cliente está aquí para ayudarte. No dudes en ponerte en contacto con nosotros haciendo clic en el siguiente enlace:</p>
            <a href="https://franciscososa.net/support" class="button">Botón de enlace de soporte</a>
            <p>Recuerda que estamos aquí para brindarte el mejor servicio posible. ¡Gracias por elegirnos como tu proveedor de licencias!</p>
            <p>Atentamente,</p>
            <p>El equipo de Ventas de Franciscososa.net</p>
        </body>
        `
    };

    try{
        const info = await transporter.sendMail(mailOptions);
        console.log('EMAIL CORRECTAMENTE ENVIADO:', info.response);
    }catch (error){
        console.error('ERROR AL ENVIAR EL EMAIL:', error);
    }
}

export default sendEmail;
