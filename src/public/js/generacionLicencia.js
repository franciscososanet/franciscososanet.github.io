export default function generateLicenseKey(){

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let license = '';

    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            license += '-';
        }
        const randomIndex = Math.floor(Math.random() * chars.length);
        license += chars[randomIndex];
    }
    return license;
}
