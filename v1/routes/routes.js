
const express = require('express');
const {REGISTER, PURCHASE} = require('../../constants/api-strings')
const {register} = require('../../controllers/account-controller');
const { buy } = require('../../controllers/transaction');

const v1Router = express.Router();


v1Router.post(REGISTER,register);
v1Router.post(PURCHASE,buy);


module.exports = v1Router;

