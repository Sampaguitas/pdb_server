const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const CurrencySchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = Currency = mongoose.model('currencies',CurrencySchema);