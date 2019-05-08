const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const FieldNameSchema = new Schema({
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
    screen: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'screens' 
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