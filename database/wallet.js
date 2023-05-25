const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema({
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



module.exports = mongoose.model('wallet', walletSchema);