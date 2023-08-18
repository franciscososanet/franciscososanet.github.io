import mercadopago from "mercadopago";
import { MERCADOPAGO_API_KEY} from "../mercadopago/mercadopago.config.js";
import { HOST } from '../../config.js'
import Transaction from "../../models/transaction.model.js";
import sendEmail from "../../public/js/enviarMail.js";

let _email = null;

export const createOrder = async(req, res) => {

    mercadopago.configure({
        access_token: MERCADOPAGO_API_KEY
    });
    
    const email = req.body.email; //Obtener el email desde el cuerpo de la solicitud
    const product = req.body.product; //Obtener el producto desde el cuerpo de la solicitud

    _email = email;

    let item;

    switch (product){
        case 'checkoutMensual':
            item = {
                title: "Licencia mensual franciscososa.net",
                unit_price: 5,
                currency_id: "ARS",
                quantity: 1
            };
            break;
        case 'checkoutSemestral':
            item = {
                title: "Licencia semestral franciscososa.net",
                unit_price: 10,
                currency_id: "ARS",
                quantity: 1
            };
            break;
        case 'checkoutAnual':
            item = {
                title: "Licencia anual franciscososa.net",
                unit_price: 20,
                currency_id: "ARS",
                quantity: 1
            };
            break;
        default:
            return res.status(400).send('Producto no válido');
    }

    const result = await mercadopago.preferences.create({
        items: [item], //Producto seleccionado
        back_urls: {
            success: `${HOST}/success`,
            failure: `${HOST}/licencias.html`,
            pending: `${HOST}/pending`
        },
        notification_url:  "https://ea24-2800-810-548-6dd-19f5-bc2-30c9-5cca.ngrok.io/webhook",
    });

    res.send(result.body);
}

export const receiveWebhook = async(req, res) => {

    const payment = req.query;

    try{
        if(payment.type === "payment"){

            const data = await mercadopago.payment.findById(payment['data.id']);

            if(data.body.status === "approved"){

                console.log("Pago aprobado"); // Procesar pagos aprobados

                const newTransaction = new Transaction({

                    transactionId: data.body.id,
                    platform: 'mercadopago',
                    purchaseDate: formatPurchaseDate(data.body.date_created),
                    currency: data.body.currency_id,
                    buyer: {
                        firstName: data.body.payer.first_name || 'N/A',
                        lastName: data.body.payer.last_name || 'N/A',
                        email: data.body.payer.email || 'N/A',
                        phoneNumber: data.body.payer.phone.number || 'N/A',
                        id: data.body.payer.id,
                        ip: data.body.payer.ip || 'N/A',
                    },
                    product: {
                        name: data.body.description,
                        description: '',
                        productId: data.body.order.id,
                        price: data.body.transaction_amount,
                        currency: data.body.currency_id,
                        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    },
                    status: data.body.status,
                    paymentMethod: data.body.payment_type_id,
                    paymentDetails: {
                        transactionNumber: data.body.id,
                    }
                });

                await newTransaction.save();
                console.log('Transacción guardada con éxito en la base de datos');

                //Enviar correo electronico al comprador
                try{
                    await sendEmail(_email, newTransaction);
                }catch (error) {
                    console.log(error);
                    // return res.sendStatus(500).json({error: error.message });
                }

            }else if(data.body.status === "rejected"){ //Procesar pagos rechazados
                console.log("Pago rechazado");
            }else if( data.body.status === 'in_process'){
                console.log("Pago en proceso");
            }else if(data.body.status === 'undefined'){
                console.log("data.body.status = undefined");
            }else{ //Procesar otros estados de pago
                console.log("Estado de pago no reconocido:", data.body.status);
            }

        }else if(payment.type === "merchant_order"){ //Procesar webhooks de tipo merchant_order
            console.log("Webhook de tipo merchant_order recibido");
        }else{//Procesar otros tipos de webhooks
            console.log("Tipo de webhook no reconocido:", payment.type);
        }

    } catch(error){
        console.log(error);
        // return res.sendStatus(500).json({error: error.message });
    }
}

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