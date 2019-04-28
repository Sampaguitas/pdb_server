const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocDefinitionSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    field: {
        type: String,
    },
    description: {
        type: String,
    },
    row: {
        type: Number,
    },
    col: {
        type: Number,
    },
    grid: {
        type: Boolean,
    },
    param: {
        type: String,
    },
    worksheet1: {
        type: String,
    },
    worksheet2: {
        type: String,
    },
    row1: {
        type: String,
    },
    row2: {
        type: String,
    },
    type: {
        type: String,
    },
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    },
    field:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'fields'     
    }
});

module.exports = DocDefinition = mongoose.model('docdefinitions',DocDefinitionSchema);