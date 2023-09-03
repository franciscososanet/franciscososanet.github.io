import nodemailer from 'nodemailer'
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_NICKNAME, MAIL_PASS } from '../../config.js';

async function sendEmailPurchase(toEmail, transaction, licenseKey){

    const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: true,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS
        }
    });

    const buyerNameComplete = `${transaction.buyer.firstName} ${transaction.buyer.lastName}`;
    const product = `${transaction.product.name.replace(" franciscososa.net", "")}`;
    const amount = `${transaction.product.price} (${transaction.currency})`;
    const date = `${transaction.purchaseDate}`;
    const platform = `${transaction.platform.charAt(0).toUpperCase() + transaction.platform.slice(1)}`;
    const transactionId = `${transaction.transactionId}`;
    const paymentMethodStr = getPaymentMethodStr(platform, transaction.paymentMethod.method, transaction.paymentMethod.typeId);

    const mailOptions = {

        from: `${MAIL_NICKNAME} <${MAIL_USER}>`,
        to: toEmail,
        subject: 'Confirmación de tu compra y detalles de la licencia',
        html: `

        <body>
            <div style="text-align: center;">
            <img src="https://i.imgur.com/xUGprv9.png" alt="Encabezado" style="width: 100%;"/>
            </div>
            <h1>¡Adquiriste una <b>${product.toLowerCase()}</b>!</h1>
            <p>Hola ${buyerNameComplete},</p>
            <p>Es un placer informarte que tu compra se ha procesado exitosamente. ¡Te damos la bienvenida!</p>
            <p>El código de tu licencia es:<br/><b>${licenseKey}</b></p>
            <hr />
            <p>Detalles de la transacción:</p>
            <ul>
                <li>Producto adquirido: "${product}"</li>
                <li>Monto: ${amount}</li>
                <li>Fecha de compra: ${date}</li>
                <li>Medio de pago: ${paymentMethodStr}</li>
                <li>Número de comprobante: ${transactionId}</li>
            </ul>
            <hr />
            <p>Este email fue generado automáticamente. Si tienes alguna pregunta o necesitas asistencia, nuestro equipo de <a href="https://franciscososa.net/#contacto">atención al cliente</a> está aquí para ayudarte. No dudes en ponerte en contacto con nosotros.</p>
            <p>Recuerda que estamos aquí para brindarte el mejor servicio posible.<br />¡Gracias por elegirnos como tu proveedor de software!</p>
            <p>Atentamente,</p>
            <p>El equipo de Ventas de <a href="https://franciscososa.net">FRANCISCOSOSA.NET</a></p>
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

function getPaymentMethodStr(platform, method, typeId){

    if(platform === 'Paypal') return platform;

    if(method === 'account_money') return `${platform}`;
    
    let cardType = '';

    switch(typeId){
        case 'credit_card': cardType = 'Crédito'; break;
        case 'debit_card': cardType = 'Débito'; break;
        default: cardType = ''; break;
    }

    return `${platform} (${cardType} ${method.toUpperCase()})`;
}

export default sendEmailPurchase;
