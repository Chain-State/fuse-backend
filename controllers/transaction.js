const { CLIENT_ERROR, REQUIRED_INPUT, SERVER_ERROR, RESPONSE_OK } = require('../constants/api-strings');
const {processTransaction} = require('../services/transaction');

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

    module.exports = { buy }

