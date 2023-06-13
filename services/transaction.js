const fetch = require('node-fetch-commonjs');
const url = require('url');
const { TRANSACTION_TYPE } = require('../constants/api-strings');
const account = require('../database/account');
const keyManage = require('../database/key-manage');
const transaction = require('../database/transaction');
const {PaymentApi, B2CPaymentApi, accessToken } = require('../utils/payment-api');
const {decipher} = require('../utils/secure-storage');


const callbackString = process.env.MPESA_API_CALLBACK;

let targetAcc = null;


const processTransaction = async (transactionDetails) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + await accessToken());
    const { userUuid, assetType, tokenQuantity, paymentAmount } = transactionDetails;

    //get this user account ready for transaction
    try {
        targetAcc = await account.findOne({ uuid: userUuid }).exec();
        console.log(` Buyer Account: ${targetAcc}`);
    } catch (error) {
        console.log(`Error getting user ccount for tx`);
    }
    let paymentApi = new PaymentApi(targetAcc.phoneNumber, transactionDetails.paymentAmount);

    //save the transaction
    let added = null;
    try {
        added = await transaction.create({
            account: userUuid,
            assetType: assetType,
            quantity: tokenQuantity,
            paymentAmount: paymentAmount,
        });

        paymentApi.CallBackURL = `${callbackString}/transfer?save_id=${added._id}&account=${targetAcc.wallet.id}`;
        console.log(paymentApi.CallBackURL);
        // const txBody = {
        //     ...transactionDetails,
        //     paymentRequest: PaymentRequest,
        // };
        const paymentRequestData = await requestPayment(headers, paymentApi);
        if (paymentRequestData) {
            return paymentRequestData;
        } else {
            throw new Error('Some error occurred in payment processing...')
        }
    } catch (error) {
        console.log(error);
    }

}

//MPESA payment request with callback
const requestPayment = async (headers, paymentRequest) => {
    try {
        const payRequestResponse = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                method: 'POST',
                headers,
                body: JSON.stringify(paymentRequest),
            }
        );

        const data = await payRequestResponse.json();
        if (payRequestResponse.ok) {
            return data;
        } else {
            console.log(`Error: ${payRequestResponse.status}`);
            throw new Error(
                `Payment request failed. ${JSON.stringify(data)}.`
            );
        }
    } catch (error) {
        console.log(error);
    }
};

//MPESA B2C payment 
const requestB2CPayment = async (headers, paymentRequest) => {
    try {
        const payRequestResponse = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest', 
            {
                method: 'POST',
                headers,
                body: JSON.stringify(paymentRequest),
            }
        );

        const data = await payRequestResponse.json();
        if (payRequestResponse.ok) {
            return data;
        } else {
            console.log(`Error: ${payRequestResponse.status}`);
            throw new Error(
                `Payment request failed. ${JSON.stringify(data)}.`
            );
        }
    } catch (error) {
        console.log(error);
    }
};


/**
 * Complete transfer of asset after user payment confirmed.
 * @param {*} transactionId 
 * @returns 
 */
const transfer = async (request) => {
    const transactionId = url.parse(request.url, true).query.save_id;
    const walletName = url.parse(request.url, true).query.account;
    let paymentConfirmation = request.body;
    const result = await transaction.findByIdAndUpdate(transactionId, {paymentConfirmation: paymentConfirmation}, {new: true});
    console.log(`transaction saved was: ${result}`);
    const walletUrl = `${process.env.WALLET_SERVER}/wallets/${walletName}`;
    let assetData;
    let data = null;
    try {
        //check if a transaction matching the body details is saved in the database
        assetData = await transaction.findOne({ _id: transactionId }).exec();
        if (!assetData) {
            throw new Error(`Transaction with id ${transactionId} not found`);
        }
    } catch (error) {
        console.log(error);
    }
    //get address from wallet
    let response = await fetch(`${walletUrl}/addresses`);
    if (response.ok) {
        data = await response.json();
        console.log(`wallet addresses: ${JSON.stringify(data)}`);
    }
    else {
        throw new Error(`Error fetching address`)
    }
    const address = data[0].id;

    const { quantity } = assetData;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const details = {
        payments: [
            {
                address: address,
                amount: { quantity: parseFloat(quantity), unit: "lovelace" },
            },
        ],
    };
    try {
        let response = await fetch(`http://127.0.0.1:8090/v2/wallets/${process.env.MASTER_WALLET}/transactions-construct`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(details),
        });
        if (response.ok) {
            data = await response.json();
            console.log(`Unsigned tx: ${data.transaction}`);
        } else {
            throw new Error(
                `Transaction construction error: ${JSON.stringify(await response.json())}`
            );
        }
    } catch (error) {
        console.log(error);
    }
    try {
        //fetch and decrypt password for this wallet account

        const response = await fetch(`http://127.0.0.1:8090/v2/wallets/${process.env.MASTER_WALLET}/transactions-sign`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                passphrase: process.env.MW_KEY,
                transaction: data.transaction,
            }),
        });
        if (response.ok) {
            data = await response.json();
        } else {
            throw new Error(
                `Transaction sign error: ${JSON.stringify(response.status)}`
            );
        }
    } catch (error) {
        console.log(error);
    }
    try {
        response = await fetch(`http://127.0.0.1:8090/v2/wallets/${process.env.MASTER_WALLET}/transactions-submit`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ transaction: data.transaction }),
        });
        if (response.ok) {
            data = await response.json();
            console.log(`Success! Transaction id: ${data}`);
        } else {
            throw new Error(
                `Transaction submit error: ${JSON.stringify(response.status)}`
            );
        }
    } catch (error) {
        console.log(error);
    }
    return data;
};

