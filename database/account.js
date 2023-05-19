const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema(
    {
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
    },
        {timestamps: true},
);
module.exports = mongoose.model('account', accountSchema);