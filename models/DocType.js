const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocTypeSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
    }
});

module.exports = DocType = mongoose.model('doctypes', DocTypeSchema);