const processPayment =  async (paymentDetails) => {

    const { userUuid, assetType, tokenQuantity, paymentAmount, exchangeRate, payee } = paymentDetails;
    payerAcc = null

    //get this user account ready for transaction
    try {
        payerAcc = await account.findOne({ uuid: userUuid }).exec();
        console.log(` Payer Account: ${payerAcc}`);
    } catch (error) {
        console.log(`Error getting user ccount for tx`);
    }

    // This transfers the asset from user wallet to main wallet
    // TODO: Breakdown this to do the reverse of transfer
    // const result = await transfer(request);
    const { quantity } = tokenQuantity;
    const payerAccWallet = payerAcc.wallet

    const walletUrl = `${process.env.WALLET_SERVER}/wallets/${payerAccWallet.name}`;

    data = null
    //get payer address from wallet
    let response = await fetch(`${walletUrl}/addresses`);
    if (response.ok) {
        data = await response.json();
        console.log(`wallet addresses: ${JSON.stringify(data)}`);
    }
    else {
        throw new Error(`Error fetching address`)
    }
    const payerAddress = data[0].id;

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const details = {
        payments: [
            {
                address: payerAddress,
                amount: { quantity: parseFloat(quantity), unit: "lovelace" },
            },
        ],
    };
    try {
        let response = await fetch(`http://127.0.0.1:8090/v2/wallets/${payerAccWallet}/transactions-construct`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(details),
        });
        if (response.ok) {
            data = await response.json();
            console.log(`Unsigned tx: ${data.transaction}`);
        } else {
            throw new Error(
                `Transaction construction error: ${JSON.stringify(await response.json())}`
            );
        }
    } catch (error) {
        console.log(error);
    }
    try {
        //fetch and decrypt password for this wallet account
        // with uuid for user get keymanage entry with that and get the encrypted passphrase
        payerKey = null
        payerDecryptedWalletKey = null
        try {
            payerKey = await keyManage.findOne({ owner: userUuid }).exec();
            console.log(` Payer Account: ${payerAcc}`);
        } catch (error) {
            console.log(`Error getting user key for tx`);
        }
        payerWalletEncryptedKey = payerKey.seed
        payerDecryptedWalletKey = decipher(payerWalletEncryptedKey)

        const response = await fetch(`http://127.0.0.1:8090/v2/wallets/${payerAccWallet}/transactions-sign`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                passphrase: payerDecryptedWalletKey,
                transaction: data.transaction,
            }),
        });
        if (response.ok) {
            data = await response.json();
        } else {
            throw new Error(
                `Transaction sign error: ${JSON.stringify(response.status)}`
            );
        }
    } catch (error) {
        console.log(error);
    }
    try {
        response = await fetch(`http://127.0.0.1:8090/v2/wallets/${payerAccWallet}/transactions-submit`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ transaction: data.transaction }),
        });
        if (response.ok) {
            data = await response.json();
            console.log(`Success! Transaction id: ${data}`);

            // This is the beginning of the mpesa transaction
            const headersMpesa = new Headers();
            headersMpesa.append("Content-Type", "application/json");
            headersMpesa.append("Authorization", "Bearer " + await accessToken());

            let paymentApi = new B2CPaymentApi(paymentDetails.payee, paymentDetails.paymentAmount);

            // const paymentAmount = tokenQuantity * exchangeRate

            //save the transaction
            let added = null;
            try {
                added = await transaction.create({
                    account: userUuid,
                    assetType: assetType,
                    quantity: tokenQuantity,
                    paymentAmount: paymentAmount,
                    transactionType: TRANSACTION_CATEGORY.PAYMENT,
                });

                // paymentApi.CallBackURL = `${callbackString}/transfer?save_id=${added._id}&account=${targetAcc.wallet.id}`;
                // console.log(paymentApi.CallBackURL);
                // const txBody = {
                //     ...transactionDetails,
                //     paymentRequest: PaymentRequest,
                // };
                const paymentRequestData = await requestB2CPayment(headersMpesa, paymentApi);
                if (paymentRequestData) {
                    return paymentRequestData;
                } else {
                    throw new Error('Some error occurred in payment processing...')
                }
            } catch (error) {
                console.log(error);
            }

        } else {
            throw new Error(
                `Transaction submit error: ${JSON.stringify(response.status)}`
            );
        }
    } catch (error) {
        console.log(error);
    }

    if (result.ok){

        
    }

    
}


const testB2CPayment =  async () => {
    // This is the beginning of the mpesa transaction
    const headersMpesa = new fetch.Headers();
    headersMpesa.append("Content-Type", "application/json");
    headersMpesa.append("Authorization", "Bearer " + await accessToken());

    let paymentApi = new B2CPaymentApi(254702262663, 10);

    // const paymentAmount = tokenQuantity * exchangeRate

    //save the transaction
    let added = null;
    try {
        // added = await transaction.create({
        //     account: userUuid,
        //     assetType: assetType,
        //     quantity: tokenQuantity,
        //     paymentAmount: paymentAmount,
        //     transactionType: TRANSACTION_CATEGORY.PAYMENT,
        // });

        // paymentApi.CallBackURL = `${callbackString}/transfer?save_id=${added._id}&account=${targetAcc.wallet.id}`;
        // console.log(paymentApi.CallBackURL);
        // const txBody = {
        //     ...transactionDetails,
        //     paymentRequest: PaymentRequest,
        // };
        const paymentRequestData = await requestB2CPayment(headersMpesa, paymentApi);
        if (paymentRequestData) {
            console.log(paymentRequestData)
            return paymentRequestData;
        } else {
            throw new Error('Some error occurred in payment processing...')
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { processTransaction, transfer };