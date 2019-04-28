const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const LocaleSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = Locale = mongoose.model('locales',LocaleSchema);