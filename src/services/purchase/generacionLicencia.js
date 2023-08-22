import License from "../../models/license.model.js";

export default async function generateUniqueLicenseKey(){

    let licenseKey;
    let licenseExists = true;

    while(licenseExists){
        licenseKey = generateLicenseKey();
        licenseExists = await License.findOne({ licenseKey });
    }

    return licenseKey;
}

function generateLicenseKey(){

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let license = '';

    for(let i = 0; i < 16; i++){

        if(i > 0 && i % 4 === 0){
            license += '-';
        }

        const randomIndex = Math.floor(Math.random() * chars.length);
        license += chars[randomIndex];
    }
    return license;
}