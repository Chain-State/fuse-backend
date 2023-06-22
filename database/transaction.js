const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
 }},
 {timestamps: true}
);

module.exports = mongoose.model('Transaction', TransactionSchema);