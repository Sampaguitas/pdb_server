const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const FieldSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    custom: {
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    fromTbl: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    },
    daveId: {
        type: Number,
    }
});

module.exports = Field = mongoose.model('fields',FieldSchema);