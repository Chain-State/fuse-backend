
const express = require('express');
const {INDEX} = require('../../constants/APIStrings')

const v1Router = express.Router();

v1Router.get(INDEX, (req, res) => {
    res.send('Setup works!');
});

module.exports = v1Router;

