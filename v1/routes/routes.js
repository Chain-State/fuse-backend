
const express = require('express');
const {REGISTER, PURCHASE, TRANSFER, PAYMENT} = require('../../constants/api-strings')
const {register} = require('../../controllers/account');
const { buy, transferAssets, makePayment } = require('../../controllers/transaction');

const v1Router = express.Router();


v1Router.post(REGISTER,register);
v1Router.post(PURCHASE,buy);
v1Router.post(TRANSFER, transferAssets);
v1Router.post(PAYMENT, makePayment);


module.exports = v1Router;

