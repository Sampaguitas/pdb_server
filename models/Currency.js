const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const currencySchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = currency = mongoose.model('currencies',currencySchema);