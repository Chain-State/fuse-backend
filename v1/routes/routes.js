
const express = require('express');
const {REGISTER, PURCHASE, TRANSFER} = require('../../constants/api-strings')
const {register} = require('../../controllers/account-controller');
const { buy, transferAssets } = require('../../controllers/transaction');

const v1Router = express.Router();


v1Router.post(REGISTER,register);
v1Router.post(PURCHASE,buy);
v1Router.post(TRANSFER, transferAssets);


module.exports = v1Router;

