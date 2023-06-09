const { CLIENT_ERROR, REQUIRED_INPUT, SERVER_ERROR, RESPONSE_OK } = require('../constants/api-strings');
const {processTransaction, transfer, requestPayment} = require('../services/transaction');

const buy = async (request, response) => {
    const {userUuid, assetType, tokenQuantity, paymentAmount} = request.body;
    if(!userUuid || !assetType || !tokenQuantity || !paymentAmount) {
        return response.status(CLIENT_ERROR).json({
            data: {
                error: REQUIRED_INPUT,
            }
        });
    }
        try{
            const txStatus = await processTransaction({userUuid, assetType, tokenQuantity, paymentAmount});
            if(txStatus){
                return response.status(RESPONSE_OK).json({
                    data: {
                        txStatus: txStatus,
                    }
                })
            }
        } catch(error){
            console.log(`Error ${error}`);
            return response.status(SERVER_ERROR).json({
                data: {
                    error: error,
                }
            })
        }
    }


    const transferAssets = async (request, response) => {
       //TODO: This should only be called from an MPESA service...validate white-listed IP
       const result = await transfer(request);
       return response.json(result);
    }

    // const makePayment = async (request, response) => {
    //     const {userUuid, assetType, tokenQuantity, paymentAmount} = request.body;
    //     if(!userUuid || !assetType || !tokenQuantity || !paymentAmount || !exchangeRate || !payee) {
    //         return response.status(CLIENT_ERROR).json({
    //             data: {
    //                 error: REQUIRED_INPUT,
    //             }
    //         });
    //     }

    //     try {
    //         // This is where the transfer of asset from user wallet to main wallet occurs 
    //         const result = await transfer(request);
    //         return response.json(result);

    //         // After the response from the cardano wallet, make the mpesa transaction
    //         const mpesaResponse = await requestPayment()

    //     } catch(error){
    //         console.log(`Error ${error}`);
    //         return response.status(SERVER_ERROR).json({
    //             data: {
    //                 error: error,
    //             }
    //         })
    //     }
        
    // }

    module.exports = { buy, transferAssets, makePayment }

