const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const RegionSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = Region = mongoose.model('regions',RegionSchema);