const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const FieldNameSchema = new Schema({
    // _id: {
    //     type: mongoose.SchemaTypes.ObjectId
    // },
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

FieldNameSchema.virtual("fields", {
    ref: "fields",
    localField: "fieldId",
    foreignField: "_id",
    justOne: true
});

FieldNameSchema.set('toJSON', { virtuals: true });

module.exports = FieldName = mongoose.model('fieldnames',FieldNameSchema);