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
    },
    type:{
        type: String,
    },
    fromTbl: {
        type: String,
    },
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    },
});

module.exports = Field = mongoose.model('fields',FieldSchema);