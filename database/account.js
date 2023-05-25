const {randomUUID} = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const WalletSchema = new Schema({
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    assets: {
        type: Object,
        default: {},
    },
    balance: {
        type: Object,
        default: {},
    }

});


const accountSchema = new Schema(
    {
        uuid: {
            type: String,
            default: () => randomUUID() 
        },
        emailAddress: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        dateOfBirth: {
            type: String,
            required: true,
        },
        idNumber: {
            type: String,
            required: true,
        },
        wallet: {
            type: WalletSchema,
            default: {},
        }
    },
        {timestamps: true},
);
module.exports = mongoose.model('account', accountSchema);