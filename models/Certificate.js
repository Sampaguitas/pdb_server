const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const CertificateSchema = new Schema({
    cif: {
        type: String,
    },
    heatNr: {
        type: String,
    },
    udfCtX1: {
        type: String,
    },
    udfCtX2: {
        type: String,
    },
    udfCtX3: {
        type: String,
    },
    udfCtX4: {
        type: String,
    },
    udfCtX5: {
        type: String,
    },
    udfCtX6: {
        type: String,
    },
    udfCtX7: {
        type: String,
    },
    udfCtX8: {
        type: String,
    },
    udfCtX9: {
        type: String,
    },
    udfCtX10: {
        type: String,
    },
    udfCt91: {
        type: Number,
    },
    udfCt92: {
        type: Number,
    },
    udfCt93: {
        type: Number,
    },
    udfCt94: {
        type: Number,
    },
    udfCt95: {
        type: Number,
    },
    udfCt96: {
        type: Number,
    },
    udfCt97: {
        type: Number,
    },
    udfCt98: {
        type: Number,
    },
    udfCt99: {
        type: Number,
    },
    udfCt910: {
        type: Number,
    },
    udfCtD1: {
        type: Date,
    },
    udfCtD2: {
        type: Date,
    },
    udfCtD3: {
        type: Date,
    },
    udfCtD4: {
        type: Date,
    },
    udfCtD5: {
        type: Date,
    },
    udfCtD6: {
        type: Date,
    },
    udfCtD7: {
        type: Date,
    },
    udfCtD8: {
        type: Date,
    },
    udfCtD9: {
        type: Date,
    },
    udfCtD10: {
        type: Date,
    },
    subId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'subs'
    },
    daveId: {
        type: Number,
    }
});

module.exports = Certificate = mongoose.model('certificates', CertificateSchema);