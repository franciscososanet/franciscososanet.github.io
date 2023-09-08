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

function updateSubtotal(price, modal, paymentMethod){

    const paragraphs = Array.from(modal.querySelectorAll('p'));
    const subtotalParagraph = paragraphs.find(p => p.textContent.includes('Subtotal:'));
    
    if(subtotalParagraph){
        const subtotalSpan = subtotalParagraph.querySelector('span');
        const priceToUse = paymentMethod === 'mercadopago' ? price.peso : price.dolar;
        const formattedPrice = `${formatNumber(priceToUse)}`;
        subtotalSpan.textContent = formattedPrice;
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
                taxRate = 0.04; //4% PayPal
                taxName = 'PayPal';
                break;
            case 'mercadopago':
                taxRate = 0.07; //7% MercadoPago
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

    const paymentMethodRadio = modal.querySelector('input[name="paymentMethod"]:checked');
    const currencySymbol = paymentMethodRadio && paymentMethodRadio.value === 'paypal' ? 'USD' : 'AR';

    if(totalSpan){
        totalSpan.textContent = `${currencySymbol}$${formatNumber(total)}`;
    }
}

document.querySelectorAll('.services__button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();

        let licenseType = e.target.parentElement.querySelector('.section__title').innerText;

        const modalType = e.target.getAttribute('data-modal');
        const modal = document.querySelector(`.services__modal[data-modal="${modalType}"]`);

        const paymentMethodRadio = modal.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : 'mercadopago'; // Default to 'mercadopago' if none is selected.

        fetchProductPrice(licenseType, (price) => {
            const priceToUse = paymentMethod === 'mercadopago' ? price.peso : price.dolar;
            updateSubtotal(price, modal, paymentMethod);
            updateIVA(priceToUse, modal);
            updatePaymentTax(modal);
            updatePromotionalDiscount(priceToUse, modal, licenseType);
            calculateTotal(modal);
        });
    });
});

document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {

    radio.addEventListener('change', (e) => {
        const modal = e.target.closest('.services__modal-content');
        const paymentMethod = e.target.value;
        
        const modalId = modal.parentElement.getAttribute('data-modal');
        const planElement = document.querySelector(`.plan[data-modal-id="${modalId}"]`);

        if(planElement){
            
            const licenseType = planElement.querySelector('.section__title').innerText;
            
            fetchProductPrice(licenseType, (price) => {
                const priceToUse = paymentMethod === 'mercadopago' ? price.peso : price.dolar;
                updateSubtotal(price, modal, paymentMethod);
                updateIVA(priceToUse, modal);
                updatePaymentTax(modal);
                updatePromotionalDiscount(priceToUse, modal, licenseType);
                calculateTotal(modal);
            });
        }else{
            console.error("No se encontró el elemento de plan correspondiente.");
        }
    });
});