const crypto = require('crypto');
const {CIPHER_ALGORITHM, STR_BASE64, STR_UTF8} = require('../constants/api-strings');


const iv = crypto.randomBytes(16);
const key = crypto.randomBytes(32);
const cipher = (phrase) => {
    const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);
    const cipherBuffer = cipher.update(phrase);
    const encrypted = Buffer.concat([cipherBuffer, cipher.final()]).toString(STR_BASE64);
    return {key, encrypted };
}

const decipher = (encypted) => {
    const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv);
    let decrypted = decipher.update(encypted, STR_BASE64, STR_UTF8);
    decrypted += decipher.final(STR_UTF8);
    console.log(`deciphered: ${decrypted}`);
}

module.exports = {cipher, decipher};