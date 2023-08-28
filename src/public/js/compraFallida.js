const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');
const product = urlParams.get('product').replace(" franciscososa.net", "").toLowerCase();

document.getElementById('mensaje-compra-rechazada').innerHTML = `Ocurrió algún error al querer procesar tu pago. Asegúrate de tener el monto suficiente para comprar tu <b>${product}</b>.<br/><br/>
Puedes intentar nuevamente la compra <a href="licencias.html">desde este enlace</a><br/><br/>
Ante cualquier duda o inconveniente no dudes en <a href="index.html#contacto">contactarnos</a>.`;