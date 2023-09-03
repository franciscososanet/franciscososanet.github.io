import { PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET } from "../paypal/paypal.config.js"
import { HOST } from '../../config.js'
import axios from "axios"
import Transaction from "../../models/transaction.model.js";
import License from "../../models/license.model.js";
import sendEmailPurchase from "../../services/email/mailCompra.js";
import generateUniqueLicenseKey from "../../services/purchase/generacionLicencia.js";

let _email = null;

export const createOrder = async(req, res) => {

    const email = req.body.email; //Obtener el email desde el cuerpo de la solicitud
    const product = req.body.product;

    _email = email;

    let amount;
    let title;

    switch(product){

        case 'checkoutMensual':
            title = "Licencia mensual franciscososa.net";
            amount = "5.00";
            break;

        case 'checkoutSemestral':
            title = "Licencia semestral franciscososa.net";
            amount = "10.00";
            break;

        case 'checkoutAnual':
            title = "Licencia anual franciscososa.net";
            amount = "20.00";
            break;

        default: 
            return res.status(400).send('Producto no valido');

    }

    const order = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: amount,
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: amount
                        }
                    }
                },
                custom_id: title,
            }
        ],
        application_context: {
            brand_name: "FRANCISCOSOSA.NET",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            return_url: `${HOST}/capture-order`,
            cancel_url: `${HOST}/cancel-order`
        }
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const {data: {access_token}} = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
        auth: {
            username: PAYPAL_API_CLIENT,
            password: PAYPAL_API_SECRET
        }
    });

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order, {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })

    return res.json(response.data);
}

export const captureOrder = async(req, res) => {
    const { token } = req.query;

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {}, {
        auth:{
            username: PAYPAL_API_CLIENT,
            password: PAYPAL_API_SECRET
        }
    });

    const paymentData = response.data;

    console.log(paymentData);

    if(paymentData.status === "COMPLETED"){
        
        //1) Generar una licencia
        const licenseKey = await generateUniqueLicenseKey();

        //1.1) Calcular la fecha de expiracion de la licencia
        const expirationDate = calculateExpirationDate(paymentData.purchase_units[0].payments.captures[0].create_time, paymentData.purchase_units[0].payments.captures[0].custom_id);

        //2) Crear instancia de License
        const newLicense = new License({
            licenseKey: licenseKey,
            transactionId: paymentData.id,
            platform: 'paypal',
            purchaseDate: formatPurchaseDate(paymentData.purchase_units[0].payments.captures[0].create_time),
            expirationDate: expirationDate,
            currency: paymentData.purchase_units[0].payments.captures[0].amount.currency_code,
            buyer: {
                firstName: paymentData.payer.name.given_name,
                lastName: paymentData.payer.name.surname,
                email: paymentData.payer.email_address,
                phoneNumber: 'N/A',
                id: paymentData.payer.payer_id,
                ip: req.ip || 'N/A',
            },
            product: {
                name: paymentData.purchase_units[0].payments.captures[0].custom_id,
                description: '',
                productId: paymentData.purchase_units[0].payments.captures[0].id,
                price: paymentData.purchase_units[0].payments.captures[0].amount.value,
                currency: paymentData.purchase_units[0].payments.captures[0].amount.currency_code,
            },
            status: paymentData.status,
            paymentMethod: 'paypal',
            paymentDetails: {
                transactionNumber: paymentData.id,
            }
        });

        //3) Guardar la nueva licencia en la base de datos
        await newLicense.save();

        //4) Crear una nueva instancia de Transaction
        const newTransaction = new Transaction({
            transactionId: paymentData.id,
            platform: 'paypal',
            purchaseDate: formatPurchaseDate(paymentData.purchase_units[0].payments.captures[0].create_time),
            currency: paymentData.purchase_units[0].payments.captures[0].amount.currency_code,
            buyer: {
                firstName: paymentData.payer.name.given_name,
                lastName: paymentData.payer.name.surname,
                email: paymentData.payer.email_address,
                phoneNumber: 'N/A',
                id: paymentData.payer.payer_id,
                ip: req.ip || 'N/A',
            },
            product: {
                name: paymentData.purchase_units[0].payments.captures[0].custom_id,
                description: '',
                productId: paymentData.purchase_units[0].payments.captures[0].id,
                price: paymentData.purchase_units[0].payments.captures[0].amount.value,
                currency: paymentData.purchase_units[0].payments.captures[0].amount.currency_code,
            },
            status: paymentData.status,
            paymentMethod: {
                method: 'paypal',
            }, 
            paymentDetails: {
                transactionNumber: paymentData.id,
            }
        });

        //5) Guardar la nueva transaccion en la base de datos
        await newTransaction.save();
        console.log('Transacción guardada con éxito en la base de datos');

        //6) Enviar correo electronico al comprador
        try{
            await sendEmailPurchase(_email, newTransaction, licenseKey);
            console.log("PAGO APROBADO");
        }catch(error){
            console.log(error);
            // return res.sendStatus(500).json({error: error.message });
        }

    }else{
        console.log("Estado de pago no reconocido:", paymentData.status);
    }

    return res.redirect(`${HOST}/compraexitosa.html?email=${_email}&product=${paymentData.purchase_units[0].payments.captures[0].custom_id}`);
}

export const cancelPayment = (req, res) => res.redirect(`${HOST}/licencias.html`);


function formatPurchaseDate(date){

    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

function calculateExpirationDate(purchaseDate, productName){
    const [datePart, timePart] = purchaseDate.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.replace('Z', '').split(':').map(Number);  // hemos añadido un replace('Z', '') para quitar la 'Z' del final
    
    const dateObj = new Date(year, month - 1, day, hours, minutes, seconds); 

    const lowerCaseProductName = productName.toLowerCase();

    if(lowerCaseProductName.includes("licencia mensual")){
        dateObj.setMonth(dateObj.getMonth() + 1);
    }else if(lowerCaseProductName.includes("licencia semestral")){
        dateObj.setMonth(dateObj.getMonth() + 6);
    }else if(lowerCaseProductName.includes("licencia anual")){
        dateObj.setFullYear(dateObj.getFullYear() + 1);
    }

    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yearStr = dateObj.getFullYear();
    const hoursStr = String(dateObj.getHours()).padStart(2, '0');
    const minutesStr = String(dateObj.getMinutes()).padStart(2, '0');
    const secondsStr = String(dateObj.getSeconds()).padStart(2, '0');
    
    const expirationDate = `${dayStr}/${monthStr}/${yearStr} ${hoursStr}:${minutesStr}:${secondsStr}`;

    return expirationDate;
}