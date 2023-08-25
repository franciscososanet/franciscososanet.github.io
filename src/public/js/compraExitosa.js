const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');
const product = urlParams.get('product').replace(" franciscososa.net", "").toLowerCase();

document.getElementById('mensaje-compra-exitosa').innerHTML = `La clave de tu <b>${product}</b> te espera en <b>${email}</b> junto a los detalles de tu compra.<br/><br/>
Ante cualquier duda o inconveniente no dudes en <a href="index.html#contacto">contactarnos</a>.`;