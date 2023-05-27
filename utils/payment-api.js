const { Buffer } = require('node:buffer');
const fetch = require('node-fetch-commonjs');
const { BUSINESS_SHORT_CODE, TRANSACTION_TYPE, ACCESS_TOKEN_URL, KIBANDA_APP_USERNAME, KIBANDA_APP_PASSWORD, CONTENT_TYPE, AUTHORIZATION, ERR_ACCESS_TOKEN_FETCH, API_KEYPASS, STR_BASE64, TRANSACTION_DESCRIPTION } = require('../constants/api-strings');

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
    CallBackURL = '';
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

const timeStampGenerate = () => {
    let date = new Date();;
    return date.getFullYear() + ("0" + (date.getMonth() + 0)).slice(-2) + ("0" + (date.getDate() + 0)).slice(-2) + ("0" + (date.getHours() + 0)).slice(-2) + date.getMinutes() + ("0" + (date.getSeconds() + 0)).slice(-2);;
}

const accessToken = async () => {
    const tokenUrl = ACCESS_TOKEN_URL;
    const currentTime = Date.now();
    if (PaymentApi.tokenExpiry == 0 || PaymentApi.apiToken == '' || currentTime > this.tokenExpiry) {
        let buffer = Buffer.from(`${KIBANDA_APP_USERNAME}:${KIBANDA_APP_PASSWORD}`);
        const headers = new Headers();
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




module.exports = { PaymentApi: PaymentApi, accessToken };