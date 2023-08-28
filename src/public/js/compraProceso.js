const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');
const product = urlParams.get('product').replace(" franciscososa.net", "").toLowerCase();

document.getElementById('mensaje-compra-enproceso').innerHTML = `No tienes que hacer nada, sólo queda esperar a que el medio de pago elegido procese tu pago.<br/>
Una vez finalizado, se te enviará la licencia y el detalle de la compra correspondiente a <b>${email}</b><br/><br/>
Ante cualquier duda o inconveniente no dudes en <a href="index.html#contacto">contactarnos</a>.`;