const { Buffer } = require('node:buffer');
const fetch = require('node-fetch-commonjs');
const fs = require('fs');
const crypto = require('crypto');
const { BUSINESS_SHORT_CODE, TRANSACTION_TYPE, ACCESS_TOKEN_URL, KIBANDA_APP_USERNAME, KIBANDA_APP_PASSWORD, CONTENT_TYPE, AUTHORIZATION, ERR_ACCESS_TOKEN_FETCH, API_KEYPASS, STR_BASE64, STR_UTF8, TRANSACTION_DESCRIPTION, KIBANDA_CALLBACK_URL, INITIATOR_NAME, B2C_COMMAND_ID, B2C_PAYMENT_REMARKS, B2C_PAYMENT_OCCASION, B2C_SANDBOX_APP_PASSWORD, B2C_TimeOutURl_SANDBOX, B2C_ResultURl_SANDBOX } = require('../constants/api-strings');

const PaymentApi = class {

    static tokenExpiry = 0;
    static apiToken = '';
    BusinessShortCode = BUSINESS_SHORT_CODE;
    TransactionType = TRANSACTION_TYPE;
    PartyB = BUSINESS_SHORT_CODE;
    Password = '';
    Timestamp = '';
    Amount = 0;
    PartyA = "";
    PhoneNumber = "";
    CallBackURL = KIBANDA_CALLBACK_URL;
    AccountReference = '';
    TransactionDesc = TRANSACTION_DESCRIPTION;

    constructor(payee, amount) {
        const txTimeStamp = timeStampGenerate();
        this.PartyA = payee;
        this.PhoneNumber = payee;
        this.Amount = amount;
        this.Timestamp = txTimeStamp;
        this.Password = Buffer.from(BUSINESS_SHORT_CODE + API_KEYPASS + txTimeStamp).toString(STR_BASE64);
        this.AccountReference = Buffer.from(txTimeStamp).toString(STR_BASE64).slice(5);
    }

}

const B2CPaymentApi = class {

    // TODO: Change this to reflect the api format for b2c
    static tokenExpiry = 0;
    static apiToken = '';
    InitiatorName = INITIATOR_NAME;
    SecurityCredential = '';
    CommandID = B2C_COMMAND_ID;
    Amount = 0;
    PartyA = BUSINESS_SHORT_CODE;
    PartyB = "";
    Remarks = B2C_PAYMENT_REMARKS;
    QueueTimeOutURL = B2C_TimeOutURl_SANDBOX;
    ResultURL = B2C_ResultURl_SANDBOX;
    Occassion = B2C_PAYMENT_OCCASION
    Timestamp = '';
    TransactionDesc = TRANSACTION_DESCRIPTION;

    constructor(payee, amount) {
        this.PartyB = payee;
        this.Amount = amount;
        this.SecurityCredential = b2cSecurityCredential()
    }

}

const timeStampGenerate = () => {
    let date = new Date();;
    return date.getFullYear() + ("0" + (date.getMonth() + 0)).slice(-2) + ("0" + (date.getDate() + 0)).slice(-2) + ("0" + (date.getHours() + 0)).slice(-2) + date.getMinutes() + ("0" + (date.getSeconds() + 0)).slice(-2);;
}

const accessToken = async () => {
    const tokenUrl = ACCESS_TOKEN_URL;
    const currentTime = Date.now();
    if (PaymentApi.tokenExpiry == 0 || PaymentApi.apiToken == '' || currentTime > this.tokenExpiry) {
        let buffer = Buffer.from(`${KIBANDA_APP_USERNAME}:${KIBANDA_APP_PASSWORD}`);
        const headers = new fetch.Headers();
        headers.append(CONTENT_TYPE, "application/json");
        headers.append(AUTHORIZATION, `Basic ${buffer.toString(STR_BASE64)}`);
        try {
            const result = await fetch(tokenUrl, {
                method: 'GET',
                headers,
                body: null,
            });
            if (result.ok) {
                const response = await result.json();
                PaymentApi.apiToken = response.access_token;
                //set expiry duration 100 seconds before MPESA API does it
                PaymentApi.tokenExpiry = currentTime + (response.expires_in - 100);
                return PaymentApi.apiToken;
            } else {
                throw new Error(`${ERR_ACCESS_TOKEN_FETCH}: ${result}`);
            }
        } catch (error) {
            throw new Error(`Fatal: ${error}`)
        }
    } else {
        console.log(`Reused token: ${PaymentApi.apiToken}`);
        return PaymentApi.apiToken;
    }
}

const b2cSecurityCredential = async () => {
    const unencryptedPassword = process.env.B2C_SANDBOX_PASSWORD
    try {
        const pub_key_cert = fs.readFileSync('./SandboxCertificate.cer', STR_UTF8);
        const pub_key_obj = crypto.createPublicKey(pub_key_cert)
        const encryptedPassStr = crypto.publicEncrypt({
            key: pub_key_obj,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, Buffer.from(unencryptedPassword, STR_UTF8));
        const encryptedPassString = encryptedPassStr.toString(STR_BASE64);
        // console.log(`security credential: ${encryptedPassString}`);
        return encryptedPassString
    } catch (err) {
        console.error(err)
        return false
    }
}

module.exports = { PaymentApi: PaymentApi, accessToken , B2CPaymentApi: B2CPaymentApi};