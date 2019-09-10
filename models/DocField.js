const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocFieldSchema = new Schema({
    location: {
        type: String,
        required: true,
    },
    row: {
        type: Number,
        required: true
    },
    col: {
        type: Number,
        required: true
    },
    grid: {
        type: Boolean
    },
    param: {
        type: String 
    },
    worksheet: {
        type: String
    },
    docdefId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'docdefs',
        required: true
    },
    fieldId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'fields',
        required: true
    },
    projectId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true    
    },
    daveId: {
        type: Number,
    }
});

DocFieldSchema.virtual("fields", {
    ref: "fields",
    localField: "fieldId",
    foreignField: "_id",
    justOne: true
});

DocFieldSchema.set('toJSON', { virtuals: true });

module.exports = DocField = mongoose.model('docfields',DocFieldSchema);