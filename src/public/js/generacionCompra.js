const emailInput = document.getElementById('email');
const paypalOption = document.getElementById('paypal');
const mercadoPagoOption = document.getElementById('mercadopago');
const checkoutButton = document.getElementById('checkout');

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

function isEmailValid(email) {
    return emailRegex.test(email);
}

// Verificar que los campos sean validos
function checkFormValidity(){
    if (isEmailValid(emailInput.value) && (paypalOption.checked || mercadoPagoOption.checked)) {
        checkoutButton.removeAttribute('disabled');
    } else {
        checkoutButton.setAttribute('disabled', 'true');
    }
}

emailInput.addEventListener('input', checkFormValidity);
paypalOption.addEventListener('change', checkFormValidity);
mercadoPagoOption.addEventListener('change', checkFormValidity);


checkFormValidity();

const checkout = document.getElementById('checkout');

checkout.addEventListener('click', async (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe automáticamente

    const paypalOption = document.getElementById('paypal');
    const mercadoPagoOption = document.getElementById('mercadopago');

    if (paypalOption.checked) {
        alert('Hola PayPal');
    } else if (mercadoPagoOption.checked) {
        const response = await fetch('/create-order', {
            method: 'POST'
        });
        const data = await response.json();
        console.log(data);
        window.location.href = data.init_point;
    } else {
        // En caso de que no se haya seleccionado ninguna opción (aunque esto no debería suceder debido al atributo "required")
        alert('Por favor, selecciona un método de pago.');
    }
});