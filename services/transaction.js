import fetch from "node-fetch";
import url from "url";
import * as dotenv from 'dotenv';
import transaction from "../database/transaction";

dotenv.config();

const callbackString = 'https://59dfdd5ebb0249.lhr.life/andr-tandaa/us-central1/transferAssets';
const MPESA_AUTH_TOKEN = 'rgGMe8hrGQZKH4iREC2Por2jAyRQ';
const CW_SERVER = 'http://13.36.39.234:8090/v2/wallets/1299b5d429f8a79abc507ea6b906b16afb0a3625';
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
    AccountReference: "{{$randomUUID}}",
    TransactionDesc: "B-600ADA"
}

const processTransaction = async (transactionDetails) => {

    // const headers = new Headers();
    // headers.append("Content-Type", "application/json");
    // headers.append("Authorization", "Bearer " + MPESA_AUTH_TOKEN);
    const { userUuid, assetType, quantity, paymentAmount } = transactionDetails;
    try {
        added = await transaction.create({
            userUuid: userUuid,
            assetType: assetType,
            quantity: quantity,
            paymentAmount: paymentAmount,
        });
    } catch (error) {
        console.log(`Transaction failed: ${error}`);
    }
    PaymentRequest.CallBackURL = callbackString + "?id=" + userUuid;
    const txBody = {
        ...body,
        paymentRequest: PaymentRequest,
    };
    await docRef.set(txBody);
    console.log(`Added transaction with Id: ${JSON.stringify(docRef.id)}`);
    const paymentRequestData = await requestPayment(headers, txBody);
    if (paymentRequestData) {
        docRef = firestore.doc(`transactions/${docRef.id}`);
        await docRef.update({
            paymentRequestResponse: paymentRequestData,
        });
        response.json(paymentRequestData);
    } else {
        throw new Error('Some error occurred in payment processing...')
    }
}

const requestPayment = async (headers, txBody) => {
    console.log(headers);
    console.log(JSON.stringify(txBody));
    try {
        const payRequestResponse = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                method: 'POST',
                headers,
                body: JSON.stringify(txBody.paymentRequest),
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
const fulfilTransfer = async () => {
    const transactionId = url.parse(request.url, true).query.id;
    let paymentConfirmation = request.body;
    paymentConfirmation = {
        transactionId: transactionId,
        ...paymentConfirmation,
    };

    console.log(`transactionId=${transactionId}`);
    const walletUrl = CW_SERVER;
    let assetData;
    try {
        const transactionsRef = firestore.collection('transactions').doc(transactionId);
        const tx = await transactionsRef.get();
        console.log(`tx doc ${JSON.stringify(tx.data())}`);
        if (!tx.exists) {
            throw new Error(`Transaction with id ${transactionId} not found`);
        } else {
            assetData = tx.data();
        }
    } catch (error) {
        console.log(error);
    }
    const { address, tokenQuantity } = assetData;
    let data = null;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const details = {
        payments: [
            {
                address: address,
                amount: { quantity: parseFloat(tokenQuantity), unit: "lovelace" },
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
        const response = await fetch(`${walletUrl}/transactions-sign`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                passphrase: "testpassword",
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

module.exports = {processTransaction, fulfilTransfer};