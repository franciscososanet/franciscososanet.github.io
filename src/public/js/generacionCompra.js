const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

function isEmailValid(email) {
    return emailRegex.test(email);
}

//Verificar que los campos sean válidos
function checkFormValidity(event){
    const modal = event.target.closest('.services__modal');
    const emailInput = modal.querySelector('input[type="email"]');
    const paypalOption = modal.querySelector('input[value="paypal"]');
    const mercadoPagoOption = modal.querySelector('input[value="mercadopago"]');
    const checkoutButton = modal.querySelector('button[data-product]');

    if(isEmailValid(emailInput.value) && (paypalOption.checked || mercadoPagoOption.checked)){
        checkoutButton.removeAttribute('disabled');
    }else{
        checkoutButton.setAttribute('disabled', 'true');
    }
}

async function handleCheckout(event) {
    event.preventDefault(); // Evitar que el formulario se envíe automáticamente

    const modal = event.target.closest('.services__modal');
    const emailInput = modal.querySelector('input[type="email"]');
    const paypalOption = modal.querySelector('input[value="paypal"]');
    const mercadoPagoOption = modal.querySelector('input[value="mercadopago"]');
    const product = event.target.getAttribute('data-product'); // Obtener el producto seleccionado

    if (paypalOption.checked) {
        const response = await fetch('/paypal/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product, email: emailInput.value }) // Enviar el producto seleccionado al servidor
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            alert('Error: ' + errorMessage);
            return;
        }

        const data = await response.json();
        window.location.href = data.links[1].href; // Redirigir al usuario a la URL de PayPal

    } else if (mercadoPagoOption.checked) {
        const response = await fetch('/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product, email: emailInput.value }) // Enviar el producto seleccionado al servidor
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            alert('Error: ' + errorMessage);
            return;
        }

        const data = await response.json();
        console.log(data);
        window.location.href = data.init_point;

    } else {
        alert('Por favor, selecciona un método de pago.');
    }
}

//Controladores de eventos a los elementos correspondientes
document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('input', checkFormValidity);
});

document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
    input.addEventListener('change', checkFormValidity);
});

document.querySelectorAll('button[data-product]').forEach(button => {
    button.addEventListener('click', handleCheckout);
});
