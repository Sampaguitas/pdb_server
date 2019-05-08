const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ScreenSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    daveId: {
        type: Number,
    }
});

module.exports = Screen = mongoose.model('screens',ScreenSchema);