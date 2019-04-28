const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ColliTypeSchema = new Schema({
    type: {
        type: String
    },
    length: {
        type: Number
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    pkWeight: {
        type: Number
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    },
    daveId: {
        type: Number,
    }
});

module.exports = ColliType = mongoose.model('collitypes', ColliTypeSchema);