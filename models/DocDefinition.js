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
        type: String,
    },
    col: {
        type: String,
    },
    grid: {
        type: String,
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
    row2: {
        type: String,
    },
    col2: {
        type: String,
    },
    type: {
        type: String,
    },
    fieldId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'fields'     
    },
    projectId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'     
    },
    daveId: {
        type: Number,
    }
});

module.exports = DocDefinition = mongoose.model('docdefinitions',DocDefinitionSchema);