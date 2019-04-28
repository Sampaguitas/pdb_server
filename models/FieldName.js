const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const FieldNameSchema = new Schema({
    align: {
        type: String,
    },
    edit: {
        type: Boolean,
    },
    forSelect:{
        type: Number,
    },
    forShow: {
        type: Number,
    },
    screen: {
        type: Number,
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

module.exports = FieldName = mongoose.model('fieldnames',FieldNameSchema);