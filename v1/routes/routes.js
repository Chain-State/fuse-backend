const express = require("express");
const {
  REGISTER,
  PURCHASE,
  TRANSFER,
  GET_ASSETS,
} = require("../../constants/api-strings");
const { register } = require("../../controllers/account");
const {
  buy,
  transferAssets,
  getAssets,
} = require("../../controllers/transaction");

const v1Router = express.Router();

v1Router.post(REGISTER, register);
v1Router.get(GET_ASSETS, getAssets);
v1Router.post(PURCHASE, buy);
v1Router.post(TRANSFER, transferAssets);

module.exports = v1Router;
