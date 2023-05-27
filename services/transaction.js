const fetch = require('node-fetch-commonjs');
const url = require('url');
const account = require('../database/account');
const transaction = require('../database/transaction');
const {PaymentApi, accessToken } = require('../utils/payment-api');

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
                passphrase: "Fh6rEYRFK99QdAM" ,
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

module.exports = { processTransaction, transfer };