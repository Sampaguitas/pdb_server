const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocDefSchema = new Schema({
    // _id: {
    //     type: mongoose.SchemaTypes.ObjectId,
    // },
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
    row1: {
        type: Number,
    },
    col1: {
        type: Number,
    },
    grid: {
        type: Boolean,
        default: false,
    },
    worksheet1: {
        type: String,
    },
    worksheet2: {
        type: String,
    },
    row2: {
        type: Number,
    },
    col2: {
        type: Number,
    },
    doctypeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'doctypes'
    },
    projectId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'     
    },
    daveId: {
        type: Number,
    }
});

DocDefSchema.virtual("doctypes", {
    ref: "doctypeId",
    localField: "doctypeId",
    foreignField: "_id",
    justOne: true
});

DocDefSchema.virtual("name").get(function (){
    return this.description + ' (' + this.code + ')'; 
})

DocDefSchema.set('toJSON', { virtuals: true });

module.exports = DocDef = mongoose.model('docdefs',DocDefSchema);