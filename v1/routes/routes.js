
const express = require('express');
const {INDEX, REGISTER} = require('../../constants/api-strings')
const {register} = require('../../controllers/account-controller');

const v1Router = express.Router();


v1Router.post(REGISTER,register);


module.exports = v1Router;

