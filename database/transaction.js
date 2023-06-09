const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export const TRANSACTION_CATEGORY = Object.freeze({
   BUY:      { name: "buy"},
   PAYMENT:  { name: "payment"},
   SWAP:     { name: "swap"}
 });

const TransactionSchema = new Schema({
 account: {
    type: String,
    required: true,
 },
 assetType: {
    type: String,
    required: true,
 },
 quantity: {
    type: String,
    required: true,
 },
 paymentAmount: {
    type: String, 
    required: true
 },
 paymentConfirmation: {
   type: Object,
   default: {},
 },
 transactionType: {
   type: TRANSACTION_CATEGORY,
   default: {},
 }
});

module.exports = mongoose.model('Transaction', TransactionSchema);