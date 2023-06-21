const crypto = require('crypto');
const {CIPHER_ALGORITHM, STR_BASE64, STR_UTF8, STR_HEX} = require('../constants/api-strings');


const iv = crypto.randomBytes(16);
const key = crypto.randomBytes(32);
const cipher = (phrase) => {
    const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, Buffer.from(key), iv);
    const cipherBuffer = cipher.update(phrase);
    const encrypted = Buffer.concat([cipherBuffer, cipher.final()]).toString(STR_HEX);
    return {iv, key, encrypted };
}

const decipher = (encypted) => {
    // const stored_iv = Buffer.from(encypted.iv, STR_BASE64);
    // const key_in_bytes = Buffer.from(savedKey, STR_HEX);
    // const iv_in_bytes = Buffer.from(savedIv, STR_HEX)
    // const encrypted_in_bytes = Buffer.from(encypted, STR_HEX)
    const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, Buffer.from(key), iv);
    let decrypted = decipher.update(encypted, STR_BASE64, STR_UTF8);
    decrypted += decipher.final(STR_UTF8);
    // console.log(`deciphered: ${decrypted}`);
}

module.exports = {cipher, decipher};