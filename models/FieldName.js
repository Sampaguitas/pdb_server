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
    fieldId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'fields'     
    },
    daveId: {
        type: Number,
    }
});

module.exports = FieldName = mongoose.model('fieldnames',FieldNameSchema);