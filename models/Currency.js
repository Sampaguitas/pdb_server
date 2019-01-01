const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const CurrencySchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = Currency = mongoose.model('currencies',CurrencySchema);