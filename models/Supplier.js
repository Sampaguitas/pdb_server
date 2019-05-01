const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const SupplierSchema = new Schema({
    name: {
        type: String,
    },
    registeredName: {
        type: String,
        default:''
    },
    contact: {
        type: String,
        default:''
    },
    position: {
        type: String,
        default:''
    },
    tel: {
        type: String,
        default:''
    },
    fax: {
        type: String,
        default:''
    },
    mail:{
        type: String,
        default:''
    },
    address:{
        type: String,
        default:''
    },
    city: {
        type: String,
        default:''
    },
    country: {
        type: String,
        default:''
    },
    udfSpX1: {
        type: String,
        default:''
    },
    udfSpX2: {
        type: String,
        default:''
    },
    udfSpX3: {
        type: String,
        default:''
    },
    udfSpX4: {
        type: String,
        default:''
    },
    udfSpX5: {
        type: String,
        default:''
    },
    udfSpX6: {
        type: String,
        default:''
    },
    udfSpX7: {
        type: String,
        default:''
    },
    udfSpX8: {
        type: String,
        default:''
    },
    udfSpX9: {
        type: String,
        default:''
    },
    udfSpX10: {
        type: String,
        default:''
    },
    udfSp91: {
        type: Number,
        default: null
    },
    udfSp92: {
        type: Number,
        default: null
    },
    udfSp93: {
        type: Number,
        default: null
    },
    udfSp94: {
        type: Number,
        default: null
    },
    udfSp95: {
        type: Number,
        default: null
    },
    udfSp96: {
        type: Number,
        default: null
    },
    udfSp97: {
        type: Number,
        default: null
    },
    udfSp98: {
        type: Number,
        default: null
    },
    udfSp99: {
        type: Number,
        default: null
    },
    udfSp910: {
        type: Number,
        default: null
    },
    udfSpD1: {
        type: Date,
        default: null
    },
    udfSpD2: {
        type: Date,
        default: null
    },
    udfSpD3: {
        type: Date,
        default: null
    },
    udfSpD4: {
        type: Date,
        default: null
    },
    udfSpD5: {
        type: Date,
        default: null
    },
    udfSpD6: {
        type: Date,
        default: null
    },
    udfSpD7: {
        type: Date,
        default: null
    },
    udfSpD8: {
        type: Date,
        default: null
    },
    udfSpD9: {
        type: Date,
        default: null
    },
    udfSpD10: {
        type: Date,
        default: null
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'
    },
    daveId: {
        type: Number,
        default: null
    }
});

module.exports = Supplier = mongoose.model('suppliers', SupplierSchema);