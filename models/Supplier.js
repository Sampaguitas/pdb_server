const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const SupplierSchema = new Schema({
    name: {
        type: String,
    },
    registeredName: {
        type: String,
    },
    contact: {
        type: String,
    },
    position: {
        type: String,
    },
    tel: {
        type: String,
    },
    fax: {
        type: String,
    },
    mail:{
        type: String,
    },
    address:{
        type: String,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    udfSpX1: {
        type: String,
    },
    udfSpX2: {
        type: String,
    },
    udfSpX3: {
        type: String,
    },
    udfSpX4: {
        type: String,
    },
    udfSpX5: {
        type: String,
    },
    udfSpX6: {
        type: String,
    },
    udfSpX7: {
        type: String,
    },
    udfSpX8: {
        type: String,
    },
    udfSpX9: {
        type: String,
    },
    udfSpX10: {
        type: String,
    },
    udfSp91: {
        type: Number,
    },
    udfSp92: {
        type: Number,
    },
    udfSp93: {
        type: Number,
    },
    udfSp94: {
        type: Number,
    },
    udfSp95: {
        type: Number,
    },
    udfSp96: {
        type: Number,
    },
    udfSp97: {
        type: Number,
    },
    udfSp98: {
        type: Number,
    },
    udfSp99: {
        type: Number,
    },
    udfSp910: {
        type: Number,
    },
    udfSpD1: {
        type: Date,
    },
    udfSpD2: {
        type: Date,
    },
    udfSpD3: {
        type: Date,
    },
    udfSpD4: {
        type: Date,
    },
    udfSpD5: {
        type: Date,
    },
    udfSpD6: {
        type: Date,
    },
    udfSpD7: {
        type: Date,
    },
    udfSpD8: {
        type: Date,
    },
    udfSpD9: {
        type: Date,
    },
    udfSpD10: {
        type: Date,
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'
    },
    daveId: {
        type: Number,
    }
});

module.exports = Supplier = mongoose.model('suppliers', SupplierSchema);