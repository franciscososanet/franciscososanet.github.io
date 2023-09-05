function fetchProductPrice(productName, callback) {
    fetch(`/api/getPrice?product=${productName}`)
        .then(response => response.json())
        .then(data => {
            callback(data.price);
        });
}

function formatNumber(num){
    let parts = num.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
}

function parseFormattedNumber(str) {
    return parseFloat(str.replace(".", "").replace(",", "."));
}


function updateSubtotal(price, modal){

    const paragraphs = Array.from(modal.querySelectorAll('p'));
    const subtotalParagraph = paragraphs.find(p => p.textContent.includes('Subtotal:'));
    
    if(subtotalParagraph){
        const subtotalSpan = subtotalParagraph.querySelector('span');
        if(subtotalSpan){
            const formattedPrice = `${formatNumber(price)}`;
            subtotalSpan.textContent = formattedPrice;
        }
    }
}

function updateIVA(price, modal){

    const IVA_RATE = 0.21;  // Tasa del IVA: 21%
    const ivaAmount = price * IVA_RATE;

    const paragraphs = Array.from(modal.querySelectorAll('p'));
    const ivaParagraph = paragraphs.find(p => p.textContent.includes('Impuesto IVA: 21%'));
    if(ivaParagraph){
        const ivaSpan = ivaParagraph.querySelector('span');
        if(ivaSpan){
            const formattedIVA = `${formatNumber(ivaAmount)}`;
            ivaSpan.textContent = formattedIVA;
        }
    }
}


function updatePaymentTax(modal){

    const paragraphs = Array.from(modal.querySelectorAll('p'));

    const subtotalParagraph = paragraphs.find(p => p.textContent.includes('Subtotal:'));
    const subtotalSpan = subtotalParagraph ? subtotalParagraph.querySelector('span') : null;
    const subtotal = subtotalSpan ? parseFormattedNumber(subtotalSpan.textContent.replace('$', '')) : 0;
    
    const paymentMethodRadio = modal.querySelector('input[name="paymentMethod"]:checked');
    
    const ivaParagraphIndex = paragraphs.findIndex(p => p.textContent.includes('Impuesto IVA: 21%'));
    const paymentTaxParagraph = ivaParagraphIndex >= 0 && paragraphs[ivaParagraphIndex + 1];
    
    let taxRate, taxName;

    if(paymentMethodRadio){
        switch(paymentMethodRadio.value) {
            case 'paypal':
                taxRate = 0.04;  //4% PayPal
                taxName = 'PayPal';
                break;
            case 'mercadopago':
                taxRate = 0.07;  //7% MercadoPago
                taxName = 'MercadoPago';
                break;
            default:
                return;
        }
    }

    if(paymentTaxParagraph && taxRate){
        const taxAmount = subtotal * taxRate;
        const formattedTax = `${formatNumber(taxAmount)}`;
        paymentTaxParagraph.innerHTML = `Impuesto ${taxName}: ${Math.round(taxRate * 100)}% <span>${formattedTax}</span>`;
    }
}

function updatePromotionalDiscount(price, modal, licenseType){

    let discountRate = 0;

    if(licenseType === "Anual"){  
        discountRate = 0.25; // 25%
    }else if (licenseType === "Semestral"){
        discountRate = 0.15; // 15%
    }

    if(discountRate > 0){
        
        const discountAmount = price * discountRate;

        const paragraphs = Array.from(modal.querySelectorAll('p'));
        const discountParagraph = paragraphs.find(p => p.textContent.includes('Descuento promocional'));

        if(discountParagraph){

            discountParagraph.firstChild.textContent = `Descuento promocional: ${discountRate * 100}% `;
            const discountSpan = discountParagraph.querySelector('span');
            if(discountSpan){
                const formattedDiscount = `-${formatNumber(discountAmount)}`;
                discountSpan.textContent = formattedDiscount;
            }
        }
    }
}

function calculateTotal(modal){

    const paragraphs = Array.from(modal.querySelectorAll('p'));

    const getSpanFromParagraph = (text) => {
        const paragraph = paragraphs.find(p => p.textContent.includes(text));
        return paragraph ? paragraph.querySelector('span') : null;
    };

    const subtotalSpan = getSpanFromParagraph("Subtotal:");
    const ivaSpan = getSpanFromParagraph("Impuesto IVA:");
    const paymentTaxSpan = getSpanFromParagraph("Impuesto PayPal:") || getSpanFromParagraph("Impuesto MercadoPago:");
    const discountSpan = getSpanFromParagraph("Descuento promocional:");
    const totalSpan = getSpanFromParagraph("Total:");

    const parsePrice = (span) => span ? parseFormattedNumber(span.textContent.replace(/[^0-9.,-]+/g,"")) : 0;

    const subtotal = parsePrice(subtotalSpan);
    const iva = parsePrice(ivaSpan);
    const paymentTax = parsePrice(paymentTaxSpan);
    const discount = parsePrice(discountSpan);

    const total = subtotal + iva + paymentTax + discount;

    if(totalSpan){
        totalSpan.textContent = `AR$${formatNumber(total)}`;
    }
}


// Calcular valores cuando se abre un modal o modifica un valor
document.querySelectorAll('.services__button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();

        let licenseType = e.target.parentElement.querySelector('.section__title').innerText;
        console.log("License Type:", licenseType);

        const modalType = e.target.getAttribute('data-modal');
        const modal = document.querySelector(`.services__modal[data-modal="${modalType}"]`);

        fetchProductPrice(licenseType, (price) => {
            updateSubtotal(price, modal);
            updateIVA(price, modal);
            updatePaymentTax(modal);
            updatePromotionalDiscount(price, modal, licenseType);
            calculateTotal(modal);
        });
    });
});

// Actualizar impuesto cada vez que cambia el método de pago
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const modal = e.target.closest('.services__modal-content');
        updatePaymentTax(modal);
    });
});
