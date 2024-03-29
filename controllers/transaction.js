const { response } = require("express");
const {
  CLIENT_ERROR,
  REQUIRED_INPUT,
  SERVER_ERROR,
  RESPONSE_OK,
  ERR_ACCESS_TOKEN_FETCH,
  ERR_FETCH_USER_WALLET,
} = require("../constants/api-strings");
const {
  processTransaction,
  transfer,
  walletAssets,
  paymentConfirmation,
  transactionsList,
} = require("../services/transaction");

const getAssets = async (request, response) => {
  const url = request.url;
  if (!url) {
    throw new Error(`Failed getting assets ${REQUIRED_INPUT}`);
  }
  const uuid = url.substring(url.indexOf("/", 1) + 1);
  //query databasefor this user and get the wallet id.
  const assetsData = await walletAssets(uuid);
  if (!assetsData) {
    response.status(SERVER_ERROR).json({
      error: ERR_FETCH_USER_WALLET,
    });
  }
  response.json(assetsData);
  console.log(assetsData);
};

const buy = async (request, response) => {
  const { userUuid, assetType, tokenQuantity, paymentAmount } = request.body;
  if (!userUuid || !assetType || !tokenQuantity || !paymentAmount) {
    return response.status(CLIENT_ERROR).json({
      data: {
        error: REQUIRED_INPUT,
      },
    });
  }
  try {
    const txStatus = await processTransaction({
      userUuid,
      assetType,
      tokenQuantity,
      paymentAmount,
    });
    if (txStatus) {
      return response.status(RESPONSE_OK).json({
        data: {
          txStatus: txStatus,
        },
      });
    }
  } catch (error) {
    console.log(`Error ${error}`);
    return response.status(SERVER_ERROR).json({
      data: {
        error: error,
      },
    });
  }
};

const transferAssets = async (request, response) => {
  //TODO: This should only be called from an MPESA service...validate white-listed IP
  const result = await transfer(request);
  return response.json(result);
};

const confirmTxComplete = async (request, response) => {
const {account, requestId} = request.body;
console.log(`Acc: ${account}, RequestId: ${requestId}`);
  const result  = await paymentConfirmation({account: account, requestId: requestId});
  return response.json(result);
}

const getTransactionsList = async (request, response) => {
  if(request.url){
  let account = request.url;
    account = account.substring(account.lastIndexOf('/',   ) + 1);
    const results = await transactionsList(account);
    console.log(results);
    response.json(results)

  }
}

module.exports = { getAssets, buy, transferAssets, confirmTxComplete, getTransactionsList };
