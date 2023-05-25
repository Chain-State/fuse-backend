const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeyManagementSchema = new Schema({
    owner: {
        type: String,
        required: true,
    },
    seed: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        default: '',
    }
},
{timestamps: true},
);

module.exports = mongoose.model('keyManage', KeyManagementSchema);