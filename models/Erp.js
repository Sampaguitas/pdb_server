const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ErpSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = Erp = mongoose.model('erps',ErpSchema);