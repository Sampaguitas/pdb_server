const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const IncotermSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = Incoterm = mongoose.model('incoterms',IncotermSchema);