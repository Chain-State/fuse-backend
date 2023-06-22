const express = require("express");
const {
  REGISTER,
  PURCHASE,
  TRANSFER,
  GET_ASSETS,
  TX_COMPLETE,
  TRANSACTIONS_LIST,
} = require("../../constants/api-strings");
const { register } = require("../../controllers/account");
const {
  buy,
  transferAssets,
  getAssets,
  confirmTxComplete,
  getTransactionsList
} = require("../../controllers/transaction");

const v1Router = express.Router();

v1Router.post(REGISTER, register);
v1Router.get(GET_ASSETS, getAssets);
v1Router.post(PURCHASE, buy);
v1Router.post(TRANSFER, transferAssets);
v1Router.post(TX_COMPLETE, confirmTxComplete);
v1Router.get(TRANSACTIONS_LIST, getTransactionsList);

module.exports = v1Router;
