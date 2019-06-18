const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const FieldNameSchema = new Schema({
    _id: {
        type: mongoose.SchemaTypes.ObjectId
    },
    align: {
        type: String,
        default: 'left',
    },
    edit: {
        type: Boolean,
        default: false,
    },
    forSelect:{
        type: Number,
    },
    forShow: {
        type: Number,
    },
    screenId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'screens' 
    },
    fieldId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'fields'     
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'         
    },
    daveId: {
        type: Number,
    }
});

module.exports = FieldName = mongoose.model('fieldnames',FieldNameSchema);