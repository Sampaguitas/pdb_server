const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocFlowSchema = new Schema({
    predecessor: {
        type: Number,
    },
    predecessorPos: {
        type: Number,
    },
    predecessorType: {
        type: String,
    },
    daveId: {
        type: Number,
    }
});

module.exports = DocFlow = mongoose.model('docflows',DocFlowSchema);