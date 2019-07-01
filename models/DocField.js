const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocFieldSchema = new Schema({
    location: {
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
    worksheet: {
        type: String,
    },
    docdefId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'docdefs'
    },
    fieldId: {
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

module.exports = DocField = mongoose.model('docfields',DocFieldSchema);