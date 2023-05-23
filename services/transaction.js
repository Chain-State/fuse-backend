const fetch = require('node-fetch-commonjs');
const url = require('url');
const account = require('../database/account');
const transaction = require('../database/transaction');

const callbackString = 'https://webhook.site/821f791e-482e-4d22-82a6-740187179fd9';
const MPESA_AUTH_TOKEN = 'DZtjazjxgVZ2A5vuJbTgcKFCBJFX';
const CW_SERVER = 'http://127.0.0.1:8090/v2/wallets/';
const PaymentRequest = {
    BusinessShortCode: 174379,
    Password: "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMwNDEwMTQxMTI3",
    Timestamp: "20230410141127",
    TransactionType: "CustomerPayBillOnline",
    Amount: 1,
    PartyA: 254726367035,
    PartyB: 174379,
    PhoneNumber: 254726367035,
    CallBackURL: '',
    AccountReference: "AKJD92F",
    TransactionDesc: "B-600ADA"
}

let targetAcc = null;

const processTransaction = async (transactionDetails) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + MPESA_AUTH_TOKEN);
    const { userUuid, assetType, tokenQuantity, paymentAmount } = transactionDetails;

    //get this user account ready for transaction
    try {
        targetAcc = await account.findOne({ uuid: userUuid }).exec();
    } catch (error) {
        console.log(`Error getting user ccount for tx`);
    }

    //save the transaction
    let added = null;
    try {
        added = await transaction.create({
            account: userUuid,
            assetType: assetType,
            quantity: tokenQuantity,
            paymentAmount: paymentAmount,
        });

        PaymentRequest.CallBackURL = callbackString + "?save_id=" + added._id + "?account=" + targetAcc.wallet.walletName;
        // const txBody = {
        //     ...transactionDetails,
        //     paymentRequest: PaymentRequest,
        // };
        const paymentRequestData = await requestPayment(headers, PaymentRequest);
        if (paymentRequestData) {
            //save this payment response
            response.json(paymentRequestData);
        } else {
            throw new Error('Some error occurred in payment processing...')
        }
    } catch (error) {
        console.log(`Transaction failed: ${error}`);
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
        if (payRequestResponse.ok) {
            const data = await payRequestResponse.json();
            console.log(`From request: ${JSON.stringify(data)}`);
            return data;
        } else {
            const data = await payRequestResponse.json();
            console.log(`Error: ${payRequestResponse.status}`);
            throw new Error(
                `Payment request failed. ${JSON.stringify(data)}.`
            );
        }
    } catch (error) {
        console.log(`${error}`);
    }
};


/**
 * Complete transfer of asset after user payment confirmed.
 * @param {*} transactionId 
 * @returns 
 */
const transfer = async () => {
    const transactionId = url.parse(request.url, true).query.save_id;
    const walletName = url.parse(request.url, true).query.account;
    let paymentConfirmation = request.body;
    paymentConfirmation = {
        transactionId: transactionId,
        ...paymentConfirmation,
    };
    //save this response 

    console.log(`transactionId=${transactionId}`);
    //get the wallet for this user
    // try{
    //     walletName = await account.findOne({'wallet.name': transactionId}, 'name').exec();
    // } catch(error) {
    //     console.log(`Fatal: ${wallet}`);
    // }
    if (!walletName) {
        throw new Error(`Could not find the wallet with id: ${walletName}`)
    }
    const walletUrl = CW_SERVER + walletName;
    let assetData;
    let data = null;
    try {
        //check if a transaction matching the body details is saved in the database
        assetData = await transaction.findOne({ account: transactionId });
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
        console.log(`wallet addresses: ${data}`);
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
        let response = await fetch(`${walletUrl}/transactions-construct`, {
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

        const response = await fetch(`${walletUrl}/transactions-sign`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                passphrase: targetAcc.password ,
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
        const response = await fetch(`${walletUrl}/transactions-submit`, {
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

    response.json(resp);
    return data;
};

module.exports = { processTransaction, transfer };